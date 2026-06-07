import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://seu-projeto.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-anon-key'
const BASE_URL = 'https://contadtv169-stack.github.io/gopay-web'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

supabase.auth.onAuthStateChange((event, session) => {
  if (session?.user) {
    localStorage.setItem('gopay_user', JSON.stringify({
      id: session.user.id,
      name: session.user.user_metadata?.name || session.user.email,
      email: session.user.email
    }))
  } else {
    localStorage.removeItem('gopay_user')
  }
})

function getUser() {
  try { return JSON.parse(localStorage.getItem('gopay_user')) } catch { return null }
}

function getToken() {
  return localStorage.getItem('gopay_token') || ''
}

async function getUserId() {
  const user = getUser()
  if (user?.id) return user.id
  const { data: { user: u } } = await supabase.auth.getUser()
  return u?.id || null
}

async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  const u = data.user
  localStorage.setItem('gopay_user', JSON.stringify({ id: u.id, name: u.user_metadata?.name || email, email }))
  return { success: true, token: data.session.access_token, user: { id: u.id, name: u.user_metadata?.name || email, email } }
}

async function register(name, email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
  if (error) return { success: false, error: error.message }
  return { success: true, token: data.session?.access_token || '', user: { id: data.user.id, name, email } }
}

function logout() {
  supabase.auth.signOut()
  localStorage.removeItem('gopay_user')
  localStorage.removeItem('gopay_token')
  localStorage.removeItem('gopay_links')
}

async function getLinks() {
  const uid = await getUserId()
  if (!uid) return { success: false, error: 'Não autenticado' }
  const { data, error } = await supabase.from('links').select('*').eq('user_id', uid).order('created_at', { ascending: false })
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data || []).map(mapper) }
}

async function createLink(amount, description, gateway, apiKey) {
  const uid = await getUserId()
  if (!uid) return { success: false, error: 'Não autenticado' }
  const linkId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const paymentLink = `${BASE_URL}/?pay=${linkId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`
  const { data, error } = await supabase.from('links').insert({
    id: linkId, user_id: uid, amount, description: description || 'Link GoPay',
    gateway: gateway || 'pixgo', api_key: apiKey, status: 'active', payment_link: paymentLink,
    qr_code_base64: qrUrl, qr_image_url: qrUrl, copy_paste: paymentLink
  }).select().single()
  if (error) return { success: false, error: error.message }
  return { success: true, data: mapper(data) }
}

async function getDashboard() {
  const uid = await getUserId()
  if (!uid) return { success: false, error: 'Não autenticado' }
  const { data: links, error } = await supabase.from('links').select('*').eq('user_id', uid).order('created_at', { ascending: false })
  if (error) return { success: false, error: error.message }
  const arr = links || []
  const paid = arr.filter(l => l.status === 'paid' || l.status === 'completed')
  const balance = paid.reduce((s, l) => s + l.amount, 0)
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  return {
    success: true,
    data: {
      balance, activeLinks: arr.filter(l => l.status === 'active').length,
      payments: paid.length, monthTotal: paid.filter(l => l.created_at >= monthStart).reduce((s, l) => s + l.amount, 0),
      user: { id: uid }, links: arr.map(mapper)
    }
  }
}

async function getPaymentStatus(id) {
  const { data, error } = await supabase.from('links').select('*').eq('id', id).single()
  if (error) return { success: false, error: 'Link não encontrado' }
  return { success: true, data: mapper(data) }
}

async function getPaymentLink(id) {
  const { data, error } = await supabase.rpc('get_payment_link', { link_id: id })
  if (error) return { success: false, error: 'Link não encontrado' }
  return { success: true, data: mapper(Array.isArray(data) ? data[0] : data) }
}

function mapper(d) {
  if (!d) return null
  return {
    id: d.id, userId: d.user_id, amount: d.amount, description: d.description,
    gateway: d.gateway, apiKey: d.api_key, status: d.status,
    paymentLink: d.payment_link, qrCodeBase64: d.qr_code_base64,
    qr_image_url: d.qr_image_url, copyPaste: d.copy_paste,
    pixCode: d.pix_code, transactionId: d.transaction_id,
    createdAt: d.created_at
  }
}

// Notificacoes
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  return (await Notification.requestPermission()) === 'granted'
}

function showLocalNotification(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
    navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, { body, icon: '/gopay-web/assets/icon-192.svg', badge: '/gopay-web/assets/icon-192.svg' })
  })
}

export default {
  supabase, getUser, getToken, login, register, getLinks, createLink,
  getDashboard, getPaymentStatus, getPaymentLink, logout,
  requestNotificationPermission, showLocalNotification
}
