import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from '../users/entities/user.entity'
import { Group, GroupDocument, GroupStatus } from '../groups/entities/group.entity'
import { Transaction, TransactionDocument } from '../transactions/schemas/transaction.schema'
import { Topup, TopupDocument } from '../wallets/schemas/topup.schema'
import { Withdrawal, WithdrawalDocument } from '../wallets/schemas/withdrawal.schema'

@Injectable()
export class DashboardService {
  private readonly vipPrice = 29000

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Group.name) private readonly groupModel: Model<GroupDocument>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<TransactionDocument>,
    @InjectModel(Topup.name) private readonly topupModel: Model<TopupDocument>,
    @InjectModel(Withdrawal.name) private readonly withdrawalModel: Model<WithdrawalDocument>,
  ) {}

  async getAdminDashboardStats() {
    const vipRevenuePromise = this.userModel.aggregate<{ total: number }>([
      { $match: { lastPaymentAt: { $ne: null } } },
      { $group: { _id: null, total: { $sum: this.vipPrice } } },
    ])

    const totalUsersPromise = this.userModel.countDocuments({ _destroy: false })
    const totalActiveGroupsPromise = this.groupModel.countDocuments({
      status: { $in: [GroupStatus.AVAILABLE, GroupStatus.FULL] },
    })
    const totalTransactionsPromise = this.transactionModel.countDocuments()

    const totalTopupPromise = this.topupModel.aggregate<{ total: number }>([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    const totalWithdrawalPromise = this.withdrawalModel.aggregate<{ total: number }>([
      { $match: { status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ])

    const [
      vipRevenueResult,
      totalUsers,
      totalActiveGroups,
      totalTransactions,
      totalTopupResult,
      totalWithdrawalResult,
    ] = await Promise.all([
      vipRevenuePromise,
      totalUsersPromise,
      totalActiveGroupsPromise,
      totalTransactionsPromise,
      totalTopupPromise,
      totalWithdrawalPromise,
    ])

    const totalVipRevenue = vipRevenueResult[0]?.total ?? 0
    const totalTopupAmount = totalTopupResult[0]?.total ?? 0
    const totalApprovedWithdrawalAmount = totalWithdrawalResult[0]?.total ?? 0

    return {
      status: 'success',
      data: {
        totalVipRevenue,
        totalUsers,
        totalActiveGroups,
        totalTransactions,
        totalTopupAmount,
        totalApprovedWithdrawalAmount,
      },
    }
  }
}
