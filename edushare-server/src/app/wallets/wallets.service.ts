import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Wallet, WalletDocument } from './schemas/wallet.schema'
import { Topup, TopupDocument } from './schemas/topup.schema'
import { Withdrawal, WithdrawalDocument } from './schemas/withdrawal.schema'
import { WithdrawRequestDto } from './dto/withdraw-request.dto'
import { ReviewWithdrawalDto } from './dto/review-withdrawal.dto'
import { PaginationUtilService } from '../../common/utils/pagination-util/pagination-util.service'
import { Pagination } from '../../common/utils/pagination-util/pagination-util.interface'

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Topup.name) private topupModel: Model<TopupDocument>,
    @InjectModel(Withdrawal.name) private withdrawalModel: Model<WithdrawalDocument>,
    private paginationUtilService: PaginationUtilService,
  ) {}

  async findByUserId(userId: Types.ObjectId): Promise<WalletDocument | null> {
    return this.walletModel.findOne({ userId }).exec()
  }

  async createWallet(userId: Types.ObjectId): Promise<WalletDocument> {
    const wallet = new this.walletModel({ userId, balance: 0, frozenBalance: 0 })
    return wallet.save()
  }

  async getWalletByUserId(userId: string) {
    const userObjectId = new Types.ObjectId(userId)
    let wallet = await this.findByUserId(userObjectId)
    if (!wallet) {
      wallet = await this.createWallet(userObjectId)
    }

    const [topupResult, withdrawalResult] = await Promise.all([
      this.topupModel
        .aggregate<{
          total: number
        }>([
          { $match: { userId: userObjectId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
      this.withdrawalModel
        .aggregate<{
          total: number
        }>([
          { $match: { userId: userObjectId, status: 'approved' } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ])
        .exec(),
    ])

    const totalTopup = topupResult[0]?.total || 0
    const totalWithdrawal = withdrawalResult[0]?.total || 0

    return {
      ...wallet.toObject({ virtuals: true }),
      totalTopup,
      totalWithdrawal,
    }
  }

  // Hàm khởi tạo lệnh nạp tiền (Giao cho PayOS Module gọi)
  async createTopupOrder(userId: string, orderCode: number, amount: number) {
    return await this.topupModel.create({
      orderCode,
      userId: new Types.ObjectId(userId),
      amount,
      status: 'pending',
    })
  }

  // Hàm chính thức cộng tiền khi Webhook PayOS báo thành công
  async addBalanceFromPayOS(orderCode: number) {
    // 1. Tìm lệnh nạp tiền đang ở trạng thái pending
    const topupOrder = await this.topupModel.findOne({ orderCode, status: 'pending' })
    if (!topupOrder) return // Nếu không thấy hoặc đã xử lý rồi thì bỏ qua

    // 2. Tìm ví — nếu chưa có thì tạo mới (trường hợp user cũ đăng ký trước khi có auto-create)
    const walletExists = await this.walletModel.findOne({ userId: topupOrder.userId })
    if (!walletExists) {
      await this.createWallet(topupOrder.userId)
    }

    // 3. Cập nhật trạng thái lệnh nạp thành completed
    topupOrder.status = 'completed'
    await topupOrder.save()

    // 4. Cộng tiền vào ví khả dụng (balance) của người dùng
    await this.walletModel.findOneAndUpdate({ userId: topupOrder.userId }, { $inc: { balance: topupOrder.amount } })
  }

  async requestWithdraw(userId: string, withdrawRequestDto: WithdrawRequestDto): Promise<WithdrawalDocument> {
    const session = await this.walletModel.db.startSession()
    try {
      let createdWithdrawal: WithdrawalDocument | null = null
      await session.withTransaction(async () => {
        const userObjectId = new Types.ObjectId(userId)
        const wallet = await this.walletModel.findOne({ userId: userObjectId }).session(session)
        if (!wallet) {
          throw new BadRequestException('Wallet not found')
        }

        if (withdrawRequestDto.amount < 50000) {
          throw new BadRequestException('Minimum withdraw amount is 50000')
        }

        if (wallet.balance < withdrawRequestDto.amount) {
          throw new BadRequestException('Insufficient balance')
        }

        await this.walletModel.updateOne(
          { _id: wallet._id },
          { $inc: { balance: -withdrawRequestDto.amount, frozenBalance: withdrawRequestDto.amount } },
          { session },
        )

        const [withdrawal] = await this.withdrawalModel.create(
          [
            {
              userId: wallet.userId,
              amount: withdrawRequestDto.amount,
              bankName: withdrawRequestDto.bankName,
              accountNumber: withdrawRequestDto.accountNumber,
              accountName: withdrawRequestDto.accountName,
              status: 'pending',
            },
          ],
          { session },
        )

        createdWithdrawal = withdrawal
      })

      if (!createdWithdrawal) {
        throw new BadRequestException('Withdrawal request failed')
      }

      return createdWithdrawal
    } finally {
      await session.endSession()
    }
  }

  async reviewWithdrawal(withdrawalId: string, reviewDto: ReviewWithdrawalDto): Promise<WithdrawalDocument> {
    const session = await this.walletModel.db.startSession()
    try {
      let reviewedWithdrawal: WithdrawalDocument | null = null
      await session.withTransaction(async () => {
        const withdrawal = await this.withdrawalModel.findById(withdrawalId).session(session)
        if (!withdrawal) {
          throw new BadRequestException('Withdrawal not found')
        }

        if (withdrawal.status !== 'pending') {
          throw new BadRequestException('Withdrawal already reviewed')
        }

        if (reviewDto.status === 'approved') {
          withdrawal.status = 'approved'
          withdrawal.rejectReason = undefined
          await withdrawal.save({ session })
          await this.walletModel.updateOne(
            { userId: withdrawal.userId },
            { $inc: { frozenBalance: -withdrawal.amount } },
            { session },
          )
        }

        if (reviewDto.status === 'rejected') {
          withdrawal.status = 'rejected'
          withdrawal.rejectReason = reviewDto.rejectReason
          await withdrawal.save({ session })
          await this.walletModel.updateOne(
            { userId: withdrawal.userId },
            { $inc: { balance: withdrawal.amount, frozenBalance: -withdrawal.amount } },
            { session },
          )
        }

        reviewedWithdrawal = withdrawal
      })

      if (!reviewedWithdrawal) {
        throw new BadRequestException('Review withdrawal failed')
      }

      return reviewedWithdrawal
    } finally {
      await session.endSession()
    }
  }

  async getTopupHistory(userId: string, pagination: Pagination) {
    type TopupHistory = {
      _id: Types.ObjectId
      amount: number
      status: string
      orderCode: number
      createdAt: Date
    }

    const userObjectId = new Types.ObjectId(userId)
    const totalItems = await this.topupModel.countDocuments({ userId: userObjectId }).exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })
    const topups = await this.topupModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .lean<TopupHistory[]>()
      .exec()

    const list = topups.map((topup) => ({
      id: topup._id,
      type: 'topup',
      direction: 'in',
      amount: topup.amount,
      status: topup.status,
      createdAt: topup.createdAt,
      orderCode: topup.orderCode,
    }))

    return this.paginationUtilService.format(list)
  }

  async getWithdrawalHistory(userId: string, pagination: Pagination) {
    type WithdrawalHistory = {
      _id: Types.ObjectId
      amount: number
      status: string
      bankName: string
      accountNumber: string
      accountName: string
      rejectReason?: string
      createdAt: Date
    }

    const userObjectId = new Types.ObjectId(userId)
    const totalItems = await this.withdrawalModel.countDocuments({ userId: userObjectId }).exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })
    const withdrawals = await this.withdrawalModel
      .find({ userId: userObjectId })
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .lean<WithdrawalHistory[]>()
      .exec()

    const list = withdrawals.map((withdrawal) => ({
      id: withdrawal._id,
      type: 'withdrawal',
      direction: 'out',
      amount: withdrawal.amount,
      status: withdrawal.status,
      createdAt: withdrawal.createdAt,
      bankName: withdrawal.bankName,
      accountNumber: withdrawal.accountNumber,
      accountName: withdrawal.accountName,
      rejectReason: withdrawal.rejectReason,
    }))

    return this.paginationUtilService.format(list)
  }

  async getWalletHistory(userId: string, pagination: Pagination) {
    type TopupHistory = {
      _id: Types.ObjectId
      amount: number
      status: string
      orderCode: number
      createdAt: Date
    }

    type WithdrawalHistory = {
      _id: Types.ObjectId
      amount: number
      status: string
      bankName: string
      accountNumber: string
      accountName: string
      rejectReason?: string
      createdAt: Date
    }

    const userObjectId = new Types.ObjectId(userId)
    const [topupCount, withdrawalCount] = await Promise.all([
      this.topupModel.countDocuments({ userId: userObjectId }).exec(),
      this.withdrawalModel.countDocuments({ userId: userObjectId }).exec(),
    ])

    const totalItems = topupCount + withdrawalCount
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })

    const [topups, withdrawals] = await Promise.all([
      this.topupModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean<TopupHistory[]>().exec(),
      this.withdrawalModel.find({ userId: userObjectId }).sort({ createdAt: -1 }).lean<WithdrawalHistory[]>().exec(),
    ])

    const items = [
      ...topups.map((topup) => ({
        id: topup._id,
        type: 'topup',
        direction: 'in',
        amount: topup.amount,
        status: topup.status,
        createdAt: topup.createdAt,
        orderCode: topup.orderCode,
      })),
      ...withdrawals.map((withdrawal) => ({
        id: withdrawal._id,
        type: 'withdrawal',
        direction: 'out',
        amount: withdrawal.amount,
        status: withdrawal.status,
        createdAt: withdrawal.createdAt,
        bankName: withdrawal.bankName,
        accountNumber: withdrawal.accountNumber,
        accountName: withdrawal.accountName,
        rejectReason: withdrawal.rejectReason,
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const list = items.slice(paging.skip, paging.skip + paging.itemPerPage)
    return this.paginationUtilService.format(list)
  }

  // ─── Admin APIs ──────────────────────────────────────────────────────────────

  /**
   * [ADMIN] Lấy danh sách tất cả lệnh rút tiền của toàn hệ thống.
   * Hỗ trợ filter theo status (pending | approved | rejected) và phân trang.
   */
  async getAdminWithdrawals(pagination: Pagination, status?: 'pending' | 'approved' | 'rejected') {
    const filter = status ? { status } : {}

    const totalItems = await this.withdrawalModel.countDocuments(filter).exec()
    const paging = this.paginationUtilService.paging({
      page: pagination.page,
      itemPerPage: pagination.itemPerPage,
      totalItems,
    })

    const withdrawals = await this.withdrawalModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(paging.skip)
      .limit(paging.itemPerPage)
      .populate('userId', 'displayName email avatar')
      .lean()
      .exec()

    const list = withdrawals.map((w: any) => ({
      id: w._id,
      amount: w.amount,
      status: w.status,
      bankName: w.bankName,
      accountNumber: w.accountNumber,
      accountName: w.accountName,
      rejectReason: w.rejectReason,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
      user: w.userId
        ? {
            id: w.userId._id,
            displayName: w.userId.displayName,
            email: w.userId.email,
            avatar: w.userId.avatar,
          }
        : null,
    }))

    return this.paginationUtilService.format(list)
  }
}
