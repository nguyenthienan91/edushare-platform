import { fetchClient } from '../utils/fetchClient'

export const GroupService = {
  getGroups: async (params?: Record<string, string | number>) => {
    const queryStr = params ? new URLSearchParams(params as Record<string, string>).toString() : '';
    return fetchClient(`/groups${queryStr ? '?' + queryStr : ''}`, {
      method: 'GET',
      requireAuth: true
    })
  }
}
