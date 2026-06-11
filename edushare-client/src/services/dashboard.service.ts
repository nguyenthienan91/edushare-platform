import { fetchClient } from '../utils/fetchClient'

export type GroupStatus = 'available' | 'full' | 'expired' | 'closed' | 'hidden'
export type GroupCategory = 'Productivity' | 'Design' | 'AI Tools'

export interface GroupOwner {
  _id: string
  username: string
  displayName: string
  avatar?: string
  trustScore: number
}

export interface GroupMember {
  _id: string
  id: string
  email: string
  displayName: string
}

export interface AdminGroup {
  _id: string
  name: string
  description: string
  category: GroupCategory
  totalSlots: number
  occupiedSlots: number
  totalPrice: number
  price: number
  status: GroupStatus
  adminStatusBeforeLock: GroupStatus | null
  ownerId: GroupOwner
  members: GroupMember[]
  expiredAt: string | null
  createdAt: string
  updatedAt: string
}

export interface GroupListResponse {
  message: string
  list: AdminGroup[]
  totalPages: number
  totalItems: number
  currentPage: number
}

export interface GroupSearchParams {
  name?: string
  status?: GroupStatus
  category?: GroupCategory
  page?: number
  itemPerPage?: number
}

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

  searchGroups: async (params: GroupSearchParams): Promise<GroupListResponse> => {
    const query = new URLSearchParams()
    if (params.name) query.append('name', params.name)
    if (params.status) query.append('status', params.status)
    if (params.category) query.append('category', params.category)
    if (params.page) query.append('page', String(params.page))
    if (params.itemPerPage) query.append('itemPerPage', String(params.itemPerPage))
    const qs = query.toString()
    return fetchClient(`/groups/search?${qs}`, {
      method: 'GET',
      requireAuth: true,
    })
  },

  getGroups: async (params?: { page?: number; itemPerPage?: number }): Promise<GroupListResponse> => {
    const query = new URLSearchParams()
    if (params?.page) query.append('page', String(params.page))
    if (params?.itemPerPage) query.append('itemPerPage', String(params.itemPerPage))
    return fetchClient(`/groups?${query.toString()}`, {
      method: 'GET',
      requireAuth: true,
    })
  },

  updateGroupStatus: async (
    id: string,
    status: 'closed' | 'hidden',
  ): Promise<{ message: string; data: AdminGroup }> => {
    return fetchClient(`/admin/groups/${id}/status`, {
      method: 'PATCH',
      requireAuth: true,
      body: JSON.stringify({ status }),
    })
  },

  restoreGroupStatus: async (id: string): Promise<{ message: string; data: AdminGroup }> => {
    return fetchClient(`/admin/groups/${id}/status/restore`, {
      method: 'PATCH',
      requireAuth: true,
    })
  },
}
