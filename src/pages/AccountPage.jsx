import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useGatewayStore from '../stores/gatewayStore'
import useNotificationsStore from '../stores/notificationsStore'

export default function AccountPage() {
  const { user, logout } = useAuthStore()
  const { connected, disconnect } = useGatewayStore()
  const { addNotification } = useNotificationsStore()
  const navigate = useNavigate()
  const [showLogout, setShowLogout] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  function handleDisconnect() {
    disconnect()
    addNotification('🔌 Gateway desconectado', 'Seu gateway foi desconectado', 'warning')
  }

  const initial = user?.name?.charAt(0)?.toUpperCase() || 'U'

  return (
    <div className="page">
      <div className="profile-header">
        <motion.div className="profile-avatar" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          {initial}
        </motion.div>
        <h2>{user?.name || 'Usuário'}</h2>
        <p className="profile-email">{user?.email || ''}</p>
        {connected && (
          <div className="profile-badge">Gateway: {connected === 'krypt' ? '🔷 KryptGateway' : '💚 PixGo'} ✓</div>
        )}
      </div>

      <div className="profile-sections">
        <div className="profile-section">
          <h3>Gateway</h3>
          <div className="profile-item" onClick={() => navigate('/app/conectar')}>
            <span>🔌 Gateway conectado</span>
            <span className="profile-item-right">{connected ? (connected === 'krypt' ? 'KryptGateway' : 'PixGo') : 'Nenhum'} ›</span>
          </div>
          {connected && (
            <div className="profile-item danger" onClick={handleDisconnect}>
              <span>Desconectar gateway</span>
              <span>›</span>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>Suporte</h3>
          <div className="profile-item" onClick={() => window.open('https://pixgo.org', '_blank')}>
            <span>🆘 Ajuda</span>
            <span>›</span>
          </div>
          <div className="profile-item">
            <span>📄 Termos de uso</span>
            <span>›</span>
          </div>
          <div className="profile-item">
            <span>🔒 Política de privacidade</span>
            <span>›</span>
          </div>
        </div>

        <div className="profile-section">
          <h3>App</h3>
          <div className="profile-item" onClick={() => navigate('/app/notificacoes')}>
            <span>🔔 Notificações</span>
            <span>›</span>
          </div>
          <div className="profile-item">
            <span>📱 Versão 1.0.1 - 07/06/2026</span>
            <span></span>
          </div>
        </div>

        <motion.button className="btn btn-lg btn-full btn-danger" onClick={() => setShowLogout(true)} whileTap={{ scale: 0.98 }}>
          🚪 Sair
        </motion.button>
      </div>

      {showLogout && (
        <div className="modal-overlay" onClick={() => setShowLogout(false)}>
          <motion.div className="modal-content" initial={{ y: 200, opacity: 0 }} animate={{ y: 0, opacity: 1 }} onClick={e => e.stopPropagation()}>
            <h3>Sair do GoPay?</h3>
            <p>Você precisará fazer login novamente.</p>
            <div className="modal-actions">
              <button className="btn btn-danger" onClick={handleLogout}>Sair</button>
              <button className="btn btn-outline" onClick={() => setShowLogout(false)}>Cancelar</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
