import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { EscrowStatus } from '../transactions/enums/escrow-status.enum'
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

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private buildPeriodConfig(
    period: 'day' | 'week' | 'month' | 'year',
    from?: Date,
    to?: Date,
  ): {
    startDate: Date
    endDate: Date
    groupFormat: string
    labelFormat: (label: string) => string
    buckets: string[]
  } {
    const now = new Date()
    let startDate: Date
    const endDate: Date = to ? new Date(to) : new Date(now)
    let groupFormat: string
    let labelFormat: (label: string) => string
    let buckets: string[]

    switch (period) {
      case 'day': {
        startDate = from ? new Date(from) : new Date(now)
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        groupFormat = '%Y-%m-%d'
        labelFormat = (label) => {
          const d = new Date(label)
          return `${d.getDate()}/${d.getMonth() + 1}`
        }
        buckets = this.generateDailyBuckets(startDate, endDate)
        break
      }
      case 'week': {
        startDate = from ? new Date(from) : new Date(now)
        startDate.setDate(startDate.getDate() - 7 * 7)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        groupFormat = '%G-%V' // ISO year-week
        labelFormat = (label) => `W${label.split('-')[1]}`
        buckets = this.generateWeeklyBuckets(startDate, endDate)
        break
      }
      case 'month': {
        startDate = from ? new Date(from) : new Date(now)
        startDate.setMonth(startDate.getMonth() - 11)
        startDate.setDate(1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        groupFormat = '%Y-%m'
        labelFormat = (label) => {
          const [year, month] = label.split('-')
          return `T${parseInt(month)}/${year.slice(2)}`
        }
        buckets = this.generateMonthlyBuckets(startDate, endDate)
        break
      }
      case 'year': {
        startDate = from ? new Date(from) : new Date(now)
        startDate.setFullYear(startDate.getFullYear() - 4)
        startDate.setMonth(0, 1)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        groupFormat = '%Y'
        labelFormat = (label) => label
        buckets = this.generateYearlyBuckets(startDate, endDate)
        break
      }
      default: {
        startDate = new Date(now)
        startDate.setDate(startDate.getDate() - 6)
        startDate.setHours(0, 0, 0, 0)
        endDate.setHours(23, 59, 59, 999)
        groupFormat = '%Y-%m-%d'
        labelFormat = (label) => {
          const d = new Date(label)
          return `${d.getDate()}/${d.getMonth() + 1}`
        }
        buckets = this.generateDailyBuckets(startDate, endDate)
      }
    }

    return { startDate, endDate, groupFormat, labelFormat, buckets }
  }

  private generateDailyBuckets(startDate: Date, endDate: Date): string[] {
    const buckets: string[] = []
    const cursor = new Date(startDate)
    while (cursor <= endDate) {
      const y = cursor.getFullYear()
      const m = String(cursor.getMonth() + 1).padStart(2, '0')
      const d = String(cursor.getDate()).padStart(2, '0')
      buckets.push(`${y}-${m}-${d}`)
      cursor.setDate(cursor.getDate() + 1)
    }
    return buckets
  }

  private generateWeeklyBuckets(startDate: Date, endDate: Date): string[] {
    const buckets: string[] = []
    const cursor = new Date(startDate)
    while (cursor <= endDate) {
      const y = cursor.getFullYear()
      const week = this.getISOWeek(cursor)
      const key = `${y}-${String(week).padStart(2, '0')}`
      if (!buckets.includes(key)) buckets.push(key)
      cursor.setDate(cursor.getDate() + 7)
    }
    return buckets
  }

  private generateMonthlyBuckets(startDate: Date, endDate: Date): string[] {
    const buckets: string[] = []
    const cursor = new Date(startDate)
    while (
      cursor.getFullYear() < endDate.getFullYear() ||
      (cursor.getFullYear() === endDate.getFullYear() && cursor.getMonth() <= endDate.getMonth())
    ) {
      const y = cursor.getFullYear()
      const m = String(cursor.getMonth() + 1).padStart(2, '0')
      buckets.push(`${y}-${m}`)
      cursor.setMonth(cursor.getMonth() + 1)
    }
    return buckets
  }

  private generateYearlyBuckets(startDate: Date, endDate: Date): string[] {
    const buckets: string[] = []
    for (let y = startDate.getFullYear(); y <= endDate.getFullYear(); y++) {
      buckets.push(String(y))
    }
    return buckets
  }

  private getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
    const dayNum = d.getUTCDay() || 7
    d.setUTCDate(d.getUTCDate() + 4 - dayNum)
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  }

  // ─── Admin Chart APIs ────────────────────────────────────────────────────────

  /**
   * GET /admin/dashboard/revenue-summary
   * Tóm tắt doanh thu tháng này và tháng trước để hiển thị 3 thẻ summary:
   * 1. Tổng phí thu được (topup + VIP) tháng này vs tháng trước
   * 2. Tổng giao dịch trên sàn tháng này vs tháng trước
   * 3. Tỉ lệ giữ chân (% user có subscription active)
   */
  async getAdminRevenueSummary() {
    const now = new Date()
    const todayDay = now.getDate() // Ngày hiện tại trong tháng (VD: 10)

    // Tháng hiện tại: từ đầu tháng đến hiện tại (MTD)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
    const thisMonthEnd = new Date(now) // Đến thời điểm hiện tại

    // Tháng trước: chỉ lấy cùng số ngày đã trôi qua (MTD comparison)
    // VD: hôm nay ngày 10/6 → so sánh với ngày 1-10/5
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0)
    const lastMonthSameDay = new Date(now.getFullYear(), now.getMonth() - 1, todayDay, 23, 59, 59, 999)

    const [
      thisMonthTopup,
      lastMonthTopup,
      thisMonthVip,
      lastMonthVip,
      thisMonthTransactions,
      lastMonthTransactions,
      totalActiveUsers,
      totalSubscribedUsers,
    ] = await Promise.all([
      // Topup tháng này (MTD)
      this.topupModel.aggregate<{ total: number }>([
        { $match: { status: 'completed', createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Topup tháng trước (cùng số ngày - MTD)
      this.topupModel.aggregate<{ total: number }>([
        { $match: { status: 'completed', createdAt: { $gte: lastMonthStart, $lte: lastMonthSameDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // VIP tháng này
      this.userModel.countDocuments({
        lastPaymentAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
      }),
      // VIP tháng trước (cùng số ngày)
      this.userModel.countDocuments({
        lastPaymentAt: { $gte: lastMonthStart, $lte: lastMonthSameDay },
      }),
      // Tổng giao dịch trên sàn tháng này (MTD)
      this.transactionModel.aggregate<{ total: number }>([
        { $match: { createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Tổng giao dịch trên sàn tháng trước (cùng số ngày)
      this.transactionModel.aggregate<{ total: number }>([
        { $match: { createdAt: { $gte: lastMonthStart, $lte: lastMonthSameDay } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Tổng user đang active
      this.userModel.countDocuments({ _destroy: false }),
      // Tổng user có subscription active
      this.userModel.countDocuments({ isSubscriptionActive: true, _destroy: false }),
    ])

    const thisMonthFee = (thisMonthTopup[0]?.total ?? 0) + thisMonthVip * this.vipPrice
    const lastMonthFee = (lastMonthTopup[0]?.total ?? 0) + lastMonthVip * this.vipPrice
    const thisMonthTxTotal = thisMonthTransactions[0]?.total ?? 0
    const lastMonthTxTotal = lastMonthTransactions[0]?.total ?? 0

    // % tăng trưởng MTD so với cùng kỳ tháng trước (null nếu tháng trước = 0)
    const calcGrowth = (current: number, previous: number): number | null => {
      if (previous === 0) return null
      return Math.round(((current - previous) / previous) * 1000) / 10 // 1 decimal
    }

    // Tỉ lệ giữ chân = % user có isSubscriptionActive / tổng user active
    const retentionRate = totalActiveUsers === 0 ? 0 : Math.round((totalSubscribedUsers / totalActiveUsers) * 1000) / 10

    return {
      status: 'success',
      data: {
        // Thẻ 1: Tổng phí thu được tháng này (MTD)
        feeThisMonth: {
          total: thisMonthFee,
          growthPercent: calcGrowth(thisMonthFee, lastMonthFee),
        },
        // Thẻ 2: Tổng giao dịch trên sàn tháng này (MTD)
        transactionThisMonth: {
          total: thisMonthTxTotal,
          growthPercent: calcGrowth(thisMonthTxTotal, lastMonthTxTotal),
        },
        // Thẻ 3: Tỉ lệ giữ chân
        retentionRate: {
          percent: retentionRate,
          totalActive: totalActiveUsers,
          totalSubscribed: totalSubscribedUsers,
        },
      },
    }
  }

  /**
   * Số lượng user mới đăng ký theo từng mốc thời gian.
   */
  async getAdminCommunityHealthChart(period: 'day' | 'week' | 'month' | 'year' = 'day', from?: Date, to?: Date) {
    const { startDate, endDate, groupFormat, labelFormat, buckets } = this.buildPeriodConfig(period, from, to)

    const rawData = await this.userModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          _destroy: false,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt',
              timezone: '+07:00',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const dataMap = new Map(rawData.map((item) => [item._id, item.count]))

    const chartData = buckets.map((bucket) => ({
      label: labelFormat(bucket),
      value: dataMap.get(bucket) ?? 0,
    }))

    return { status: 'success', data: chartData }
  }

  /**
   * Doanh thu (topup + VIP) theo từng mốc thời gian.
   */
  async getAdminRevenueChart(period: 'day' | 'week' | 'month' | 'year' = 'month', from?: Date, to?: Date) {
    const { startDate, endDate, groupFormat, labelFormat, buckets } = this.buildPeriodConfig(period, from, to)

    const [topupData, vipData] = await Promise.all([
      this.topupModel.aggregate<{ _id: string; total: number }>([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: '$createdAt',
                timezone: '+07:00',
              },
            },
            total: { $sum: '$amount' },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      this.userModel.aggregate<{ _id: string; total: number }>([
        {
          $match: {
            lastPaymentAt: { $gte: startDate, $lte: endDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: groupFormat,
                date: '$lastPaymentAt',
                timezone: '+07:00',
              },
            },
            total: { $sum: this.vipPrice },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const topupMap = new Map(topupData.map((item) => [item._id, item.total]))
    const vipMap = new Map(vipData.map((item) => [item._id, item.total]))

    const chartData = buckets.map((bucket) => ({
      label: labelFormat(bucket),
      topup: topupMap.get(bucket) ?? 0,
      vip: vipMap.get(bucket) ?? 0,
      total: (topupMap.get(bucket) ?? 0) + (vipMap.get(bucket) ?? 0),
    }))

    return { status: 'success', data: chartData }
  }

  /**
   * Số nhóm mới được tạo theo từng mốc thời gian.
   */
  async getAdminGroupChart(period: 'day' | 'week' | 'month' | 'year' = 'month', from?: Date, to?: Date) {
    const { startDate, endDate, groupFormat, labelFormat, buckets } = this.buildPeriodConfig(period, from, to)

    const rawData = await this.groupModel.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupFormat,
              date: '$createdAt',
              timezone: '+07:00',
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const dataMap = new Map(rawData.map((item) => [item._id, item.count]))

    const chartData = buckets.map((bucket) => ({
      label: labelFormat(bucket),
      value: dataMap.get(bucket) ?? 0,
    }))

    return { status: 'success', data: chartData }
  }

  // ─── User-facing chart methods ───────────────────────────────────────────────

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
