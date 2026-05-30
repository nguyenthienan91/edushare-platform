// src/utils/http.ts
const baseUrl = ''

export const fetchAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('accessToken')
  
  const headers = new Headers(options.headers || {})
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', headers.get('Content-Type') || 'application/json')
  }

  const response = await fetch(`${baseUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`, {
    ...options,
    headers,
  })

  if (response.status === 401) {
    console.warn('Unauthorized request - Token might be invalid or expired')
    // Option: Trigger logout globally if needed here
  }

  return response
}
