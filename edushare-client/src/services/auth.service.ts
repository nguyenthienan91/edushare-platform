// src/services/auth.service.ts
const baseUrl = import.meta.env.VITE_API_BASE_URL
const API_URL = `${baseUrl}/api`

export const AuthService = {
  signUp: async (data: any) => {
    const response = await fetch(`${API_URL}/auth/sign-up`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || 'Có lỗi xảy ra khi đăng ký')
    }

    return response.json()
  }
}
