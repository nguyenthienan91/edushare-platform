import { fetchClient } from '../utils/fetchClient'

export const UserService = {
  upgradeVip: async () => {
    return fetchClient('/users/upgrade-vip', {
      method: 'POST',
      requireAuth: true
    })
  }
}
