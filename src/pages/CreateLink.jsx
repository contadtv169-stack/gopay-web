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
    if (!amt || parseFloat(amt) < 1) return alert('Informe um valor válido (mínimo R$ 1,00)')
    setLoading(true)
    const gw = connected || 'pixgo'
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
    return (
      <div className="page">
        <motion.div className="success-screen" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div className="success-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
            ✅
          </motion.div>
          <h2>Link gerado com sucesso!</h2>
          <p>Compartilhe seu link para receber pagamentos.</p>

          <div className="result-url-card">
            <div className="result-url">{result.paymentLink}</div>
            <button className="btn btn-sm" onClick={() => { navigator.clipboard.writeText(result.paymentLink); alert('Link copiado!') }}>📋 Copiar</button>
          </div>

          <div className="result-qr">
            <QRCodeCanvas value={result.paymentLink} size={180} />
          </div>

          <div className="result-actions">
            <button className="btn btn-lg" onClick={() => { navigator.share?.({ title: 'GoPay', text: `Pague ${result.amount} via PIX`, url: result.paymentLink }); }}>
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
