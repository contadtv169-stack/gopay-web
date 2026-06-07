import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '../stores/authStore'
import useGatewayStore from '../stores/gatewayStore'
import useLinksStore from '../stores/linksStore'
import useNotificationsStore from '../stores/notificationsStore'
import api from '../api'

export default function Dashboard() {
  const { user } = useAuthStore()
  const { connected, balance, fetchBalance, mode } = useGatewayStore()
  const { links } = useLinksStore()
  const { addNotification } = useNotificationsStore()
  const navigate = useNavigate()
  const [hideBalance, setHideBalance] = useState(false)
  const [dashData, setDashData] = useState({ balance: 0, payments: 0, monthTotal: 0 })

  useEffect(() => {
    if (connected) fetchBalance()
    api.getDashboard().then(d => {
      if (d.success && d.data) setDashData(d.data)
    })
  }, [connected])

  useEffect(() => {
    if (!connected) {
      addNotification('🔌 Conecte um gateway', 'Conecte PixGo ou KryptGateway para começar', 'warning')
      navigate('/app/conectar')
    }
  }, [])

  const paidCount = links.filter(l => l.status === 'paid' || l.status === 'completed').length

  return (
    <div className="page dash-page">
      <div className="dash-top">
        <div className="dash-greeting">
          <h2>Olá, {user?.name?.split(' ')[0] || 'Usuário'}! 👋</h2>
          <p>Bem-vindo ao GoPay</p>
        </div>
        <button className="notif-top-btn" onClick={() => navigate('/app/notificacoes')}>🔔</button>
      </div>

      {!connected ? (
        <motion.div
          className="gateway-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="gateway-banner-icon">🔌</div>
          <div className="gateway-banner-text">
            <strong>Conecte um gateway</strong>
            <p>Conecte PixGo ou KryptGateway para começar a receber</p>
          </div>
          <button className="btn btn-sm" onClick={() => navigate('/app/conectar')}>Conectar</button>
        </motion.div>
      ) : null}

      <motion.div className="balance-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="balance-label">Saldo disponível</div>
        <div className="balance-value">
          {hideBalance ? 'R$ ••••' : `R$ ${((balance?.availableBalance || balance?.balance || dashData.balance) || 0).toFixed(2).replace('.', ',')}`}
          <button className="balance-toggle" onClick={() => setHideBalance(!hideBalance)}>
            {hideBalance ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        <div className="balance-gateway">
          {mode === 'offline' ? '🔒 Offline (PIX local)' : `via ${connected === 'krypt' ? 'KryptGateway' : 'PixGo'}`}
        </div>
      </motion.div>

      <div className="metrics-grid">
        <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="metric-icon green">💰</div>
          <div className="metric-info">
            <strong>Pagamentos</strong>
            <span>{paidCount}</span>
          </div>
        </motion.div>
        <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="metric-icon blue">🔗</div>
          <div className="metric-info">
            <strong>Links</strong>
            <span>{links.length}</span>
          </div>
        </motion.div>
        <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="metric-icon orange">📅</div>
          <div className="metric-info">
            <strong>Este mês</strong>
            <span>R$ {(dashData.monthTotal || 0).toFixed(2).replace('.', ',')}</span>
          </div>
        </motion.div>
        <motion.div className="metric-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="metric-icon purple">📊</div>
          <div className="metric-info">
            <strong>Saldo total</strong>
            <span>R$ {(dashData.balance || 0).toFixed(2).replace('.', ',')}</span>
          </div>
        </motion.div>
      </div>

      <div className="quick-actions">
        <motion.button className="qa-btn" onClick={() => navigate('/app/criar')} whileTap={{ scale: 0.95 }}>
          <div className="qa-icon blue">➕</div>
          <span>Novo Link</span>
        </motion.button>
        <motion.button className="qa-btn" onClick={() => navigate('/app/links')} whileTap={{ scale: 0.95 }}>
          <div className="qa-icon green">🔗</div>
          <span>Links</span>
        </motion.button>
        <motion.button className="qa-btn" onClick={() => navigate('/app/saque')} whileTap={{ scale: 0.95 }}>
          <div className="qa-icon orange">💳</div>
          <span>Saque</span>
        </motion.button>
        <motion.button className="qa-btn" onClick={() => navigate('/app/conta')} whileTap={{ scale: 0.95 }}>
          <div className="qa-icon purple">⚙️</div>
          <span>Config</span>
        </motion.button>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h3>Atividade recente</h3>
          <button className="section-link" onClick={() => navigate('/app/atividade')}>Ver todas</button>
        </div>
        {links.filter(l => l.status === 'paid' || l.status === 'completed').length === 0 ? (
          <div className="empty-state">
            <p>Nenhum pagamento recebido ainda</p>
            <button className="btn btn-sm" onClick={() => navigate('/app/criar')}>Criar primeiro link</button>
          </div>
        ) : (
          links.filter(l => l.status === 'paid' || l.status === 'completed').slice(0, 5).map((l, i) => (
            <motion.div className="activity-item" key={l.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="activity-icon green">✅</div>
              <div className="activity-info">
                <strong>Pagamento recebido</strong>
                <small>{l.description} • {l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : ''}</small>
              </div>
              <div className="activity-value green">+R$ {(l.amount || 0).toFixed(2).replace('.', ',')}</div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
