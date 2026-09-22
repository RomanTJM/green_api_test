const DEFAULT_API_URL = 'https://api.green-api.com'

export function inferApiUrl(idInstance) {
  const id = String(idInstance || '').replace(/\D/g, '')
  if (id.length >= 4) return `https://${id.slice(0, 4)}.api.green-api.com`
  return DEFAULT_API_URL
}

function resolveApiUrl(apiUrl) {
  return (apiUrl || DEFAULT_API_URL).trim().replace(/\/+$/, '') || DEFAULT_API_URL
}

function instancePath(credentials, method, extra = '') {
  const { idInstance, apiTokenInstance } = credentials
  const base = import.meta.env.DEV ? '/green-api' : resolveApiUrl(credentials.apiUrl)
  return `${base}/waInstance${idInstance}/${method}/${apiTokenInstance}${extra}`
}

async function readJson(response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(text || 'Некорректный ответ сервера')
  }
}

async function request(credentials, url, options = {}) {
  const headers = { ...(options.headers || {}) }
  if (import.meta.env.DEV) {
    headers['X-Api-Host'] = resolveApiUrl(credentials.apiUrl)
  }

  const response = await fetch(url, { ...options, headers })
  const data = await readJson(response)
  if (!response.ok) {
    const message =
      response.status === 429
        ? 'Слишком много запросов к GREEN-API, подождите немного'
        : data?.message || data?.error || data?.reason || `Ошибка GREEN-API (${response.status})`
    const error = new Error(typeof message === 'string' ? message : JSON.stringify(message))
    error.status = response.status
    throw error
  }
  return data
}

export function extractMessageText(messageData) {
  if (!messageData) return ''
  const type = messageData.typeMessage
  if (type === 'textMessage') {
    return messageData.textMessageData?.textMessage || ''
  }
  if (type === 'extendedTextMessage') {
    return messageData.extendedTextMessageData?.text || ''
  }
  if (type === 'quotedMessage') {
    return (
      messageData.quotedMessage?.textMessage ||
      extractMessageText(messageData.quotedMessage) ||
      ''
    )
  }
  return type ? `[${type}]` : ''
}

export async function getStateInstance(credentials, signal) {
  return request(credentials, instancePath(credentials, 'getStateInstance'), { signal })
}

export async function getQr(credentials, signal) {
  return request(credentials, instancePath(credentials, 'qr'), { signal })
}

export async function sendAuthorizationPassword(credentials, password) {
  return request(credentials, instancePath(credentials, 'sendAuthorizationPassword'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  })
}

export async function setPollingSettings(credentials) {
  return request(credentials, instancePath(credentials, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      webhookUrl: '',
      incomingWebhook: 'yes',
      outgoingWebhook: 'yes',
      outgoingAPIMessageWebhook: 'yes',
    }),
  })
}

export async function checkAccount(credentials, { phoneNumber, username }) {
  const payload = username
    ? { username }
    : { phoneNumber: Number(phoneNumber) }
  return request(credentials, instancePath(credentials, 'checkAccount'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export async function sendMessage(credentials, chatId, message) {
  return request(credentials, instancePath(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
}

export async function receiveNotification(credentials, signal) {
  try {
    return await request(
      credentials,
      `${instancePath(credentials, 'receiveNotification')}?receiveTimeout=5`,
      { signal },
    )
  } catch (error) {
    // 408 — long polling завершился без новых уведомлений, это не ошибка
    if (error.status === 408) return null
    throw error
  }
}

export async function deleteNotification(credentials, receiptId) {
  return request(
    credentials,
    instancePath(credentials, 'deleteNotification', `/${receiptId}`),
    { method: 'DELETE' },
  )
}
