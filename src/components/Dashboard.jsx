import { useState, useEffect } from 'react'
import api from '../api'

function toast(msg) {
  const el = document.getElementById('toast')
  if (!el) return
  el.textContent = msg
  el.classList.add('show')
  setTimeout(() => el.classList.remove('show'), 2500)
}

export default function Dashboard({ user, token, onLogin, onLogout, onBack }) {
  const [tab, setTab] = useState('login')
  const [links, setLinks] = useState([])
  const [stats, setStats] = useState({ balance: 0, activeLinks: 0, payments: 0, monthTotal: 0 })
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('dashboard')

  // login form
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')

  // register form
  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')

  // link form
  const [linkAmount, setLinkAmount] = useState('')
  const [linkDesc, setLinkDesc] = useState('')
  const [linkGateway, setLinkGateway] = useState('pixgo')
  const [linkApiKey, setLinkApiKey] = useState('')

  const isAuth = !!(token && user)

  useEffect(() => {
    if (isAuth) { carregarLinks(); carregarDashboard() }
  }, [token])

  async function carregarLinks() {
    try {
      const d = await api.getLinks()
      if (d.success) setLinks(d.data || [])
    } catch {}
  }

  async function carregarDashboard() {
    try {
      const d = await api.getDashboard()
      if (d.success && d.data) setStats(d.data)
    } catch {}
  }

  async function handleLogin() {
    if (!loginEmail || !loginPass) return toast('Preencha email e senha')
    setLoading(true)
    try {
      const d = await api.login(loginEmail, loginPass)
      if (d.success) { onLogin(d.token, d.user); toast('✅ Login realizado') }
      else toast('❌ ' + (d.error || 'Erro ao login'))
    } catch { toast('Erro de conexão') }
    setLoading(false)
  }

  async function handleRegister() {
    if (!regName || !regEmail || !regPass) return toast('Preencha todos os campos')
    setLoading(true)
    try {
      const d = await api.register(regName, regEmail, regPass)
      if (d.success) { onLogin(d.token, d.user); toast('✅ Conta criada') }
      else toast('❌ ' + (d.error || 'Erro ao cadastrar'))
    } catch { toast('Erro de conexão') }
    setLoading(false)
  }

  async function handleCreateLink() {
    const amt = linkAmount.replace(',', '.')
    if (!amt || !linkApiKey) return toast('Informe valor e API Key')
    setLoading(true)
    try {
      const d = await api.createLink(parseFloat(amt), linkDesc || 'Link GoPay', linkGateway, linkApiKey)
      if (d.success) {
        setLinks(prev => [d.data, ...prev])
        setLinkAmount(''); setLinkDesc(''); setLinkApiKey('')
        toast('✅ Link criado!')
        if (d.data?.paymentLink) {
          navigator.clipboard.writeText(d.data.paymentLink)
          toast('✅ Link copiado!')
        }
      } else toast('❌ ' + (d.error || 'Erro'))
    } catch { toast('Erro de conexão') }
    setLoading(false)
  }

  async function handleCopyLink(url) {
    try {
      await navigator.clipboard.writeText(url)
      toast('📋 Link copiado!')
    } catch { toast('Erro ao copiar') }
  }

  function formatMoney(v) {
    return 'R$ ' + (v || 0).toFixed(2).replace('.', ',')
  }

  function statusLabel(s) {
    if (s === 'paid' || s === 'completed') return { text: 'Pago', cls: 'badge-paid' }
    if (s === 'expired' || s === 'canceled') return { text: 'Expirado', cls: 'badge-expired' }
    return { text: 'Ativo', cls: 'badge-active' }
  }

  // Login/Register view
  if (!isAuth) {
    return (
      <div className="dash">
        <div className="dash-header">
          <div className="dash-logo">Go<span>Pay</span></div>
          <button className="btn btn-sm btn-outline" onClick={onBack || (() => setView('landing'))}>Voltar</button>
        </div>
        <div className="dash-body">
          <div className="card auth-card">
            <div className="auth-tabs">
              <button className={tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>Entrar</button>
              <button className={tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>Cadastrar</button>
            </div>

            {tab === 'login' ? (
              <div className="auth-form">
                <h2>🔑 Entrar</h2>
                <input type="email" placeholder="Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} />
                <input type="password" placeholder="Senha" value={loginPass} onChange={e => setLoginPass(e.target.value)} />
                <button className="btn" onClick={handleLogin} disabled={loading}>
                  {loading ? '⏳...' : 'Entrar'}
                </button>
              </div>
            ) : (
              <div className="auth-form">
                <h2>📝 Cadastro</h2>
                <input type="text" placeholder="Nome completo" value={regName} onChange={e => setRegName(e.target.value)} />
                <input type="email" placeholder="Email" value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                <input type="password" placeholder="Senha" value={regPass} onChange={e => setRegPass(e.target.value)} />
                <button className="btn" onClick={handleRegister} disabled={loading}>
                  {loading ? '⏳...' : 'Criar conta'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="toast" id="toast"></div>
      </div>
    )
  }

  // Dashboard view (authenticated)
  return (
    <div className="dash">
      <header className="dash-topbar">
        <div className="dash-logo">Go<span>Pay</span></div>
        <div className="dash-user">
          <span className="dash-user-name">👤 {user?.name || 'Usuário'}</span>
          <button className="btn btn-sm btn-outline" onClick={onBack}>← Voltar</button>
          <button className="btn btn-sm btn-outline" onClick={onLogout}>Sair</button>
        </div>
      </header>

      <main className="dash-main">
        <div className="dash-stats">
          <div className="stat-card">
            <small>Saldo</small>
            <strong>{formatMoney(stats.balance)}</strong>
          </div>
          <div className="stat-card">
            <small>Links</small>
            <strong>{stats.activeLinks || links.length}</strong>
          </div>
          <div className="stat-card">
            <small>Pagamentos</small>
            <strong>{stats.payments}</strong>
          </div>
          <div className="stat-card">
            <small>Este mês</small>
            <strong>{formatMoney(stats.monthTotal)}</strong>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">🔗 Novo Link de Pagamento</h3>
          <div className="form-grid">
            <div>
              <label>Valor (R$)</label>
              <input type="text" placeholder="0,00" value={linkAmount} onChange={e => setLinkAmount(e.target.value)} />
            </div>
            <div>
              <label>Descrição</label>
              <input type="text" placeholder="Ex: Curso Completo" value={linkDesc} onChange={e => setLinkDesc(e.target.value)} />
            </div>
            <div>
              <label>Gateway</label>
              <select value={linkGateway} onChange={e => setLinkGateway(e.target.value)}>
                <option value="pixgo">PixGo</option>
                <option value="krypt">KryptGateway</option>
              </select>
            </div>
            <div>
              <label>API Key</label>
              <input type="text" placeholder="Chave do gateway" value={linkApiKey} onChange={e => setLinkApiKey(e.target.value)} />
            </div>
          </div>
          <button className="btn" onClick={handleCreateLink} disabled={loading} style={{ marginTop: 12 }}>
            {loading ? '⏳ Gerando...' : '🔗 Gerar Link de Pagamento'}
          </button>
        </div>

        <div className="card">
          <h3 className="card-title">📋 Seus Links</h3>
          {links.length === 0 ? (
            <p className="empty-msg">Nenhum link criado. Crie seu primeiro link acima.</p>
          ) : (
            <div className="links-list">
              {links.map((l, i) => {
                const st = statusLabel(l.status)
                return (
                  <div key={l.id || i} className="link-item">
                    <div className="link-top">
                      <div>
                        <strong className="link-desc">{l.description || 'Link'}</strong>
                        <span className="link-value">{formatMoney(l.amount)}</span>
                        <span className="link-gateway">{l.gateway || 'pixgo'}</span>
                      </div>
                      <span className={'badge ' + st.cls}>{st.text}</span>
                    </div>
                    <div className="link-meta">
                      <span className="link-date">{l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : '-'}</span>
                    </div>
                    {l.paymentLink && (
                      <div className="link-actions">
                        <button className="btn btn-sm" onClick={() => handleCopyLink(l.paymentLink)}>📋 Copiar</button>
                      </div>
                    )}
                    {(l.qrCodeBase64 || l.qr_image_url) && (
                      <div className="link-qr">
                        <img src={l.qrCodeBase64 || l.qr_image_url} alt="QR Code" />
                        <small>QR Code PIX</small>
                      </div>
                    )}
                    {l.copyPaste && (
                      <div className="link-pixcode">{l.copyPaste}</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <div className="toast" id="toast"></div>
    </div>
  )
}
