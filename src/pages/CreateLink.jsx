import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useLinksStore from '../stores/linksStore'
import useGatewayStore from '../stores/gatewayStore'
import useNotificationsStore from '../stores/notificationsStore'
import { QRCodeCanvas } from 'qrcode.react'

export default function CreateLink() {
  const { createLink } = useLinksStore()
  const { connected, credentials } = useGatewayStore()
  const { addNotification } = useNotificationsStore()
  const navigate = useNavigate()
  const [amount, setAmount] = useState('')
  const [desc, setDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  async function handleCreate() {
    const amt = amount.replace(',', '.')
    if (!amt || parseFloat(amt) < 10) return alert('Valor mínimo: R$ 10,00')
    if (!connected) return alert('Conecte um gateway primeiro em Configurações > Gateway')
    setLoading(true)
    const gw = connected
    const key = credentials?.apiKey || (credentials?.ci ? `${credentials.ci}||${credentials.cs}` : '')
    const d = await createLink(parseFloat(amt), desc || 'Link GoPay', gw, key)
    setLoading(false)
    if (d.success) {
      addNotification('🔗 Link criado', `Link de ${amt} criado com sucesso`, 'success')
      setResult(d.data)
    } else {
      alert(d.error || 'Erro ao criar link')
    }
  }

  if (result) {
    const qrSrc = result.qrCodeBase64 || result.qr_image_url
    const isFallback = qrSrc && qrSrc.startsWith('https://api.qrserver.com')
    const pixCode = result.copyPaste || result.pixCode || ''
    const hasPix = pixCode && !isFallback
    return (
      <div className="page">
        <motion.div className="success-screen" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="success-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            ✅
          </motion.div>
          <h2>Link gerado com sucesso!</h2>
          <p className="pay-price-title">R$ {(result.amount || 0).toFixed(2).replace('.', ',')}</p>
          <p>{result.description}</p>

          {qrSrc && (
            <div className="result-qr">
              <img src={qrSrc} alt="QR Code" style={{ width: 200, height: 200, borderRadius: 12 }} />
              <p className="result-qr-label">{isFallback ? 'Escaneie para abrir o link' : 'Escaneie com seu banco'}</p>
            </div>
          )}

          {hasPix && (
            <div className="result-pix-card">
              <div className="result-pix-label">Código PIX</div>
              <div className="result-pix-code">{pixCode}</div>
              <button className="btn" onClick={() => { navigator.clipboard.writeText(pixCode); alert('Código PIX copiado!') }}>📋 Copiar PIX</button>
            </div>
          )}

          <div className="result-link-card">
            <small>Link do pagamento</small>
            <div className="result-link-row">
              <span className="result-link-url">{result.paymentLink}</span>
              <button className="btn btn-sm" onClick={() => { navigator.clipboard.writeText(result.paymentLink); alert('Link copiado!') }}>📋</button>
            </div>
          </div>

          <div className="result-actions">
            <button className="btn btn-lg" onClick={() => {
              const shareData = hasPix ? pixCode : result.paymentLink
              if (navigator.share) navigator.share({ title: 'GoPay', text: `Pague R$ ${result.amount} via PIX`, url: result.paymentLink })
              else navigator.clipboard.writeText(shareData)
            }}>
              📤 Compartilhar
            </button>
            <button className="btn btn-lg btn-outline" onClick={() => setResult(null)}>
              Criar outro link
            </button>
            <button className="btn btn-lg btn-outline" onClick={() => navigate('/app')}>
              Ir para o painel
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Novo Link</h2>
      </div>

      <div className="form-card">
        <div className="form-group">
          <label>Valor (R$)</label>
          <input type="text" placeholder="0,00" value={amount} onChange={e => setAmount(e.target.value)} className="input-lg" />
        </div>
        <div className="form-group">
          <label>Descrição</label>
          <input type="text" placeholder="Ex: Consultoria, Produto, Serviço..." value={desc} onChange={e => setDesc(e.target.value)} />
        </div>
        {!connected && (
          <div className="form-warning">
            ⚠️ Nenhum gateway conectado. Use PixGo (API Key) ou conecte um gateway.
          </div>
        )}
        <motion.button
          className="btn btn-lg btn-full"
          onClick={handleCreate}
          disabled={loading}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? '⏳ Gerando...' : '🔗 Gerar Link'}
        </motion.button>
      </div>
    </div>
  )
}
