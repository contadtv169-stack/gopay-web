import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useNotificationsStore from '../stores/notificationsStore'

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotificationsStore()
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-sm btn-outline" onClick={() => navigate(-1)}>← Voltar</button>
        <h2>Notificações</h2>
        <button className="btn btn-sm" onClick={markAllAsRead}>✓ Ler tudo</button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma notificação</p>
        </div>
      ) : (
        <div className="notif-list-page">
          {notifications.map((n, i) => (
            <motion.div
              className={`notif-page-item ${n.read ? '' : 'unread'}`}
              key={n.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => markAsRead(n.id)}
            >
              <div className="notif-page-body">
                <strong>{n.title}</strong>
                <p>{n.body}</p>
                <small>{new Date(n.time).toLocaleString('pt-BR')}</small>
              </div>
              {!n.read && <div className="notif-dot" />}
            </motion.div>
          ))}
        </div>
      )}

      {notifications.length > 0 && (
        <button className="btn btn-outline btn-full" style={{ marginTop: 12 }} onClick={clearAll}>
          🗑️ Limpar todas
        </button>
      )}
    </div>
  )
}
