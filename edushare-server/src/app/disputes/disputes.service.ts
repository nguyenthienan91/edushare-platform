import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Dispute, DisputeDocument } from './schemas/dispute.schema'
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema'
import { EscrowStatus } from '../transactions/enums/escrow-status.enum'
import { Wallet, WalletDocument } from '../wallets/schemas/wallet.schema'
import { DisputeStatus } from './schemas/dispute.schema'
import { Group, GroupDocument } from '../groups/entities/group.entity'
import { NotificationsService } from '../notifications/notification.service'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'
import { DisputeQueryDto } from './dto/dispute-query.dto'

@Injectable()
export class DisputesService {
  constructor(
    @InjectModel(Dispute.name) private disputeModel: Model<DisputeDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    private readonly notificationsService: NotificationsService,
    private readonly paginationUtilService: PaginationUtilService,
  ) {}

  async getDisputes(query: DisputeQueryDto) {
    const filter: Record<string, unknown> = {}
    if (query.status) filter.status = query.status

    const totalItems = await this.disputeModel.countDocuments(filter).exec()
    const paging = this.paginationUtilService.paging({
      page: query.page,
      itemPerPage: query.itemPerPage,
      totalItems,
    })

    const list = await this.disputeModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .populate('transactionId', 'amount status groupId senderId')
      .populate('raisedById', 'name email')
      .lean()
      .exec()

    return {
      status: 'success',
      message: 'Lấy danh sách tranh chấp thành công.',
      ...this.paginationUtilService.format(list),
    }
  }

  async getDisputeById(disputeId: string) {
    const dispute = await this.disputeModel
      .findById(disputeId)
      .populate('transactionId', 'amount status groupId senderId')
      .populate('raisedById', 'name email')
      .lean()
      .exec()
    if (!dispute) throw new NotFoundException('Dispute not found.')
    return { status: 'success', message: 'Lấy thông tin tranh chấp thành công.', data: dispute }
  }

  async createDispute(userId: string, transactionId: string, reason: string, memberEvidence: string[]) {
    const transaction = await this.transactionModel.findById(transactionId).exec()
    if (!transaction) throw new NotFoundException('Transaction not found.')

    if (transaction.senderId.toString() !== userId) {
      throw new ForbiddenException('You are not the buyer of this transaction and cannot raise a dispute.')
    }

    if (transaction.status !== EscrowStatus.PROOF_SUBMITTED) {
      throw new BadRequestException(
        'This transaction is not in a disputable state. Proof must be submitted before raising a dispute.',
      )
    }

    // Kiểm tra trùng lặp để tránh MongoDB E11000 crash (unique: true trên transactionId)
    const existing = await this.disputeModel.findOne({ transactionId: new Types.ObjectId(transactionId) }).exec()
    if (existing) throw new BadRequestException('A dispute for this transaction already exists.')

    // Lấy thông tin nhóm để xác định Owner
    const group = await this.groupModel.findById(transaction.groupId).exec()
    if (!group) throw new NotFoundException('Group associated with this transaction not found.')
    const ownerObjectId = group.ownerId as unknown as Types.ObjectId

    const newDispute = new this.disputeModel({
      transactionId: new Types.ObjectId(transactionId),
      raisedById: new Types.ObjectId(userId),
      reason,
      memberEvidence,
    })
    await newDispute.save()

    // Đóng băng giao dịch để Cron Job 48h bỏ qua không giải ngân
    transaction.status = EscrowStatus.DISPUTED
    await transaction.save()

    await this.notificationsService.createNotification(
      ownerObjectId,
      'Giao dịch của bạn bị khiếu nại! ⚠️',
      `Thành viên đã khiếu nại giao dịch mua slot với lý do: "${reason}". Vui lòng truy cập trang quản lý để nộp bằng chứng phản biện trong vòng 24h!`,
      'transaction',
    )

    return {
      status: 'success',
      message: 'Đã gửi đơn khiếu nại thành công, giao dịch đã được đóng băng để Admin xử lý.',
    }
  }

  async submitCounterProof(userId: string, disputeId: string, ownerEvidence: string[]) {
    const dispute = await this.disputeModel.findById(disputeId).exec()
    if (!dispute) throw new NotFoundException('Dispute not found.')

    const transaction = await this.transactionModel.findById(dispute.transactionId).exec()
    if (!transaction) throw new NotFoundException('Transaction associated with this dispute not found.')

    // Xác định Owner qua groupId (Transaction không có receiverId)
    const group = await this.groupModel.findById(transaction.groupId).exec()
    const ownerId = group?.ownerId as unknown as Types.ObjectId
    if (!group || ownerId.toString() !== userId) {
      throw new ForbiddenException('You are not the owner of the group involved in this dispute.')
    }

    if (dispute.status !== DisputeStatus.PENDING) {
      throw new BadRequestException('This dispute has already been resolved by an admin.')
    }

    dispute.ownerEvidence = ownerEvidence
    await dispute.save()

    return {
      status: 'success',
      message: 'Tải lên minh chứng đối chất thành công. Vui lòng chờ Admin đưa ra phán quyết.',
    }
  }

  async resolveDisputeByAdmin(disputeId: string, resolution: 'refund' | 'payout') {
    const dispute = await this.disputeModel.findById(disputeId).exec()
    if (!dispute) throw new NotFoundException('Dispute not found.')
    if (dispute.status !== DisputeStatus.PENDING) {
      throw new BadRequestException('This dispute has already been resolved.')
    }

    const transaction = await this.transactionModel.findById(dispute.transactionId).exec()
    if (!transaction) throw new NotFoundException('Transaction not found.')

    // Xác định Owner qua groupId
    const group = await this.groupModel.findById(transaction.groupId).exec()
    if (!group) throw new NotFoundException('Group associated with this transaction not found.')
    const ownerObjectId = group.ownerId as unknown as Types.ObjectId

    const session = await this.disputeModel.db.startSession()
    session.startTransaction()

    try {
      const memberWallet = await this.walletModel.findOne({ userId: transaction.senderId }).session(session)
      const ownerWallet = await this.walletModel.findOne({ userId: ownerObjectId }).session(session)

      if (!memberWallet || !ownerWallet) {
        throw new BadRequestException('Wallet not found for one or both parties of this transaction.')
      }

      if (memberWallet.frozenBalance < transaction.amount) {
        throw new BadRequestException('Insufficient frozen balance to process this transaction.')
      }

      if (resolution === 'refund') {
        // KỊCH BẢN A: MEMBER THẮNG -> HOÀN TIỀN
        memberWallet.frozenBalance -= transaction.amount
        memberWallet.balance += transaction.amount

        transaction.status = EscrowStatus.REFUNDED
        dispute.status = DisputeStatus.RESOLVED_REFUND

        await memberWallet.save({ session })
      } else if (resolution === 'payout') {
        // KỊCH BẢN B: OWNER THẮNG -> GIẢI NGÂN
        memberWallet.frozenBalance -= transaction.amount
        ownerWallet.balance += transaction.amount

        transaction.status = EscrowStatus.COMPLETED
        dispute.status = DisputeStatus.RESOLVED_PAYOUT

        await memberWallet.save({ session })
        await ownerWallet.save({ session })
      }

      await transaction.save({ session })
      await dispute.save({ session })

      await session.commitTransaction()
      await session.endSession()

      const msgForMember =
        resolution === 'refund'
          ? `Vụ khiếu nại thành công! Số tiền ${transaction.amount}đ đã được hoàn trả về ví của bạn.`
          : `Vụ khiếu nại đã đóng. Quyết định cuối cùng từ Admin: Chủ nhóm thắng kiện, số tiền đã được giải ngân.`

      const msgForOwner =
        resolution === 'refund'
          ? `Admin phán quyết Member thắng kiện. Giao dịch mua slot của bạn bị hủy và hoàn tiền lại cho khách.`
          : `Chúc mừng bạn đã thắng kiện! Số tiền ${transaction.amount}đ đã được giải ngân về ví khả dụng của bạn.`

      await this.notificationsService.createNotification(
        transaction.senderId,
        'Kết quả phân xử khiếu nại',
        msgForMember,
        'transaction',
      )
      await this.notificationsService.createNotification(
        ownerObjectId,
        'Kết quả phân xử khiếu nại',
        msgForOwner,
        'transaction',
      )

      return { status: 'success', message: `Phân xử hoàn tất. Kết quả: ${resolution.toUpperCase()}` }
    } catch (error) {
      await session.abortTransaction()
      await session.endSession()
      throw error
    }
  }
}
