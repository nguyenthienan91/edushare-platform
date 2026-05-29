// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { decodeToken } from '../utils/jwt'

export interface UserContext {
  userID: string
  userEmail: string
  role: string
  [key: string]: any
}

interface AuthContextType {
  user: UserContext | null
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string) => UserContext | null
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserContext | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      const decoded = decodeToken(token)
      // Check expiration if we have it
      if (decoded && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
        setUser(decoded)
      } else {
        logout()
      }
    }
  }, [])

  const login = (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    const decoded = decodeToken(accessToken)
    if (decoded) {
      setUser(decoded)
      return decoded
    }
    return null
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
