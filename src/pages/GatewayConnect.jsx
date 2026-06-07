import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useGatewayStore from '../stores/gatewayStore'
import useNotificationsStore from '../stores/notificationsStore'

export default function GatewayConnect() {
  const { connected, connect } = useGatewayStore()
  const { addNotification } = useNotificationsStore()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)

  const [ci, setCi] = useState('')
  const [cs, setCs] = useState('')
  const [pixgoKey, setPixgoKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleConnectKrypt() {
    if (!ci || !cs) return setError('Preencha Client ID e Client Secret')
    setLoading(true); setError('')
    const d = await connect('krypt', { ci, cs })
    setLoading(false)
    if (d.success) {
      addNotification('🔷 KryptGateway', 'KryptGateway conectado com sucesso!', 'success')
      setModal(null)
    } else {
      setError(d.error || 'Erro ao conectar')
    }
  }

  async function handleConnectPixgo() {
    if (!pixgoKey) return setError('Preencha a API Key')
    setLoading(true); setError('')
    const d = await connect('pixgo', { apiKey: pixgoKey })
    setLoading(false)
    if (d.success) {
      addNotification('💚 PixGo', 'PixGo conectado com sucesso!', 'success')
      setModal(null)
    } else {
      setError(d.error || 'Erro ao conectar')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Conectar Gateway</h2>
      </div>
      <p className="page-subtitle">Conecte o GoPay ao seu provedor para receber pagamentos.</p>

      <div className="gateway-list">
        <motion.div
          className={`gateway-card ${connected === 'krypt' ? 'connected' : ''}`}
          onClick={() => setModal('krypt')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="gateway-card-icon">🔷</div>
          <div className="gateway-card-info">
            <strong>KryptGateway</strong>
            <span>kryptgateway.netlify.app</span>
          </div>
          <div className={`gateway-status ${connected === 'krypt' ? 'connected' : ''}`}>
            {connected === 'krypt' ? '✓ Conectado' : 'Conectar'}
          </div>
        </motion.div>

        <motion.div
          className={`gateway-card ${connected === 'pixgo' ? 'connected' : ''}`}
          onClick={() => setModal('pixgo')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="gateway-card-icon">💚</div>
          <div className="gateway-card-info">
            <strong>PixGo</strong>
            <span>pixgo.org</span>
          </div>
          <div className={`gateway-status ${connected === 'pixgo' ? 'connected' : ''}`}>
            {connected === 'pixgo' ? '✓ Conectado' : 'Conectar'}
          </div>
        </motion.div>
      </div>

      <p className="gateway-more">Mais opções em breve!</p>

      {connected && (
        <motion.button
          className="btn btn-lg btn-full"
          onClick={() => navigate('/app')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Ir para o painel
        </motion.button>
      )}

      {modal && (
        <div className="modal-overlay" onClick={() => { setModal(null); setError('') }}>
          <motion.div
            className="modal-content"
            initial={{ y: 200, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={e => e.stopPropagation()}
          >
            {modal === 'krypt' ? (
              <>
                <h3>🔷 Conectar KryptGateway</h3>
                <div className="form-group">
                  <label>Client ID (ci)</label>
                  <input type="text" placeholder="krypt_ci_..." value={ci} onChange={e => setCi(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Client Secret (cs)</label>
                  <input type="text" placeholder="krypt_cs_..." value={cs} onChange={e => setCs(e.target.value)} />
                </div>
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-lg btn-full" onClick={handleConnectKrypt} disabled={loading}>
                  {loading ? '⏳ Conectando...' : '🔗 Conectar'}
                </button>
                <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={() => { setModal(null); setError('') }}>
                  Cancelar
                </button>
              </>
            ) : (
              <>
                <h3>💚 Conectar PixGo</h3>
                <div className="form-group">
                  <label>API Key</label>
                  <input type="text" placeholder="pk_..." value={pixgoKey} onChange={e => setPixgoKey(e.target.value)} />
                </div>
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-lg btn-full" onClick={handleConnectPixgo} disabled={loading}>
                  {loading ? '⏳ Conectando...' : '🔗 Conectar'}
                </button>
                <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={() => { setModal(null); setError('') }}>
                  Cancelar
                </button>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  )
}
