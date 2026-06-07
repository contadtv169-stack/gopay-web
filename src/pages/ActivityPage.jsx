import { useState } from 'react'
import { motion } from 'framer-motion'
import useLinksStore from '../stores/linksStore'

export default function ActivityPage() {
  const { links } = useLinksStore()
  const [period, setPeriod] = useState('tudo')

  const periods = [
    { key: 'hoje', label: 'Hoje' },
    { key: '7d', label: '7 dias' },
    { key: '30d', label: '30 dias' },
    { key: 'tudo', label: 'Tudo' },
  ]

  const now = new Date()
  const filtered = links.filter(l => {
    if (!l.createdAt) return period === 'tudo'
    const d = new Date(l.createdAt)
    if (period === 'hoje') return d.toDateString() === now.toDateString()
    if (period === '7d') return (now - d) / 86400000 <= 7
    if (period === '30d') return (now - d) / 86400000 <= 30
    return true
  })

  const total = filtered.reduce((s, l) => s + (l.amount || 0), 0)
  const paid = filtered.filter(l => l.status === 'paid' || l.status === 'completed')

  function formatMoney(v) { return 'R$ ' + (v || 0).toFixed(2).replace('.', ',') }
  function statusIcon(s) {
    if (s === 'paid' || s === 'completed') return { icon: '✅', cls: 'green' }
    if (s === 'pending' || s === 'active') return { icon: '⏳', cls: 'yellow' }
    return { icon: '❌', cls: 'gray' }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Atividade</h2>
        <span className="page-total">{formatMoney(total)}</span>
      </div>

      <div className="filter-tabs">
        {periods.map(p => (
          <button key={p.key} className={`filter-tab ${period === p.key ? 'on' : ''}`} onClick={() => setPeriod(p.key)}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="period-summary">
        <div className="period-stat">
          <small>Período</small>
          <strong>{filtered.length} transações</strong>
        </div>
        <div className="period-stat">
          <small>Recebido</small>
          <strong className="green">{formatMoney(total)}</strong>
        </div>
        <div className="period-stat">
          <small>Pagos</small>
          <strong className="green">{paid.length}</strong>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>Nenhuma transação no período</p>
        </div>
      ) : (
        <div className="activity-list">
          {[...filtered].reverse().map((l, i) => {
            const si = statusIcon(l.status)
            return (
              <motion.div className="activity-item" key={l.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
                <div className={`activity-icon ${si.cls}`}>{si.icon}</div>
                <div className="activity-info">
                  <strong>{l.description || 'Link'}</strong>
                  <small>{l.createdAt ? new Date(l.createdAt).toLocaleString('pt-BR') : '-'}</small>
                </div>
                <div className={`activity-value ${si.cls}`}>
                  {l.status === 'paid' || l.status === 'completed' ? '+' : ''}{formatMoney(l.amount)}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
