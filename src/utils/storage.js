const SESSION_KEY = 'green-api-telegram-credentials'

export function loadCredentials() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function saveCredentials(credentials) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(credentials))
}

export function clearCredentials() {
  sessionStorage.removeItem(SESSION_KEY)
}

function chatsStorageKey(idInstance) {
  return `green-api-telegram-chats-${idInstance}`
}

export function loadChats(idInstance) {
  if (!idInstance) return []
  try {
    const raw = localStorage.getItem(chatsStorageKey(idInstance))
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveChats(idInstance, chats) {
  if (!idInstance) return
  try {
    localStorage.setItem(chatsStorageKey(idInstance), JSON.stringify(chats))
  } catch {

  }
}
