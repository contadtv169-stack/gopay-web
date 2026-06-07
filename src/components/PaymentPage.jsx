import { useState, useEffect } from 'react'
import api from '../api'

export default function PaymentPage() {
  const [linkId, setLinkId] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  function getPixCode() { return data ? (data.copyPaste || data.pixCode || '') : '' }
  function getQrSrc() { return data ? (data.qrCodeBase64 || data.qr_image_url) : '' }
  function hasPix() { const c = getPixCode(); return !!c && c.startsWith('000201') }

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
    const code = getPixCode() || data?.paymentLink || ''
    if (!code) return
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {}
  }

  async function shareLink() {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: 'GoPay - Pagamento via PIX', text: `Pague ${formatMoney(data?.amount)} via PIX`, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
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

  // Redirect to success after paid
  useEffect(() => {
    if (data?.status === 'paid' || data?.status === 'completed') {
      const t = setTimeout(() => {
        window.location.href = '/gopay-web/'
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [data?.status])

  function formatMoney(v) {
    return 'R$ ' + (v || 0).toFixed(2).replace('.', ',')
  }

  if (!linkId) return null

  if (loading) {
    return (
      <div className="pay-page">
        <div className="pay-loading">
          <div className="pay-loading-logo">Go<span>Pay</span></div>
          <p>⏳ Carregando pagamento...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="pay-page">
        <header className="pay-header">
          <div className="pay-logo">Go<span>Pay</span></div>
        </header>
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

  return (
    <div className="pay-page">
      <header className="pay-header">
        <div className="pay-logo">Go<span>Pay</span></div>
        <button className="btn btn-sm btn-outline pay-share" onClick={shareLink}>
          📤 Compartilhar
        </button>
      </header>

      <main className="pay-main">
        {isPaid ? (
          <div className="pay-success">
            <div className="pay-success-icon">✅</div>
            <h2>Pagamento Confirmado!</h2>
            <p className="pay-amount">{formatMoney(data.amount)}</p>
            <p>{data.description}</p>
            <p className="pay-success-redirect">Redirecionando em 5 segundos...</p>
            <a href="/gopay-web/" className="btn">Voltar ao GoPay</a>
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
              <div className="pay-price">{formatMoney(data.amount)}</div>
            </div>

            {getQrSrc() && (
              <div className="pay-qr-area">
                <img src={getQrSrc()} alt="QR Code" className="pay-qr" />
                <p>Escaneie o QR Code com seu banco</p>
              </div>
            )}

            {hasPix() ? (
              <div className="pay-copy-area">
                <p className="pay-copy-label">Ou copie o código PIX:</p>
                <div className="pay-pixcode">{getPixCode()}</div>
                <button className="btn btn-copy" onClick={copyPix}>
                  {copied ? '✅ Copiado!' : '📋 Copiar Código PIX'}
                </button>
              </div>
            ) : (
              <div className="pay-copy-area">
                <p className="pay-copy-label">Link do pagamento:</p>
                <div className="pay-pixcode" style={{ fontSize: 12, wordBreak: 'break-all' }}>{data.paymentLink || getPixCode()}</div>
                <button className="btn btn-copy" onClick={() => { navigator.clipboard.writeText(data.paymentLink || getPixCode() || ''); setCopied(true); setTimeout(() => setCopied(false), 3000) }}>
                  {copied ? '✅ Copiado!' : '📋 Copiar Link'}
                </button>
              </div>
            )}

            {!getQrSrc() && !getPixCode() && (
              <div className="pay-no-pix">
                <p>⏳ Gerando código PIX...</p>
              </div>
            )}

            <div className="pay-status-bar">
              <span className="pay-status-dot pulse"></span>
              Aguardando pagamento...
            </div>

            <div className="pay-timer">
              ⏱️ O PIX expira em 20 minutos
            </div>

            <div className="pay-brands">
              <p>Pagamento processado por</p>
              <div className="pay-brands-logos">
                {data.gateway === 'krypt' ? '🔷 KryptGateway' : data.gateway === 'pixkey' ? '🔒 PIX Offline' : '💚 PixGo API'}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="pay-footer">
        <p>GoPay &copy; 2026 &mdash; Pagamentos via PIX</p>
        <p className="pay-footer-small">contadtv169-stack.github.io/gopay-web</p>
      </footer>
    </div>
  )
}
