import { create } from 'zustand'
import type { User, Company } from './api'

export type { User, Company }

interface AuthState {
  token: string | null
  user: User | null
  company: Company | null
  setToken: (token: string) => void
  setUser: (user: User) => void
  setCompany: (company: Company) => void
  logout: () => void
  isAuthenticated: () => boolean
}

const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken')
  }
  return null
}

const getStoredUser = () => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('user')
    if (raw) {
      try {
        return JSON.parse(raw) as User
      } catch {
        return null
      }
    }
  }
  return null
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  token: getStoredToken(),
  user: getStoredUser(),
  company: null, // Company isn't strictly requested to persist by the user, but we can set it via setUser side-effects later if needed
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token)
    }
    set({ token })
  },
  setUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
    set({ user })
  },
  setCompany: (company) => set({ company }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
    }
    set({ token: null, user: null, company: null })
  },
  isAuthenticated: () => !!get().token,
}))
