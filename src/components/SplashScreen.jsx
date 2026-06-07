import { useState, useEffect } from 'react'

export default function SplashScreen({ onComplete }) {
  const [phase, setPhase] = useState('vinheta')
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem('gopay_splash_seen')
    if (seen) { setHide(true); onComplete(); return }

    const t1 = setTimeout(() => setPhase('welcome'), 2800)
    const t2 = setTimeout(() => {
      setHide(true)
      localStorage.setItem('gopay_splash_seen', '1')
      setTimeout(onComplete, 400)
    }, 5500)

    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  if (hide) return null

  return (
    <div className={`splash ${hide ? 'splash-hide' : ''}`}>
      {phase === 'vinheta' && (
        <div className="splash-vinheta">
          <div className="splash-vinheta-bg"></div>
          <div className="splash-vinheta-content">
            <div className="splash-logo-ring">
              <div className="splash-logo">G</div>
            </div>
            <div className="splash-name">
              <span className="splash-name-g">Go</span><span className="splash-name-p">Pay</span>
            </div>
            <div className="splash-tagline">Pagamentos via PIX</div>
            <div className="splash-particles">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="splash-particle" style={{
                  '--angle': `${i * 30}deg`,
                  '--delay': `${i * 0.15}s`,
                  '--size': `${6 + Math.random() * 8}px`
                }} />
              ))}
            </div>
          </div>
          <div className="splash-version">v1.0</div>
        </div>
      )}

      {phase === 'welcome' && (
        <div className="splash-welcome">
          <div className="splash-welcome-bg"></div>
          <div className="splash-welcome-content">
            <div className="splash-welcome-icon">
              <svg viewBox="0 0 120 120" width="80" height="80">
                <rect x="10" y="10" width="100" height="100" rx="20" fill="#0066FF" />
                <text x="60" y="82" fontFamily="Arial Black,sans-serif" fontSize="64" fontWeight="900" fill="#FFF" textAnchor="middle">G</text>
              </svg>
            </div>
            <h1 className="splash-welcome-title">Bem-vindo ao <span>GoPay</span></h1>
            <p className="splash-welcome-desc">A plataforma mais rápida para receber pagamentos via PIX. Crie links inteligentes, compartilhe com seus clientes e receba em segundos.</p>
            <div className="splash-welcome-features">
              <div className="splash-wf-item">🔗 Links de Pagamento</div>
              <div className="splash-wf-item">📱 App PWA</div>
              <div className="splash-wf-item">⚡ Confirmação em Tempo Real</div>
              <div className="splash-wf-item">🛡️ Múltiplos Gateways</div>
            </div>
            <button className="btn btn-lg splash-start" onClick={() => { setHide(true); localStorage.setItem('gopay_splash_seen', '1'); setTimeout(onComplete, 400) }}>
              Começar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
