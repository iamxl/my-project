import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authApi } from '../services/api'
import { useTelegram } from '../hooks/useTelegram'

interface User {
  id: number
  telegramId: string
  firstName: string
  lastName?: string
  username?: string
  phone?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  loading: boolean
  login: (initData: string, phone?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const { tg } = useTelegram()

  useEffect(() => {
    // Проверяем сохраненный токен
    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      setToken(savedToken)
      // Проверяем токен и получаем пользователя
      verifyToken(savedToken)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const response = await authApi.verifyToken(tokenToVerify)
      if (response.valid) {
        // Токен валиден, получаем профиль
        await fetchProfile(tokenToVerify)
      } else {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      }
    } catch (error) {
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async (tokenToFetch?: string) => {
    try {
      const profile = await authApi.getProfile(tokenToFetch || token!)
      setUser(profile.user)
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
    }
  }

  const login = async (initData: string, phone?: string) => {
    try {
      const response = await authApi.login(initData, phone)
      setToken(response.token)
      setUser(response.user)
      localStorage.setItem('token', response.token)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

