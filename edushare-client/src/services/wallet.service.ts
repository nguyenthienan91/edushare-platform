// src/services/wallet.service.ts
import { fetchClient } from '../utils/fetchClient'

export const WalletService = {
  getWalletInfo: async () => {
    return fetchClient('/wallets/me', {
      method: 'GET',
    })
  },
}
