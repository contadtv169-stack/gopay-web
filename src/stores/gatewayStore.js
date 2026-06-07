import { create } from 'zustand'

const stored = JSON.parse(localStorage.getItem('gopay_gateway') || 'null')

const useGatewayStore = create((set, get) => ({
  connected: stored?.connected || null,
  credentials: stored?.credentials || null,
  balance: stored?.balance || null,

  connect: async (gateway, credentials) => {
    if (gateway === 'krypt') {
      const state = { connected: gateway, credentials, balance: null }
      localStorage.setItem('gopay_gateway', JSON.stringify(state))
      set(state)
      return { success: true }
    }
    if (gateway === 'pixgo') {
      try {
        const res = await fetch('https://pixgo.org/api/v1/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': credentials.apiKey },
          body: JSON.stringify({ amount: 10.00, description: 'Teste GoPay', external_id: 'gopay_test_' + Date.now() })
        })
        const text = await res.text()
        let json
        try { json = JSON.parse(text) } catch { json = { success: false, message: text } }
        if (!json.success) return { success: false, error: json.message || json.error || 'API Key PixGo inválida' }
        const state = { connected: gateway, credentials, balance: null }
        localStorage.setItem('gopay_gateway', JSON.stringify(state))
        set(state)
        return { success: true }
      } catch (e) {
        return { success: false, error: 'Erro de conexão: ' + e.message }
      }
    }
    return { success: false, error: 'Gateway não suportado' }
  },

  disconnect: () => {
    localStorage.removeItem('gopay_gateway')
    set({ connected: null, credentials: null, balance: null })
  },

  fetchBalance: async () => {
    // Balance fetching requires server-side proxy due to CORS
    return null
  }
}))

export default useGatewayStore
