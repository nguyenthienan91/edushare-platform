import { fetchClient } from '../utils/fetchClient'

export const UserService = {
  upgradeVip: async (months: number) => {
    return fetchClient('/users/upgrade-vip', {
      method: 'POST',
      body: JSON.stringify({ months }),
      requireAuth: true
    })
  }
}
