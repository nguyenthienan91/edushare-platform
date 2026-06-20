import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { decodeToken } from '../utils/jwt'
import { AuthService } from '../services/auth.service'

export interface UserContext {
  userID: string
  userEmail: string
  role: string
  [key: string]: any
}

interface AuthContextType {
  user: UserContext | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (accessToken: string, refreshToken: string) => UserContext | null
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserContext | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken')
      if (token) {
        const decoded = decodeToken(token)
        // Check expiration if we have it
        if (decoded && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
          setUser(decoded)
        } else {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          setUser(null)
          try {
            await AuthService.logout()
          } catch (error) {
            console.error('Logout error on init:', error)
          }
        }
      }
      setIsLoading(false)
    }
    initAuth()
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

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
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
