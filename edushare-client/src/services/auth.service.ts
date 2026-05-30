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
  },
  logout: async () => {
    return fetchClient('/auth/logout', {
      method: 'GET'
    })
  },
  forgotPassword: async (data: any) => {
    return fetchClient('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false
    })
  },
  resetPassword: async (token: string, data: any) => {
    return fetchClient(`/auth/reset-password?token=${token}`, {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: false
    })
  },
  changePassword: async (data: any) => {
    return fetchClient('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true
    })
  }
}
