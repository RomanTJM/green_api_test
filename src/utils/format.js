export class AccountNotFoundError extends Error {}

export function digitsOnly(value) {
  return value.replace(/\D/g, '')
}

export function formatTime(timestamp) {
  const date = timestamp ? new Date(timestamp * 1000) : new Date()
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function initials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join('')
}

export function parseRecipient(input) {
  const value = input.trim()
  if (!value) return { error: 'Укажите номер телефона или @username' }
  if (value.startsWith('@')) {
    return { username: value }
  }
  const phone = digitsOnly(value)
  if (phone.length < 10) {
    return { error: 'Введите номер в международном формате, например 79991234567' }
  }
  return { phoneNumber: phone }
}
