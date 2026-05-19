// src/app/transactions/transactions-cron.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection, Types } from 'mongoose'
import { Transaction, TransactionDocument } from './schemas/transaction.schema'
import { Wallet, WalletDocument } from '../wallets/schemas/wallet.schema'
import { Group, GroupDocument, GroupStatus } from '../groups/entities/group.entity'
import { EscrowStatus } from './enums/escrow-status.enum'

@Injectable()
export class TransactionsCronService {
  private readonly logger = new Logger(TransactionsCronService.name)

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  /**
   * Cron Job tự động chạy mỗi 30 phút một lần để quét giải ngân tiền quá hạn 48h
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleAutoDisbursement() {
    this.logger.log('--- Bắt đầu quét hệ thống ví treo tìm giao dịch quá hạn 48h ---')

    // 1. Tìm tất cả các giao dịch đã nộp minh chứng (proof) VÀ đã quá thời gian chờ (expiresAt <= hiện tại)
    const expiredTransactions = await this.transactionModel.find({
      status: EscrowStatus.PROOF_SUBMITTED,
      expiresAt: { $lte: new Date() }, // Nhỏ hơn hoặc bằng thời gian hiện tại
    })

    if (expiredTransactions.length === 0) {
      this.logger.log('Không có giao dịch nào quá hạn. Kết thúc phiên quét.')
      return
    }

    this.logger.log(`Phát hiện ${expiredTransactions.length} giao dịch quá hạn cần tự động giải ngân.`)

    // 2. Duyệt qua từng giao dịch để xử lý độc lập (Dùng vòng lặp an toàn)
    for (const transaction of expiredTransactions) {
      const session = await this.connection.startSession()
      session.startTransaction()

      try {
        const price = transaction.amount

        // Lấy thông tin nhóm để biết ai là Chủ nhóm (Owner)
        const group = await this.groupModel.findById(transaction.groupId).session(session)
        if (!group) {
          this.logger.error(`Giao dịch ${String(transaction._id)} bị lỗi: Không tìm thấy Nhóm.`)
          await session.abortTransaction()
          continue // Bỏ qua giao dịch lỗi này, chuyển sang giao dịch tiếp theo
        }

        const ownerObjectId = group.ownerId as unknown as Types.ObjectId

        // 3. THỰC HIỆN ĐIỀU CHUYỂN DÒNG TIỀN (Giống logic Member tự bấm confirm)
        // Trừ tiền đóng băng của người mua
        await this.walletModel.findOneAndUpdate(
          { userId: transaction.senderId },
          { $inc: { frozenBalance: -price } },
          { session },
        )

        // Cộng tiền sạch vào tài khoản khả dụng của Chủ nhóm
        await this.walletModel.findOneAndUpdate(
          { userId: ownerObjectId },
          { $inc: { balance: price } },
          { session, upsert: true },
        )

        // 4. CHÍNH THỨC THÊM THÀNH VIÊN VÀO NHÓM
        group.members.push(transaction.senderId as unknown as (typeof group.members)[number])
        group.occupiedSlots += 1
        if (group.occupiedSlots >= group.totalSlots) {
          group.status = GroupStatus.FULL // Tự động đóng nhóm nếu hết slot
        }
        await group.save({ session })

        // 5. Cập nhật trạng thái giao dịch thành COMPLETED
        transaction.status = EscrowStatus.COMPLETED
        await transaction.save({ session })

        // Hoàn thành lưu thay đổi cho giao dịch này
        await session.commitTransaction()
        this.logger.log(`Tự động giải ngân thành công cho giao dịch ID: ${String(transaction._id)}`)
      } catch (error) {
        // Nếu một giao dịch bị lỗi mạng/lag, hủy bỏ giao dịch đó để chạy lại lượt sau, không làm sập cả hệ thống Cron
        await session.abortTransaction()
        this.logger.error(
          `Lỗi nghiêm trọng khi tự động giải ngân giao dịch ${String(transaction._id)}:`,
          error instanceof Error ? error.message : String(error),
        )
      } finally {
        session.endSession()
      }
    }

    this.logger.log('--- Hoàn tất phiên quét hệ thống tự động giải ngân ---')
  }
}
