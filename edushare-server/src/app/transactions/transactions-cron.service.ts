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
   * Cron Job tự động chạy mỗi 30 phút một lần
   */
  @Cron(CronExpression.EVERY_30_MINUTES)
  async handleAutoDisbursement() {
    this.logger.log('--- Bắt đầu quét hệ thống ví treo tìm giao dịch quá hạn 48h ---')
    await this.autoDisburseExpiredProofs()
    await this.autoRefundIgnoredRequests()
    this.logger.log('--- Hoàn tất phiên quét hệ thống tự động ---')
  }

  /**
   * [Sweep 1] Tự động giải ngân các giao dịch PROOF_SUBMITTED quá 48h mà user chưa confirm
   */
  private async autoDisburseExpiredProofs() {
    let expiredTransactions: TransactionDocument[]
    try {
      expiredTransactions = await this.transactionModel.find({
        status: EscrowStatus.PROOF_SUBMITTED,
        expiresAt: { $lte: new Date() },
      })
    } catch (error) {
      this.logger.error(
        `[Sweep 1] Lỗi khi query giao dịch quá hạn: ${error instanceof Error ? error.message : String(error)}`,
      )
      return
    }

    if (expiredTransactions.length === 0) {
      this.logger.log('[Sweep 1] Không có giao dịch PROOF_SUBMITTED quá hạn.')
      return
    }

    this.logger.log(`[Sweep 1] Phát hiện ${expiredTransactions.length} giao dịch cần tự động giải ngân.`)

    for (const transaction of expiredTransactions) {
      const session = await this.connection.startSession()
      session.startTransaction()

      try {
        const price = transaction.amount
        const group = await this.groupModel.findById(transaction.groupId).session(session)
        if (!group) {
          throw new Error(`Không tìm thấy Nhóm cho giao dịch ${String(transaction._id)}`)
        }

        const ownerObjectId = group.ownerId as unknown as Types.ObjectId

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

        // Chính thức thêm thành viên vào nhóm
        group.members.push(transaction.senderId as unknown as (typeof group.members)[number])
        group.occupiedSlots += 1
        if (group.occupiedSlots >= group.totalSlots) {
          group.status = GroupStatus.FULL
        }
        await group.save({ session })

        transaction.status = EscrowStatus.COMPLETED
        await transaction.save({ session })

        await session.commitTransaction()
        this.logger.log(`[Sweep 1] Tự động giải ngân thành công cho giao dịch ID: ${String(transaction._id)}`)

        // Thông báo sau khi commit - fire-and-forget
        this.notificationsService
          .createNotification(
            transaction.senderId,
            'Giao dịch đã được tự động hoàn tất',
            `Hệ thống đã tự động xác nhận bạn gia nhập nhóm [${group.name}] sau 48h không có phản hồi. Chúc bạn trải nghiệm vui vẻ!`,
            'transaction',
          )
          .catch((err) => this.logger.error(`[Sweep 1] Failed to notify member: ${err.message}`))

        this.notificationsService
          .createNotification(
            ownerObjectId,
            'Tiền đã được giải ngân tự động',
            `Hệ thống đã tự động giải ngân ${price.toLocaleString()}đ vào ví của bạn cho nhóm [${group.name}] sau 48h thành viên không phản hồi.`,
            'transaction',
          )
          .catch((err) => this.logger.error(`[Sweep 1] Failed to notify owner: ${err.message}`))
      } catch (error) {
        await session.abortTransaction()
        this.logger.error(
          `[Sweep 1] Lỗi khi tự động giải ngân giao dịch ${String(transaction._id)}:`,
          error instanceof Error ? error.message : String(error),
        )
      } finally {
        session.endSession()
      }
    }
  }

  /**
   * [Sweep 2] Tự động hoàn tiền các giao dịch HELD_IN_ESCROW quá 48h mà owner không approve
   * => Tránh tiền user bị kẹt vô thời hạn
   */
  private async autoRefundIgnoredRequests() {
    let ignoredTransactions: TransactionDocument[]
    try {
      ignoredTransactions = await this.transactionModel.find({
        status: EscrowStatus.HELD_IN_ESCROW,
        expiresAt: { $lte: new Date() },
      })
    } catch (error) {
      this.logger.error(
        `[Sweep 2] Lỗi khi query giao dịch bị bỏ qua: ${error instanceof Error ? error.message : String(error)}`,
      )
      return
    }

    if (ignoredTransactions.length === 0) {
      this.logger.log('[Sweep 2] Không có giao dịch HELD_IN_ESCROW quá hạn.')
      return
    }

    this.logger.log(`[Sweep 2] Phát hiện ${ignoredTransactions.length} giao dịch bị owner bỏ qua, tiến hành hoàn tiền.`)

    for (const transaction of ignoredTransactions) {
      const session = await this.connection.startSession()
      session.startTransaction()

      try {
        const price = transaction.amount

        // Hoàn tiền: trừ frozenBalance, cộng lại balance cho user
        await this.walletModel.findOneAndUpdate(
          { userId: transaction.senderId },
          { $inc: { frozenBalance: -price, balance: price } },
          { session },
        )

        transaction.status = EscrowStatus.REFUNDED
        await transaction.save({ session })

        await session.commitTransaction()
        this.logger.log(`[Sweep 2] Hoàn tiền thành công cho giao dịch ID: ${String(transaction._id)}`)

        // Thông báo cho user sau khi hoàn tiền - fire-and-forget
        this.notificationsService
          .createNotification(
            transaction.senderId,
            'Yêu cầu tham gia nhóm đã hết hạn',
            `Chủ nhóm không phê duyệt yêu cầu của bạn trong 48h. Hệ thống đã hoàn lại ${price.toLocaleString()}đ vào ví của bạn.`,
            'transaction',
          )
          .catch((err) => this.logger.error(`[Sweep 2] Failed to notify member: ${err.message}`))
      } catch (error) {
        await session.abortTransaction()
        this.logger.error(
          `[Sweep 2] Lỗi khi hoàn tiền giao dịch ${String(transaction._id)}:`,
          error instanceof Error ? error.message : String(error),
        )
      } finally {
        session.endSession()
      }
    }
  }
}
