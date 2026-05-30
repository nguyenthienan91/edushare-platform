// src/utils/fetchClient.ts

interface FetchOptions extends RequestInit {
  requireAuth?: boolean;
}

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
const API_URL = `${baseUrl}/api`;

export const fetchClient = async (endpoint: string, options: FetchOptions = {}) => {
  const { requireAuth = true, headers: customHeaders, ...restOptions } = options;
  
  const headers = new Headers(customHeaders);
  
  // Set default content type if not provided
  if (!headers.has('Content-Type') && !(restOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Attach Authorization header if required
  if (requireAuth) {
    const token = localStorage.getItem('accessToken');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  const response = await fetch(url, {
    ...restOptions,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  return response.json();
};
