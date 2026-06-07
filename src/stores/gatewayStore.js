import { create } from 'zustand'

const stored = JSON.parse(localStorage.getItem('gopay_gateway') || 'null')

const useGatewayStore = create((set, get) => ({
  connected: stored?.connected || null,
  credentials: stored?.credentials || null,
  balance: stored?.balance || null,

  connect: async (gateway, credentials) => {
    if (gateway === 'krypt') {
      const { ci, cs } = credentials
      try {
        const res = await fetch('https://kryptgateway.netlify.app/api/gateway/balance', {
          headers: { ci, cs }
        })
        const json = await res.json()
        if (!json.success) return { success: false, error: 'Falha ao conectar KryptGateway' }
        const state = { connected: gateway, credentials, balance: json.data }
        localStorage.setItem('gopay_gateway', JSON.stringify(state))
        set(state)
        return { success: true }
      } catch {
        return { success: false, error: 'Erro de conexão com KryptGateway' }
      }
    }
    if (gateway === 'pixgo') {
      try {
        const res = await fetch('https://pixgo.org/api/v1/payment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': credentials.apiKey },
          body: JSON.stringify({ amount: 1, description: 'Teste GoPay', external_id: 'test' })
        })
        const json = await res.json()
        if (!json.success) return { success: false, error: 'API Key PixGo inválida' }
        const state = { connected: gateway, credentials, balance: null }
        localStorage.setItem('gopay_gateway', JSON.stringify(state))
        set(state)
        return { success: true }
      } catch {
        return { success: false, error: 'Erro de conexão com PixGo' }
      }
    }
    return { success: false, error: 'Gateway não suportado' }
  },

  disconnect: () => {
    localStorage.removeItem('gopay_gateway')
    set({ connected: null, credentials: null, balance: null })
  },

  fetchBalance: async () => {
    const { connected, credentials } = get()
    if (!connected || !credentials) return
    if (connected === 'krypt') {
      try {
        const res = await fetch('https://kryptgateway.netlify.app/api/gateway/balance', {
          headers: { ci: credentials.ci, cs: credentials.cs }
        })
        const json = await res.json()
        if (json.success) {
          set({ balance: json.data })
          const stored = JSON.parse(localStorage.getItem('gopay_gateway') || '{}')
          localStorage.setItem('gopay_gateway', JSON.stringify({ ...stored, balance: json.data }))
        }
      } catch {}
    }
  }
}))

export default useGatewayStore
