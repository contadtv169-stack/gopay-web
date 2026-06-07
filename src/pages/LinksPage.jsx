import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useLinksStore from '../stores/linksStore'

export default function LinksPage() {
  const { links, fetchLinks } = useLinksStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todos')

  useEffect(() => { fetchLinks() }, [])

  const filtered = links.filter(l => {
    if (filter === 'ativos' && l.status !== 'active' && l.status !== 'pending') return false
    if (filter === 'expirados' && l.status !== 'expired' && l.status !== 'canceled') return false
    if (filter === 'pagos' && l.status !== 'paid' && l.status !== 'completed') return false
    if (search && !l.description?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  function formatMoney(v) { return 'R$ ' + (v || 0).toFixed(2).replace('.', ',') }
  function statusLabel(s) {
    if (s === 'paid' || s === 'completed') return { text: 'Pago', cls: 'badge-paid' }
    if (s === 'expired' || s === 'canceled') return { text: 'Expirado', cls: 'badge-expired' }
    return { text: 'Ativo', cls: 'badge-active' }
  }

  const filters = [
    { key: 'todos', label: 'Todos' },
    { key: 'ativos', label: 'Ativos' },
    { key: 'pagos', label: 'Pagos' },
    { key: 'expirados', label: 'Expirados' },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <h2>Links</h2>
        <span className="page-count">{filtered.length}</span>
      </div>

      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Buscar links..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="filter-tabs">
        {filters.map(f => (
          <button key={f.key} className={`filter-tab ${filter === f.key ? 'on' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>{search ? 'Nenhum link encontrado' : 'Nenhum link criado'}</p>
          <button className="btn" onClick={() => navigate('/app/criar')}>Criar link</button>
        </div>
      ) : (
        <div className="links-list-page">
          {filtered.map((l, i) => {
            const st = statusLabel(l.status)
            return (
              <motion.div
                className="link-card"
                key={l.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => navigate(`/app/link/${l.id}`)}
              >
                <div className="link-card-top">
                  <div className="link-card-info">
                    <strong>{l.description || 'Link'}</strong>
                    <span className="link-card-value">{formatMoney(l.amount)}</span>
                  </div>
                  <span className={'badge ' + st.cls}>{st.text}</span>
                </div>
                <div className="link-card-meta">
                  <span>{l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
                  <span>{l.gateway === 'krypt' ? '🔷 Krypt' : '💚 PixGo'}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
