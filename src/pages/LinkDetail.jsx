import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useParams, useNavigate } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import useLinksStore from '../stores/linksStore'
import useNotificationsStore from '../stores/notificationsStore'

export default function LinkDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { links, deleteLink } = useLinksStore()
  const { addNotification } = useNotificationsStore()
  const [link, setLink] = useState(null)

  useEffect(() => {
    const found = links.find(l => l.id === id)
    if (found) setLink(found)
  }, [id, links])

  async function handleDelete() {
    if (!confirm('Tem certeza?')) return
    const d = await deleteLink(id)
    if (d.success) {
      addNotification('🗑️ Link excluído', 'Link removido com sucesso', 'warning')
      navigate('/app/links')
    }
  }

  function formatMoney(v) { return 'R$ ' + (v || 0).toFixed(2).replace('.', ',') }

  if (!link) return <div className="page"><div className="loading">⏳ Carregando...</div></div>

  return (
    <div className="page">
      <div className="page-header">
        <button className="btn btn-sm btn-outline" onClick={() => navigate(-1)}>← Voltar</button>
        <h2>Informações do Link</h2>
      </div>

      <div className="detail-url-card">
        <div className="detail-url">{link.paymentLink}</div>
        <button className="btn btn-sm" onClick={() => { navigator.clipboard.writeText(link.paymentLink); alert('Copiado!') }}>📋 Copiar</button>
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <small>Valor</small>
          <strong>{formatMoney(link.amount)}</strong>
        </div>
        <div className="detail-item">
          <small>Descrição</small>
          <strong>{link.description || '-'}</strong>
        </div>
        <div className="detail-item">
          <small>Gateway</small>
          <strong>{link.gateway === 'krypt' ? '🔷 KryptGateway' : '💚 PixGo'}</strong>
        </div>
        <div className="detail-item">
          <small>Status</small>
          <strong className={link.status === 'paid' ? 'green' : ''}>{link.status}</strong>
        </div>
        <div className="detail-item">
          <small>Criado em</small>
          <strong>{link.createdAt ? new Date(link.createdAt).toLocaleString('pt-BR') : '-'}</strong>
        </div>
        {link.transactionId && (
          <div className="detail-item">
            <small>Transação</small>
            <strong style={{ fontSize: 11 }}>{link.transactionId}</strong>
          </div>
        )}
      </div>

      {link.paymentLink && (
        <div className="detail-qr">
          <QRCodeCanvas value={link.paymentLink} size={160} />
        </div>
      )}

      <div className="detail-actions">
        <button className="btn btn-danger btn-full" onClick={handleDelete}>
          🗑️ Excluir link
        </button>
      </div>
    </div>
  )
}
