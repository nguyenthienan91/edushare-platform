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

export interface AdminUser {
  _id: string
  displayName: string
  email: string
  role: 'guest' | 'member' | 'admin'
  avatar?: string
  isActive: boolean
  isSubscriptionActive: boolean
  createdAt: string
}

export interface UserListResponse {
  list: AdminUser[]
  totalPages: number
  totalItems: number
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
  getUsers: async (params: {
    page?: number
    itemPerPage?: number
    search?: string
    role?: 'guest' | 'member' | 'admin'
  }): Promise<UserListResponse> => {
    const query = new URLSearchParams()
    if (params.page) query.append('page', String(params.page))
    if (params.itemPerPage) query.append('itemPerPage', String(params.itemPerPage))
    if (params.search) query.append('search', params.search)
    if (params.role) query.append('role', params.role)
    return fetchClient(`/users?${query.toString()}`, {
      method: 'GET',
      requireAuth: true,
    })
  },

  getUserById: async (id: string): Promise<AdminUser> => {
    return fetchClient(`/users/${id}`, {
      method: 'GET',
      requireAuth: true,
    })
  },

  updateUser: async (id: string, data: Partial<Pick<AdminUser, 'isActive' | 'role' | 'isSubscriptionActive'> & { trustScore: number }>): Promise<AdminUser> => {
    return fetchClient(`/users/${id}`, {
      method: 'PATCH',
      requireAuth: true,
      body: JSON.stringify(data),
    })
  },

  deleteUser: async (id: string): Promise<void> => {
    return fetchClient(`/users/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    })
  },

  banUser: async (id: string): Promise<{ message: string; data: AdminUser }> => {
    return fetchClient(`/admin/users/${id}/ban`, {
      method: 'PATCH',
      requireAuth: true,
    })
  },

  unbanUser: async (id: string): Promise<{ message: string; data: AdminUser }> => {
    return fetchClient(`/admin/users/${id}/unban`, {
      method: 'PATCH',
      requireAuth: true,
    })
  },
}
