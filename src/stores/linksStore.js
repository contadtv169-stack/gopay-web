import { create } from 'zustand'
import api from '../api'

const useLinksStore = create((set, get) => ({
  links: [],
  loading: false,

  fetchLinks: async () => {
    set({ loading: true })
    const d = await api.getLinks()
    if (d.success) set({ links: d.data })
    set({ loading: false })
    return d
  },

  createLink: async (amount, description, gateway, apiKey) => {
    const d = await api.createLink(amount, description, gateway, apiKey)
    if (d.success) {
      set(state => ({ links: [d.data, ...state.links] }))
    }
    return d
  },

  deleteLink: async (id) => {
    const d = await api.deleteLink(id)
    if (d.success) {
      set(state => ({ links: state.links.filter(l => l.id !== id) }))
    }
    return d
  },

  getLink: (id) => {
    return get().links.find(l => l.id === id) || null
  }
}))

export default useLinksStore
