import React, { createContext, useContext, useState } from 'react'
import axios from 'axios'

interface AuthUser {
  username: string
  token: string
}

interface AuthContextType {
  user: AuthUser | null
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'qingli_admin_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await axios.post('/api/auth/login', { username, password })
      const data = res.data
      if (data.success && data.data?.token) {
        const u: AuthUser = { username: data.data.username, token: data.data.token }
        setUser(u)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(u))
        return { success: true }
      }
      return { success: false, message: data.message || '登录失败' }
    } catch (err: any) {
      const msg = err?.response?.data?.message || '网络错误，请重试'
      return { success: false, message: msg }
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
