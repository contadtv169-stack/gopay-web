import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wnjpzsxrwwrskakrhfgg.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_mWFzAPYyXdhy0Psxj-x7lA_mYzu0clG'
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

async function deleteLink(id) {
  const uid = await getUserId()
  if (!uid) return { success: false, error: 'Não autenticado' }
  const { error } = await supabase.from('links').delete().eq('id', id).eq('user_id', uid)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

async function getLinks() {
  const uid = await getUserId()
  if (!uid) return { success: false, error: 'Não autenticado' }
  const { data, error } = await supabase.from('links').select('*').eq('user_id', uid).order('created_at', { ascending: false })
  if (error) return { success: false, error: error.message }
  return { success: true, data: (data || []).map(mapper) }
}

// --- GATEWAY FUNCTIONS ---

async function pixgoCreatePayment(amount, description, apiKey) {
  try {
    const body = {
      amount: parseFloat(amount),
      description: description || 'Link GoPay',
      external_id: 'gopay_' + Date.now().toString(36)
    }
    const res = await fetch('https://pixgo.org/api/v1/payment/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': apiKey },
      body: JSON.stringify(body)
    })
    const json = await res.json()
    if (!json.success) throw new Error(json.message || 'Erro PixGo')
    return {
      success: true,
      transactionId: json.data.payment_id,
      qrCodeBase64: '',
      qrImageUrl: json.data.qr_image_url || '',
      copyPaste: json.data.qr_code || '',
      pixCode: json.data.qr_code || '',
      status: 'pending',
      expiresAt: json.data.expires_at || ''
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function pixgoCheckStatus(transactionId, apiKey) {
  try {
    const res = await fetch(`https://pixgo.org/api/v1/payment/${transactionId}/status`, {
      headers: { 'X-API-Key': apiKey }
    })
    const json = await res.json()
    if (!json.success) return { success: false, error: 'Erro ao consultar PixGo' }
    const statusMap = { pending: 'pending', completed: 'paid', expired: 'expired', cancelled: 'canceled' }
    return { success: true, status: statusMap[json.data.status] || json.data.status }
  } catch {
    return { success: false, error: 'Falha ao consultar PixGo' }
  }
}

async function kryptCreatePayment(amount, description, apiKey) {
  try {
    const keys = apiKey.split('||')
    const ci = keys[0] || 'krypt_ci_221dcbdf875fd0f4d6'
    const cs = keys[1] || 'krypt_cs_50211e5c850c9e6b73251fbbd837c4f5'
    const body = {
      amount: parseFloat(amount),
      payerName: 'Cliente GoPay',
      payerDocument: '00000000000',
      description: description || 'Link GoPay'
    }
    const res = await fetch('https://kryptgateway.netlify.app/api/gateway/pix-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ci, cs },
      body: JSON.stringify(body)
    })
    const json = await res.json()
    if (!json.success) throw new Error('Erro KryptGateway')
    return {
      success: true,
      transactionId: json.data.transactionId,
      qrCodeBase64: json.data.qrCodeBase64 || '',
      qrImageUrl: json.data.qrCodeUrl || '',
      copyPaste: json.data.copyPaste || '',
      pixCode: json.data.copyPaste || '',
      status: 'pending',
      expiresAt: json.data.expiresAt || ''
    }
  } catch (e) {
    return { success: false, error: e.message }
  }
}

async function kryptCheckStatus(transactionId, apiKey) {
  try {
    const keys = apiKey.split('||')
    const ci = keys[0] || 'krypt_ci_221dcbdf875fd0f4d6'
    const cs = keys[1] || 'krypt_cs_50211e5c850c9e6b73251fbbd837c4f5'
    const res = await fetch(`https://kryptgateway.netlify.app/api/gateway/pix-status?transactionId=${transactionId}`, {
      headers: { ci, cs }
    })
    const json = await res.json()
    if (!json.success) return { success: false, error: 'Erro ao consultar Krypt' }
    const statusMap = { pending: 'pending', paid: 'paid', expired: 'expired', cancelled: 'canceled' }
    return { success: true, status: statusMap[json.data.status] || json.data.status }
  } catch {
    return { success: false, error: 'Falha ao consultar Krypt' }
  }
}

// --- LINK CREATION WITH GATEWAY ---

async function createLink(amount, description, gateway, apiKey) {
  const uid = await getUserId()
  if (!uid) return { success: false, error: 'Não autenticado' }

  const linkId = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  const paymentLink = `${BASE_URL}/?pay=${linkId}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentLink)}`

  // Insert placeholder first, then update with gateway data
  const { data: inserted, error: insertError } = await supabase.from('links').insert({
    id: linkId, user_id: uid, amount: parseFloat(amount), description: description || 'Link GoPay',
    gateway: gateway || 'pixgo', api_key: apiKey, status: 'pending', payment_link: paymentLink,
    qr_code_base64: qrUrl, qr_image_url: qrUrl, copy_paste: paymentLink
  }).select().single()

  if (insertError) return { success: false, error: insertError.message }

  // Call gateway API
  const gatewayFn = gateway === 'krypt' ? kryptCreatePayment : pixgoCreatePayment
  const result = await gatewayFn(amount, description, apiKey)

  if (!result.success) {
    // Fallback: keep qrserver code
    await supabase.from('links').update({ status: 'active' }).eq('id', linkId)
    return { success: true, data: mapper(inserted), gatewayError: result.error }
  }

  // Update with real PIX data
  const { data: updated } = await supabase.from('links').update({
    status: 'pending',
    transaction_id: result.transactionId,
    qr_code_base64: result.qrCodeBase64 || qrUrl,
    qr_image_url: result.qrImageUrl || qrUrl,
    copy_paste: result.copyPaste || paymentLink,
    pix_code: result.pixCode || '',
    expires_at: result.expiresAt || null
  }).eq('id', linkId).select().single()

  return { success: true, data: mapper(updated || inserted) }
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
      balance, activeLinks: arr.filter(l => l.status === 'active' || l.status === 'pending').length,
      payments: paid.length, monthTotal: paid.filter(l => l.created_at >= monthStart).reduce((s, l) => s + l.amount, 0),
      user: { id: uid }, links: arr.map(mapper)
    }
  }
}

async function getPaymentStatus(id) {
  const { data, error } = await supabase.from('links').select('*').eq('id', id).single()
  if (error) return { success: false, error: 'Link não encontrado' }
  const link = mapper(data)

  // If pending, check gateway for real status
  if ((link.status === 'pending' || link.status === 'active') && link.transactionId && link.gateway && link.apiKey) {
    const checkFn = link.gateway === 'krypt' ? kryptCheckStatus : pixgoCheckStatus
    const result = await checkFn(link.transactionId, link.apiKey)
    if (result.success && result.status !== link.status) {
      const newStatus = result.status
      await supabase.from('links').update({ status: newStatus }).eq('id', id)
      link.status = newStatus
    }
  }

  return { success: true, data: link }
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
  supabase, getUser, getToken, login, register, getLinks, createLink, deleteLink,
  getDashboard, getPaymentStatus, getPaymentLink, logout,
  requestNotificationPermission, showLocalNotification
}
