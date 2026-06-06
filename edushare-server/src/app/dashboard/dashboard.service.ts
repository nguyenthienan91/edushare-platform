import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { EscrowStatus } from '../transactions/enums/escrow-status.enum'
import { User, UserDocument, UserRole } from '../users/entities/user.entity'
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

  async getMemberGrowthChart(userId: string) {
    const ownerId = new Types.ObjectId(userId)

    // Find all groups owned by this user
    const groups = await this.groupModel
      .find({ ownerId } as any)
      .select('_id members')
      .exec()
    const groupIds = groups.map((g) => g._id)
    const currentActualMembersCount = groups.reduce((sum, group) => sum + (group.members?.length || 0), 0)

    const now = new Date()
    const currentDay = now.getDay() // 0 is Sunday, 1 is Monday, etc.
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay

    const monday = new Date(now)
    monday.setDate(now.getDate() + distanceToMonday)
    monday.setHours(0, 0, 0, 0)

    // Calculate completed transactions count up to now (to calculate offset)
    const totalTxCountNow = await this.transactionModel.countDocuments({
      groupId: { $in: groupIds },
      status: EscrowStatus.COMPLETED,
    })

    const offset = Math.max(0, currentActualMembersCount - totalTxCountNow)

    const data: number[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(monday)
      day.setDate(monday.getDate() + i)
      day.setHours(23, 59, 59, 999)

      // Only query if the day is not in the future, otherwise use the same count as now
      if (day > now) {
        data.push(currentActualMembersCount)
      } else {
        const txCount = await this.transactionModel.countDocuments({
          groupId: { $in: groupIds },
          status: EscrowStatus.COMPLETED,
          updatedAt: { $lte: day },
        })
        data.push(txCount + offset)
      }
    }

    return {
      status: 'success',
      data,
    }
  }

  async getFeaturedGroups(limit = 3) {
    const groups = await this.groupModel
      .find({ status: { $in: [GroupStatus.AVAILABLE, GroupStatus.FULL] } })
      .sort({ occupiedSlots: -1, createdAt: -1 })
      .limit(limit)
      .exec()

    return {
      status: 'success',
      data: groups,
    }
  }
}
