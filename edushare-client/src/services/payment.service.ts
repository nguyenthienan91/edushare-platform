// src/services/payment.service.ts
import { fetchClient } from '../utils/fetchClient'

export const PaymentService = {
  createDepositLink: async (amount: number) => {
    return fetchClient('/payment-gateway/create-link', {
      method: 'POST',
      body: JSON.stringify({ amount }),
      requireAuth: true
    })
  },
  cancelDeposit: async (orderCode: number) => {
    return fetchClient('/payment-gateway/cancel', {
      method: 'POST',
      body: JSON.stringify({ orderCode }),
      requireAuth: true
    })
  },
}
