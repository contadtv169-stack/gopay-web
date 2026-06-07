import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useGatewayStore from '../stores/gatewayStore'

export default function WithdrawPage() {
  const { connected, balance } = useGatewayStore()
  const navigate = useNavigate()

  const url = connected === 'krypt' ? 'https://kryptgateway.netlify.app' : 'https://pixgo.org'

  return (
    <div className="page">
      <div className="page-header">
        <h2>Saque</h2>
      </div>

      <motion.div className="withdraw-notice" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="withdraw-notice-icon">💼</div>
        <div className="withdraw-notice-text">
          <strong>O saque é realizado diretamente no app do seu gateway.</strong>
          <p>Você está conectado via {connected === 'krypt' ? 'KryptGateway' : 'PixGo'}</p>
        </div>
      </motion.div>

      <div className="balance-card small">
        <div className="balance-label">Saldo disponível</div>
        <div className="balance-value">
          R$ {((balance?.availableBalance || balance?.balance || 0)).toFixed(2).replace('.', ',')}
        </div>
      </div>

      <motion.button
        className="btn btn-lg btn-full"
        onClick={() => window.open(url, '_blank')}
        whileTap={{ scale: 0.98 }}
      >
        Ir para {connected === 'krypt' ? 'KryptGateway' : 'PixGo'}
      </motion.button>

      <p className="withdraw-note">
        O GoPay não realiza saques. Gerencie seu saldo no app conectado.
      </p>
    </div>
  )
}
