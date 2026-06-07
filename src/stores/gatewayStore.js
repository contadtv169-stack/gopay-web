import { create } from 'zustand'
import { getKeyType } from '../pix'

const stored = JSON.parse(localStorage.getItem('gopay_gateway') || 'null')

const useGatewayStore = create((set, get) => ({
  connected: stored?.connected || null,
  credentials: stored?.credentials || null,
  balance: stored?.balance || null,
  mode: stored?.mode || null,

  connect: async (gateway, credentials, mode) => {
    if (gateway === 'krypt') {
      const state = { connected: gateway, credentials, balance: null, mode: 'api' }
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
        if (!json.success) return { success: false, error: json.message || json.error || 'API Key PixGo inválida (CORS pode estar bloqueando)' }
        const state = { connected: gateway, credentials, balance: null, mode: 'api' }
        localStorage.setItem('gopay_gateway', JSON.stringify(state))
        set(state)
        return { success: true }
      } catch (e) {
        return { success: false, error: 'Erro de conexão PixGo: ' + e.message + '. Tente usar "Chave PIX Local" (offline).' }
      }
    }
    if (gateway === 'pixkey') {
      const keyType = getKeyType(credentials.pixKey)
      const state = { connected: gateway, credentials, balance: null, mode: 'offline' }
      localStorage.setItem('gopay_gateway', JSON.stringify(state))
      set(state)
      return { success: true, data: { keyType } }
    }
    return { success: false, error: 'Gateway não suportado' }
  },

  disconnect: () => {
    localStorage.removeItem('gopay_gateway')
    set({ connected: null, credentials: null, balance: null, mode: null })
  },

  fetchBalance: async () => null
}))

export default useGatewayStore
