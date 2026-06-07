import { useState, useEffect } from 'react'
import api from './api'
import Landing from './components/Landing'
import Dashboard from './components/Dashboard'
import PwaInstall from './components/PwaInstall'
import Notifications from './components/Notifications'
import PaymentPage from './components/PaymentPage'
import SplashScreen from './components/SplashScreen'

export default function App() {
  const [view, setView] = useState('splash')
  const [token, setToken] = useState(api.getToken())
  const [user, setUser] = useState(api.getUser())
  const [hasPayment, setHasPayment] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('pay')) {
      setHasPayment(true)
      setView('payment')
    }
  }, [])

  function handleLogin(t, u) {
    localStorage.setItem('gopay_token', t)
    localStorage.setItem('gopay_user', JSON.stringify(u))
    setToken(t)
    setUser(u)
    setView('app')
  }

  function handleLogout() {
    api.logout()
    setToken('')
    setUser(null)
    setView('landing')
  }

  return (
    <>
      {view === 'splash' && <SplashScreen onComplete={() => {
        const params = new URLSearchParams(window.location.search)
        if (params.get('pay')) setView('payment')
        else if (token && user) setView('app')
        else setView('landing')
      }} />}

      {!hasPayment && view !== 'splash' && <PwaInstall />}

      {view === 'payment' && <PaymentPage />}
      {view === 'landing' && <Landing onEnter={() => setView(token ? 'app' : 'app')} token={token} />}
      {view === 'app' && (
        <>
          <Dashboard
            user={user}
            token={token}
            onLogout={handleLogout}
            onLogin={handleLogin}
            onBack={() => setView('landing')}
          />
          <Notifications />
        </>
      )}
    </>
  )
}
