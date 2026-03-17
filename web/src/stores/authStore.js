import { create } from 'zustand'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem('fieldcheck_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  token: localStorage.getItem('fieldcheck_token'),
  isAuthenticated: !!localStorage.getItem('fieldcheck_token'),

  setAuth: (user, token) => {
    localStorage.setItem('fieldcheck_token', token)
    localStorage.setItem('fieldcheck_user', JSON.stringify(user))
    set({ user, token, isAuthenticated: true })
  },

  clearAuth: () => {
    localStorage.removeItem('fieldcheck_token')
    localStorage.removeItem('fieldcheck_user')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))
