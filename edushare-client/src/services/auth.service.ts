// src/services/auth.service.ts
import { fetchClient } from '../utils/fetchClient'

export const AuthService = {
  signUp: async (data: any) => {
    return fetchClient('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false
    })
  },
  signIn: async (data: any) => {
    return fetchClient('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false
    })
  }
}
