import { create } from 'zustand'

const stored = JSON.parse(localStorage.getItem('gopay_notifications') || '[]')

const useNotificationsStore = create((set, get) => ({
  notifications: stored,

  addNotification: (title, body, type = 'info') => {
    const n = { id: Date.now(), title, body, type, time: new Date().toISOString(), read: false }
    const updated = [n, ...get().notifications].slice(0, 50)
    set({ notifications: updated })
    localStorage.setItem('gopay_notifications', JSON.stringify(updated))
  },

  markAsRead: (id) => {
    const updated = get().notifications.map(n => n.id === id ? { ...n, read: true } : n)
    set({ notifications: updated })
    localStorage.setItem('gopay_notifications', JSON.stringify(updated))
  },

  markAllAsRead: () => {
    const updated = get().notifications.map(n => ({ ...n, read: true }))
    set({ notifications: updated })
    localStorage.setItem('gopay_notifications', JSON.stringify(updated))
  },

  clearAll: () => {
    set({ notifications: [] })
    localStorage.setItem('gopay_notifications', '[]')
  },

  unreadCount: () => {
    return get().notifications.filter(n => !n.read).length
  }
}))

export default useNotificationsStore
