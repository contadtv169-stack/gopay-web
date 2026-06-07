import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const tabs = [
  { path: '/app', label: 'Início', icon: '🏠' },
  { path: '/app/links', label: 'Links', icon: '🔗' },
  { path: '/app/criar', label: '', icon: '+', central: true },
  { path: '/app/atividade', label: 'Atividade', icon: '📊' },
  { path: '/app/conta', label: 'Conta', icon: '👤' },
]

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <nav className="bottom-nav">
      {tabs.map((t) => {
        const active = location.pathname === t.path
        return t.central ? (
          <motion.button
            key={t.path}
            className="bottom-nav-central"
            onClick={() => navigate(t.path)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <span>+</span>
          </motion.button>
        ) : (
          <button
            key={t.path}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
            onClick={() => navigate(t.path)}
          >
            <span className="bottom-nav-icon">{t.icon}</span>
            <span className="bottom-nav-label">{t.label}</span>
          </button>
        )
      })}
    </nav>
  )
}
