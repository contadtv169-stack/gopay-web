import { useState, useEffect } from 'react'
import api from '../api'

export default function PaymentPage() {
  const [linkId, setLinkId] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('pay')
    if (id) {
      setLinkId(id)
      fetchPayment(id)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchPayment(id) {
    try {
      const d = await api.getPaymentLink(id)
      if (d.success) {
        setData(d.data)
      } else {
        setError(d.error || 'Link não encontrado')
      }
    } catch {
      setError('Erro ao carregar pagamento')
    }
    setLoading(false)
  }

  async function copyPix() {
    const code = data?.copyPaste || data?.pixCode || ''
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  async function fetchStatus() {
    if (!linkId) return
    try {
      const d = await api.getPaymentStatus(linkId)
      if (d.success) setData(prev => ({ ...prev, status: d.data.status }))
    } catch {}
  }

  useEffect(() => {
    if (!linkId || !data) return
    if (data.status === 'paid' || data.status === 'completed' || data.status === 'expired') return
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [linkId, data?.status])

  if (!linkId) return null

  if (loading) {
    return (
      <div className="pay-page">
        <div className="pay-loading">⏳ Carregando pagamento...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pay-page">
        <div className="pay-error">
          <div className="pay-error-icon">❌</div>
          <h2>Link não encontrado</h2>
          <p>Este link de pagamento é inválido ou expirou.</p>
            <a href="/gopay-web/" className="btn">Ir para GoPay</a>
        </div>
      </div>
    )
  }

  const isPaid = data.status === 'paid' || data.status === 'completed'
  const isExpired = data.status === 'expired' || data.status === 'canceled'
  const qrSrc = data.qrCodeBase64 || data.qr_image_url

  return (
    <div className="pay-page">
      <header className="pay-header">
        <div className="pay-logo">Go<span>Pay</span></div>
      </header>

      <main className="pay-main">
        {isPaid ? (
          <div className="pay-success">
            <div className="pay-success-icon">✅</div>
            <h2>Pagamento Confirmado!</h2>
            <p className="pay-amount">R$ {(data.amount || 0).toFixed(2).replace('.', ',')}</p>
            <p>{data.description}</p>
          </div>
        ) : isExpired ? (
          <div className="pay-error">
            <div className="pay-error-icon">⏰</div>
            <h2>Link Expirado</h2>
            <p>Este link de pagamento não está mais disponível.</p>
          <a href="/gopay-web/" className="btn">Ir para GoPay</a>
          </div>
        ) : (
          <div className="pay-active">
            <div className="pay-info">
              <p className="pay-label">Pagamento via PIX</p>
              <h2 className="pay-amount-title">{data.description || 'Pagamento'}</h2>
              <div className="pay-price">R$ {(data.amount || 0).toFixed(2).replace('.', ',')}</div>
            </div>

            {qrSrc && (
              <div className="pay-qr-area">
                <img src={qrSrc} alt="QR Code PIX" className="pay-qr" />
                <p>Escaneie o QR Code com seu banco</p>
              </div>
            )}

            {(data.copyPaste || data.pixCode) && (
              <div className="pay-copy-area">
                <p className="pay-copy-label">Ou copie o código PIX:</p>
                <div className="pay-pixcode">{data.copyPaste || data.pixCode}</div>
                <button className="btn" onClick={copyPix}>
                  {copied ? '✅ Copiado!' : '📋 Copiar Código'}
                </button>
              </div>
            )}

            <div className="pay-status-bar">
              <span className="pay-status-dot pulse"></span>
              Aguardando pagamento...
            </div>
          </div>
        )}
      </main>

      <footer className="pay-footer">
        <p>GoPay &copy; 2026 &mdash; Pagamentos via PIX</p>
        <p className="pay-footer-small">gopayapp1.netlify.app</p>
      </footer>
    </div>
  )
}
