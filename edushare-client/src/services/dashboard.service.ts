import { fetchClient } from '../utils/fetchClient'

export interface AdminDashboardStats {
  totalVipRevenue: number
  totalUsers: number
  totalActiveGroups: number
  totalTransactions: number
  totalTopupAmount: number
  totalApprovedWithdrawalAmount: number
}

export interface CommunityHealthChartPoint {
  label: string
  value: number
}

export const DashboardService = {
  getAdminStats: async (): Promise<{ status: string; data: AdminDashboardStats }> => {
    return fetchClient('/admin/dashboard/stats', {
      method: 'GET',
      requireAuth: true,
    })
  },

  getCommunityHealthChart: async (
    period: 'day' | 'week' | 'month' | 'year',
    from?: Date,
    to?: Date,
  ): Promise<{ status: string; data: CommunityHealthChartPoint[] }> => {
    const params = new URLSearchParams({ period })
    if (from) params.append('from', from.toISOString())
    if (to) params.append('to', to.toISOString())
    return fetchClient(`/admin/dashboard/chart/community-health?${params.toString()}`, {
      method: 'GET',
      requireAuth: true,
    })
  },
}
