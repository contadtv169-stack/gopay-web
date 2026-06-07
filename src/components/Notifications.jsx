import { useState, useEffect } from 'react'
import api from '../api'

export default function Notifications() {
  const [showPanel, setShowPanel] = useState(false)
  const [notifs, setNotifs] = useState([])
  const [perm, setPerm] = useState(Notification.permission)

  useEffect(() => {
    const stored = localStorage.getItem('gopay_notifications')
    if (stored) setNotifs(JSON.parse(stored))
  }, [])

  function addNotif(title, body) {
    const n = { id: Date.now(), title, body, time: new Date().toISOString(), read: false }
    const updated = [n, ...notifs].slice(0, 20)
    setNotifs(updated)
    localStorage.setItem('gopay_notifications', JSON.stringify(updated))
    if (perm === 'granted') api.showLocalNotification(title, body)
  }

  async function requestPerm() {
    const ok = await api.requestNotificationPermission()
    if (ok) {
      setPerm('granted')
      await api.subscribeToPush()
      addNotif('✅ Notificações ativadas', 'Você receberá alertas de pagamento em tempo real')
    }
  }

  function markRead(id) {
    const updated = notifs.map(n => n.id === id ? { ...n, read: true } : n)
    setNotifs(updated)
    localStorage.setItem('gopay_notifications', JSON.stringify(updated))
  }

  function clearAll() {
    setNotifs([])
    localStorage.removeItem('gopay_notifications')
  }

  const unread = notifs.filter(n => !n.read).length

  // Poll para novos pagamentos
  useEffect(() => {
    const user = api.getUser()
    if (!user) return
    let lastCount = notifs.length
    const interval = setInterval(async () => {
      try {
        const d = await api.getDashboard()
        if (d.success && d.data?.payments > lastCount) {
          addNotif('💰 Pagamento recebido!', 'Um novo pagamento foi confirmado.')
          lastCount = d.data.payments
        }
      } catch {}
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  // Expor addNotif globalmente
  useEffect(() => {
    window.__gopayNotify = addNotif
    return () => { delete window.__gopayNotify }
  }, [])

  return (
    <>
      <button className="notif-bell" onClick={() => setShowPanel(!showPanel)}>
        🔔{unread > 0 && <span className="notif-badge">{unread}</span>}
      </button>

      {showPanel && (
        <div className="notif-panel">
          <div className="notif-header">
            <strong>Notificações</strong>
            <button className="notif-clear" onClick={clearAll}>Limpar</button>
          </div>

          {perm !== 'granted' && (
            <div className="notif-prompt">
              <p>🔔 Ative as notificações para receber alertas</p>
              <button className="btn btn-sm" onClick={requestPerm}>Ativar</button>
            </div>
          )}

          {notifs.length === 0 ? (
            <p className="notif-empty">Nenhuma notificação</p>
          ) : (
            notifs.map(n => (
              <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => markRead(n.id)}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body">{n.body}</div>
                <div className="notif-time">{new Date(n.time).toLocaleString('pt-BR')}</div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  )
}

// Hook para criar notificacao de qualquer lugar
export function useNotify() {
  return (title, body) => {
    if (window.__gopayNotify) window.__gopayNotify(title, body)
  }
}
