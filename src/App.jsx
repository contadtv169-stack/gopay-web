import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import api from './api'
import useAuthStore from './stores/authStore'
import SplashScreen from './components/SplashScreen'
import Landing from './components/Landing'
import PwaInstall from './components/PwaInstall'
import PaymentPage from './components/PaymentPage'
import BottomNav from './components/layouts/BottomNav'
import Dashboard from './pages/Dashboard'
import LinksPage from './pages/LinksPage'
import LinkDetail from './pages/LinkDetail'
import CreateLink from './pages/CreateLink'
import ActivityPage from './pages/ActivityPage'
import AccountPage from './pages/AccountPage'
import GatewayConnect from './pages/GatewayConnect'
import WithdrawPage from './pages/WithdrawPage'
import NotificationsPage from './pages/NotificationsPage'

function AppRoutes({ hasPayment }) {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  if (hasPayment) return null

  return (
    <>
      <PwaInstall />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={
            isAuthenticated ? <Navigate to="/app" /> : <Landing onEnter={() => navigate('/app')} token="" />
          } />
          <Route path="/app" element={
            isAuthenticated ? (
              <div className="app-layout">
                <Dashboard />
                <BottomNav />
              </div>
            ) : (
              <LoginPage />
            )
          } />
          <Route path="/app/links" element={
            <div className="app-layout">
              <LinksPage />
              <BottomNav />
            </div>
          } />
          <Route path="/app/link/:id" element={
            <div className="app-layout">
              <LinkDetail />
              <BottomNav />
            </div>
          } />
          <Route path="/app/criar" element={
            <div className="app-layout">
              <CreateLink />
              <BottomNav />
            </div>
          } />
          <Route path="/app/atividade" element={
            <div className="app-layout">
              <ActivityPage />
              <BottomNav />
            </div>
          } />
          <Route path="/app/conta" element={
            <div className="app-layout">
              <AccountPage />
              <BottomNav />
            </div>
          } />
          <Route path="/app/conectar" element={
            <div className="app-layout">
              <GatewayConnect />
              <BottomNav />
            </div>
          } />
          <Route path="/app/saque" element={
            <div className="app-layout">
              <WithdrawPage />
              <BottomNav />
            </div>
          } />
          <Route path="/app/notificacoes" element={
            <div className="app-layout">
              <NotificationsPage />
              <BottomNav />
            </div>
          } />
        </Routes>
      </AnimatePresence>
    </>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const { login, register } = useAuthStore()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    if (!email || !password) return setError('Preencha todos os campos')
    setLoading(true); setError('')
    const d = await login(email, password)
    setLoading(false)
    if (d.success) { navigate('/app') } else { setError(d.error || 'Erro ao entrar') }
  }

  async function handleRegister() {
    if (!name || !email || !password) return setError('Preencha todos os campos')
    setLoading(true); setError('')
    const d = await register(name, email, password)
    setLoading(false)
    if (d.success) { navigate('/app/conectar') } else { setError(d.error || 'Erro ao cadastrar') }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">Go<span>Pay</span></div>
        <h2>{tab === 'login' ? 'Entrar' : 'Criar conta'}</h2>
        <p className="auth-sub">{tab === 'login' ? 'Bem-vindo de volta!' : 'Vamos começar'}</p>

        <div className="auth-tabs">
          <button className={tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>Entrar</button>
          <button className={tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>Cadastrar</button>
        </div>

        <div className="auth-form">
          {tab === 'register' && (
            <input type="text" placeholder="Nome completo" value={name} onChange={e => setName(e.target.value)} />
          )}
          <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="form-error">{error}</p>}
          <motion.button
            className="btn btn-lg btn-full"
            onClick={tab === 'login' ? handleLogin : handleRegister}
            disabled={loading}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '⏳...' : tab === 'login' ? 'Entrar' : 'Criar conta'}
          </motion.button>

          {tab === 'register' && (
            <button className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={() => setTab('login')}>
              Já tem uma conta? Entrar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [hasPayment, setHasPayment] = useState(false)

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('pay')) {
      setHasPayment(true)
      setSplashDone(true)
    }
  }, [])

  if (hasPayment) {
    return (
      <>
        <PaymentPage />
        <PwaInstall />
      </>
    )
  }

  if (!splashDone) {
    return <SplashScreen onComplete={() => setSplashDone(true)} />
  }

  return (
    <BrowserRouter basename="/gopay-web">
      <AppRoutes hasPayment={hasPayment} />
    </BrowserRouter>
  )
}
