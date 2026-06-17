import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { Connection, Model, Types } from 'mongoose'
import { Transaction, TransactionDocument } from './schemas/transaction.schema'
import { Wallet, WalletDocument } from '../wallets/schemas/wallet.schema'
import { EscrowStatus } from './enums/escrow-status.enum'
import { Group, GroupDocument, GroupStatus } from '../groups/entities/group.entity'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'
import { NotificationsService } from '../notifications/notification.service'
import { User, UserDocument } from '../users/entities/user.entity'

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name)

  constructor(
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    @InjectConnection() private readonly connection: Connection, // Dùng để quản lý ACID Transaction
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly paginationUtil: PaginationUtilService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async findAll(): Promise<TransactionDocument[]> {
    return this.transactionModel.find().exec()
  }

  async findMyOrders(userId: string): Promise<TransactionDocument[]> {
    return this.transactionModel
      .find({ senderId: new Types.ObjectId(userId) })
      .populate('groupId', 'name category ownerId')
      .sort({ createdAt: -1 })
      .exec()
  }

  async requestJoinGroup(userId: string, groupId: string) {
    // Gate check: Kiểm tra trước khi mở session để tránh tạo transaction không cần thiết
    const user = await this.userModel.findById(userId).exec()
    if (!user || !user.isSubscriptionActive) {
      throw new BadRequestException('An active VIP membership is required to join a group.')
    }

    // Khởi tạo một phiên làm việc (session) bảo mật dữ liệu
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const userObjectId = new Types.ObjectId(userId)
      const groupObjectId = new Types.ObjectId(groupId)

      // 1. Lấy thông tin nhóm từ DB và kiểm tra trạng thái
      const group = await this.groupModel.findById(groupObjectId).session(session)
      if (!group) {
        throw new NotFoundException('Group not found.')
      }

      // Kiểm tra xem nhóm còn slot trống hay không hoặc có đang bị khóa/hết hạn không
      if (group.status !== GroupStatus.AVAILABLE || group.occupiedSlots >= group.totalSlots) {
        throw new BadRequestException('Group is full or no longer available to join.')
      }

      // Kiểm tra user đã có pending transaction cho group này chưa
      const existingTransaction = await this.transactionModel
        .findOne({
          senderId: userObjectId,
          groupId: groupObjectId,
          status: {
            $in: [EscrowStatus.HELD_IN_ESCROW, EscrowStatus.APPROVED_WAITING_PROOF, EscrowStatus.PROOF_SUBMITTED],
          },
        })
        .session(session)
      if (existingTransaction) {
        throw new BadRequestException('You already have a pending join request for this group.')
      }

      // ĐỒNG BỘ: Sử dụng trực tiếp trường group.price từ Schema của bạn cùng team
      const price = group.price

      // 2. Tìm ví của Member và kiểm tra số dư khả dụng (balance)
      const wallet = await this.walletModel.findOne({ userId: userObjectId }).session(session)
      if (!wallet || wallet.balance < price) {
        throw new BadRequestException(`Insufficient balance. You need at least ${price} to join this group.`)
      }

      // 3. THỰC HIỆN LOCK TIỀN: Trừ balance khả dụng, cộng vào frozenBalance (ví treo)
      await this.walletModel.findOneAndUpdate(
        { userId: userObjectId },
        {
          $inc: {
            balance: -price, // Trừ số tiền tương ứng với group.price
            frozenBalance: price, // Đẩy vào ví treo
          },
        },
        { session },
      )

      // 4. Tạo bản ghi lịch sử giao dịch ở trạng thái HELD (Hệ thống đang giữ tiền)
      const lockDuration = 48 * 60 * 60 * 1000 // 48 giờ
      const escrowTransaction = await this.transactionModel.create(
        [
          {
            senderId: userObjectId,
            groupId: groupObjectId,
            amount: price, // Đồng bộ lưu số tiền bằng biến price
            status: EscrowStatus.HELD_IN_ESCROW,
            expiresAt: new Date(Date.now() + lockDuration),
          },
        ],
        { session },
      )

      await session.commitTransaction()

      // Gửi thông báo SAU KHI commit thành công - fire-and-forget, lỗi noti không ảnh hưởng giao dịch
      this.notificationsService
        .createNotification(
          group.ownerId as unknown as Types.ObjectId, // Người nhận là Chủ nhóm
          'Yêu cầu tham gia nhóm mới',
          `Thành viên vừa gửi yêu cầu tham gia vào nhóm [${group.name}]. Vui lòng phê duyệt!`,
          'transaction',
        )
        .catch((err) => this.logger.error(`Failed to send notification to group owner: ${err.message}`))

      return {
        message: 'Request submitted successfully. Your funds have been securely held in escrow.',
        transaction: escrowTransaction[0],
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Chủ nhóm nộp minh chứng đã add member vào gói
   */
  async submitProof(transactionId: string, ownerId: string, proofUrl: string) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // 1. Tìm giao dịch và kiểm tra tính hợp lệ
      const transaction = await this.transactionModel.findById(transactionId).session(session)

      if (!transaction) throw new NotFoundException('Transaction not found.')
      if (transaction.status !== EscrowStatus.APPROVED_WAITING_PROOF) {
        throw new BadRequestException('Transaction is not in a state awaiting proof submission (Must approved before).')
      }

      // 2. Tìm nhóm liên quan để xác thực xem người gọi API có phải là Chủ nhóm không
      const group = await this.groupModel.findById(transaction.groupId).session(session)
      if (!group) throw new NotFoundException('Associated group not found.')

      if (!(group.ownerId as unknown as Types.ObjectId).equals(new Types.ObjectId(ownerId))) {
        throw new BadRequestException('You are not the owner of this group and cannot submit proof.')
      }

      // 3. Cập nhật minh chứng và chuyển trạng thái sang PROOF_SUBMITTED
      transaction.proofUrl = proofUrl
      transaction.status = EscrowStatus.PROOF_SUBMITTED

      // Reset lại đồng hồ 48h: Member có đúng 48 tiếng để kiểm tra kể từ lúc có ảnh bằng chứng
      transaction.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000)

      await transaction.save({ session })
      await session.commitTransaction()

      // Gửi thông báo SAU KHI commit thành công - fire-and-forget, lỗi noti không ảnh hưởng giao dịch
      this.notificationsService
        .createNotification(
          transaction.senderId, // Người nhận là Thành viên mua slot
          'Chủ nhóm đã nộp minh chứng tài khoản',
          `Minh chứng tài khoản đã được tải lên. Bạn có 48h để kiểm tra và bấm xác nhận hoàn tất giao dịch.`,
          'transaction',
        )
        .catch((err) => this.logger.error(`Failed to send notification to member: ${err.message}`))

      return {
        message: 'Proof submitted successfully. The system has notified the buyer to confirm.',
        transaction,
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  /**
   * Người mua xác nhận đã vào nhóm thành công -> Giải ngân tiền cho Chủ nhóm
   */
  async confirmTransaction(transactionId: string, memberId: string) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      // 1. Tìm giao dịch và kiểm tra quyền sở hữu
      const transaction = await this.transactionModel.findById(transactionId).session(session)
      if (!transaction) throw new NotFoundException('Transaction not found.')

      const senderObjectId = transaction.senderId
      if (!senderObjectId.equals(new Types.ObjectId(memberId))) {
        throw new BadRequestException('You are not the buyer of this transaction.')
      }

      if (transaction.status !== EscrowStatus.PROOF_SUBMITTED) {
        throw new BadRequestException('Transaction has no proof submitted or has already been processed.')
      }

      // 2. Tìm nhóm để lấy thông tin Owner và kiểm tra Slot trống một lần nữa cho chắc
      const group = await this.groupModel.findById(transaction.groupId).session(session)
      if (!group) throw new NotFoundException('Group not found.')
      if (group.occupiedSlots >= group.totalSlots) {
        throw new BadRequestException('Group is already full. A refund will be processed for you.')
      }

      const price = transaction.amount
      const ownerObjectId = group.ownerId as unknown as Types.ObjectId

      // 3. XỬ LÝ DÒNG TIỀN: Trừ tiền đóng băng của Member -> Cộng tiền xài được cho Owner
      await this.walletModel.findOneAndUpdate(
        { userId: senderObjectId },
        { $inc: { frozenBalance: -price } },
        { session },
      )

      await this.walletModel.findOneAndUpdate(
        { userId: ownerObjectId },
        { $inc: { balance: price } }, // Tiền sạch, chủ nhóm rút được ngay
        { session, upsert: true },
      )

      // 4. CẬP NHẬT THÀNH VIÊN VÀO NHÓM (Đồng bộ với phần 5.2 của bạn cùng team)
      group.members.push(senderObjectId as unknown as (typeof group.members)[number])
      group.occupiedSlots += 1

      // Nếu nhóm hết slot thì tự động đổi trạng thái sang FULL
      if (group.occupiedSlots >= group.totalSlots) {
        group.status = GroupStatus.FULL // Import GroupStatus từ file entity của bạn cùng team
      }
      await group.save({ session })

      // 5. Đổi trạng thái giao dịch thành COMPLETED
      transaction.status = EscrowStatus.COMPLETED
      await transaction.save({ session })

      await session.commitTransaction()

      return {
        message: 'Transaction completed. You are now an official member of the group and the owner has been paid.',
      }
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async approveJoinRequest(transactionId: string, ownerId: string) {
    // 1. Tìm giao dịch kiểm tra hợp lệ
    const transaction = await this.transactionModel.findById(transactionId)
    if (!transaction) throw new NotFoundException('Transaction not found.')

    if (transaction.status !== EscrowStatus.HELD_IN_ESCROW) {
      throw new BadRequestException('This request has already been processed or is invalid.')
    }

    // 2. Kiểm tra quyền của người bấm nút xem có phải Owner của Group không
    const group = await this.groupModel.findById(transaction.groupId)
    if (!group) throw new NotFoundException('Associated group not found.')
    if (!(group.ownerId as unknown as Types.ObjectId).equals(new Types.ObjectId(ownerId))) {
      throw new BadRequestException('You are not the owner of this group and cannot approve this request.')
    }

    // 3. Cập nhật trạng thái sang APPROVED_WAITING_PROOF
    transaction.status = EscrowStatus.APPROVED_WAITING_PROOF
    // Lưu thay đổi vào Database
    await transaction.save()
    // Ở đây chúng ta ghi nhận Owner đã chấp nhận, sẵn sàng chờ họ up ảnh ở bước tiếp theo

    // Gửi thông báo - fire-and-forget, lỗi noti không ảnh hưởng giao dịch
    this.notificationsService
      .createNotification(
        transaction.senderId, // Người nhận là Thành viên mua slot
        'Yêu cầu đã được phê duyệt',
        `Chủ nhóm đã chấp nhận yêu cầu vào nhóm của bạn. Vui lòng đợi chủ nhóm cấp tài khoản và nộp minh chứng!`,
        'transaction',
      )
      .catch((err) => this.logger.error(`Failed to send notification to member: ${err.message}`))

    this.logger.log(`Owner ${ownerId} approved transaction ${transactionId}`)

    return {
      status: 'success',
      message: 'Request approved. Please add the member to the account and upload proof of completion.',
      transaction,
    }
  }

  async findAllTransactionsForAdmin(query: { status?: string; page?: number; itemPerPage?: number }) {
    const { status, page, itemPerPage } = query
    /// 1. Tạo object filter điều kiện tìm kiếm
    const filter: any = {}
    if (status) {
      filter.status = status
    }

    // 2. Đếm tổng số lượng item thỏa mãn điều kiện lọc (Bắt buộc phải có để tính totalPages)
    const totalItems = await this.transactionModel.countDocuments(filter).exec()

    // 3. Kích hoạt tính toán phân trang từ Class Util của bạn
    // Hàm này sẽ tự động tính ra `this.paginationUtil.skip` và `this.paginationUtil.totalPages`
    this.paginationUtil.paging({
      page: page,
      itemPerPage: itemPerPage,
      totalItems: totalItems,
    })

    // Query dữ liệu từ MongoDB
    const transactions = await this.transactionModel
      .find(filter)
      .select('_id senderId groupId amount status proofUrl createdAt') // Chỉ lấy các trường cần thiết theo yêu cầu thiết kế
      .sort({ createdAt: -1 }) // Thằng nào mới nhất thì xếp lên đầu
      .skip(this.paginationUtil.skip)
      .limit(this.paginationUtil.itemPerPage)
      .exec()

    return {
      status: 'success',
      ...this.paginationUtil.format(transactions),
    }
  }

  async findMyTransactions(userId: string, pagination: { page?: number; itemPerPage?: number }) {
    const userObjectId = new Types.ObjectId(userId)

    // Lấy tất cả group mà user là owner để build filter $or
    const ownedGroups = await this.groupModel
      .find({ ownerId: userObjectId as any })
      .select('_id')
      .lean()
      .exec()
    const ownedGroupIds = ownedGroups.map((g) => g._id)

    // $or: là người mua (senderId) HOẶC là chủ nhóm (groupId thuộc về group của mình)
    const filter: any = {
      $or: [{ senderId: userObjectId }, { groupId: { $in: ownedGroupIds } }],
    }

    const totalItems = await this.transactionModel.countDocuments(filter).exec()

    this.paginationUtil.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems: totalItems,
    })

    const transactions = await this.transactionModel
      .find(filter)
      .select('_id senderId groupId amount status proofUrl createdAt expiresAt')
      .populate('senderId', 'displayName email avatar')
      .populate('groupId', 'name category ownerId')
      .sort({ createdAt: -1 })
      .skip(this.paginationUtil.skip)
      .limit(this.paginationUtil.itemPerPage)
      .exec()

    return {
      status: 'success',
      ...this.paginationUtil.format(transactions),
    }
  }
}
