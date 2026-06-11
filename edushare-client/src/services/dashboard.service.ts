import { fetchClient } from '../utils/fetchClient'

export interface AdminDashboardStats {
  totalVipRevenue: number
  totalUsers: number
  totalActiveGroups: number
  totalTransactions: number
  totalTopupAmount: number
  totalApprovedWithdrawalAmount: number
}

export const DashboardService = {
  getAdminStats: async (): Promise<{ status: string; data: AdminDashboardStats }> => {
    return fetchClient('/admin/dashboard/stats', {
      method: 'GET',
      requireAuth: true,
    })
  },
}
