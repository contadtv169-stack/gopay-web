import { create } from 'zustand'
import api from '../api'

const stored = JSON.parse(localStorage.getItem('gopay_auth') || 'null')

const useAuthStore = create((set, get) => ({
  user: stored?.user || null,
  token: stored?.token || '',
  isAuthenticated: !!stored?.token,

  login: async (email, password) => {
    const d = await api.login(email, password)
    if (d.success) {
      const state = { user: d.user, token: d.token, isAuthenticated: true }
      localStorage.setItem('gopay_auth', JSON.stringify(state))
      set(state)
    }
    return d
  },

  register: async (name, email, password) => {
    const d = await api.register(name, email, password)
    if (d.success) {
      const state = { user: d.user, token: d.token, isAuthenticated: true }
      localStorage.setItem('gopay_auth', JSON.stringify(state))
      set(state)
    }
    return d
  },

  logout: () => {
    api.logout()
    localStorage.removeItem('gopay_auth')
    set({ user: null, token: '', isAuthenticated: false })
  }
}))

export default useAuthStore
