import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './App.css'

// Register SW silenciosamente
if ('serviceWorker' in navigator && window.location.protocol !== 'file:') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {})
  })
}

function urlBase64ToUint8Array(b) {
  const s = b.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - s.length % 4) % 4)
  const p = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
  return Uint8Array.from((atob(s + padding)), c => p.indexOf(c))
}

// Push notification listener (silent)
if ('serviceWorker' in navigator && 'PushManager' in window && window.location.protocol !== 'file:') {
  navigator.serviceWorker.ready.then(reg => {
    if (Notification.permission === 'granted') {
      reg.pushManager.getSubscription().then(sub => {
        if (!sub) {
          reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array('BKv8q3g0x3Z7m5W9y1c4f6h8j0k2l4n6p8q0r2t4v6w8x0y2z4A6B8C0D2E4F6G8H0I2J4K6L8M0N2O4P6Q8R0S2T4U6V8W0X2Y4Z6')
          }).catch(() => {})
        }
      }).catch(() => {})
    }
  }).catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
