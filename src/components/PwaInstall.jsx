import { useState, useEffect } from 'react'

export default function PwaInstall() {
  const [show, setShow] = useState(false)
  const [deferred, setDeferred] = useState(null)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferred(e)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!deferred) return
    deferred.prompt()
    const res = await deferred.userChoice
    if (res.outcome === 'accepted') setShow(false)
    setDeferred(null)
  }

  if (!show) return null

  return (
    <div className="pwa-bar">
      <div className="pwa-icon">G</div>
      <div className="pwa-info">
        <strong>Instalar GoPay</strong>
        <small>Adicione à tela inicial para acesso rápido</small>
      </div>
      <button className="pwa-btn" onClick={install}>Instalar</button>
      <button className="pwa-close" onClick={() => setShow(false)}>✕</button>
    </div>
  )
}
