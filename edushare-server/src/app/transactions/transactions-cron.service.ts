// src/app/transactions/transactions-cron.service.ts
import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InjectModel, InjectConnection } from '@nestjs/mongoose'
import { Model, Connection, Types } from 'mongoose'
import { Transaction, TransactionDocument } from './schemas/transaction.schema'
import { Wallet, WalletDocument } from '../wallets/schemas/wallet.schema'
import { Group, GroupDocument, GroupStatus } from '../groups/entities/group.entity'
import { EscrowStatus } from './enums/escrow-status.enum'
import { NotificationsService } from '../notifications/notification.service'

@Injectable()
export class TransactionsCronService {
  private readonly logger = new Logger(TransactionsCronService.name)

  constructor(
    @InjectConnection() private readonly connection: Connection,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Cron Job tự động chạy mỗi 30 phút một lần để quét giải ngân tiền quá hạn 48h
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleAutoDisbursement() {
    this.logger.log('--- Bắt đầu quét hệ thống ví treo tìm giao dịch quá hạn 48h ---')

    // Outer try-catch: bảo vệ query ban đầu, tránh crash cron nếu DB lỗi
    let expiredTransactions: TransactionDocument[]
    try {
      expiredTransactions = await this.transactionModel.find({
        status: EscrowStatus.PROOF_SUBMITTED,
        expiresAt: { $lte: new Date() },
      })
    } catch (error) {
      this.logger.error(`Lỗi khi query giao dịch quá hạn: ${error instanceof Error ? error.message : String(error)}`)
      return
    }

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
          // Throw để catch xử lý abort đồng nhất, tránh double-abort
          throw new Error(`Không tìm thấy Nhóm cho giao dịch ${String(transaction._id)}`)
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
          group.status = GroupStatus.FULL
        }
        await group.save({ session })

        // 5. Cập nhật trạng thái giao dịch thành COMPLETED
        transaction.status = EscrowStatus.COMPLETED
        await transaction.save({ session })

        await session.commitTransaction()
        this.logger.log(`Tự động giải ngân thành công cho giao dịch ID: ${String(transaction._id)}`)

        // Gửi thông báo SAU KHI commit - fire-and-forget
        this.notificationsService
          .createNotification(
            transaction.senderId,
            'Giao dịch đã được tự động hoàn tất',
            `Hệ thống đã tự động xác nhận bạn gia nhập nhóm [${group.name}] sau 48h không có phản hồi. Chúc bạn trải nghiệm vui vẻ!`,
            'transaction',
          )
          .catch((err) => this.logger.error(`Failed to notify member: ${err.message}`))

        this.notificationsService
          .createNotification(
            ownerObjectId,
            'Tiền đã được giải ngân tự động',
            `Hệ thống đã tự động giải ngân ${price.toLocaleString()}đ vào ví của bạn cho nhóm [${group.name}] sau 48h thành viên không phản hồi.`,
            'transaction',
          )
          .catch((err) => this.logger.error(`Failed to notify owner: ${err.message}`))
      } catch (error) {
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
