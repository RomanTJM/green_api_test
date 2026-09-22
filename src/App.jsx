import { useEffect, useRef, useState } from 'react'
import { checkAccount, sendMessage } from './api/greenApi'
import { useChats } from './hooks/useChats'
import { useIncomingMessages } from './hooks/useIncomingMessages'
import { useInstanceAuth } from './hooks/useInstanceAuth'
import { AccountNotFoundError, formatTime, parseRecipient } from './utils/format'
import LoginScreen from './components/LoginScreen'
import ChatSidebar from './components/ChatSidebar'
import ChatWindow from './components/ChatWindow'

export default function App() {
  const auth = useInstanceAuth()
  const { credentials } = auth
  const { chats, activeChat, activeChatId, setActiveChatId, upsertChat, resetChats } = useChats(
    credentials?.idInstance,
  )

  const [recipient, setRecipient] = useState('')
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState('')
  const [sending, setSending] = useState(false)
  const listRef = useRef(null)

  useIncomingMessages(credentials, upsertChat, setActiveChatId)

  useEffect(() => {
    if (!listRef.current) return
    listRef.current.scrollTop = listRef.current.scrollHeight
  }, [activeChat?.messages.length])

  const handleLogout = () => {
    auth.logout()
    resetChats()
    setStatus('')
  }

  const handleCreateChat = async (event) => {
    event.preventDefault()
    if (!credentials) return
    const parsed = parseRecipient(recipient)
    if (parsed.error) {
      setStatus(parsed.error)
      return
    }
    setStatus('Создаём чат…')
    try {
      const account = await checkAccount(credentials, parsed)
      if (!account?.exist || !account.chatId) {
        throw new AccountNotFoundError('Аккаунт Telegram не найден')
      }
      const title =
        account.username ||
        (account.phoneNumber ? `+${account.phoneNumber}` : recipient.trim())
      upsertChat(String(account.chatId), {
        title,
        subtitle: account.phoneNumber ? `+${account.phoneNumber}` : account.chatId,
      })
      setActiveChatId(String(account.chatId))
      setRecipient('')
      setStatus('')
    } catch (error) {
      if (!(error instanceof AccountNotFoundError)) {
        setStatus(error.message || 'Не удалось создать чат')
        return
      }
      const fallbackId = parsed.username
        ? parsed.username
        : `${parsed.phoneNumber}@c.us`
      upsertChat(fallbackId, {
        title: recipient.trim(),
        subtitle: fallbackId,
      })
      setActiveChatId(fallbackId)
      setRecipient('')
      setStatus(error.message || 'Чат создан без проверки номера')
    }
  }

  const handleSend = async (event) => {
    event.preventDefault()
    if (!credentials || !activeChat) return
    const text = draft.trim()
    if (!text) return
    setSending(true)
    setStatus('')
    try {
      const result = await sendMessage(credentials, activeChat.id, text)
      upsertChat(activeChat.id, {
        message: {
          id: result?.idMessage || `out-${Date.now()}`,
          text,
          outgoing: true,
          time: formatTime(),
        },
      })
      setDraft('')
    } catch (error) {
      setStatus(error.message || 'Не удалось отправить сообщение')
    } finally {
      setSending(false)
    }
  }

  if (!credentials) {
    return (
      <LoginScreen
        idInstance={auth.idInstance}
        onIdInstanceChange={auth.handleIdInstanceChange}
        apiTokenInstance={auth.apiTokenInstance}
        onApiTokenInstanceChange={auth.setApiTokenInstance}
        apiUrl={auth.apiUrl}
        onApiUrlChange={auth.setApiUrl}
        loginError={auth.loginError}
        loginLoading={auth.loginLoading}
        pendingAuth={auth.pendingAuth}
        qrHint={auth.qrHint}
        qrImage={auth.qrImage}
        twoFaPassword={auth.twoFaPassword}
        onTwoFaPasswordChange={auth.setTwoFaPassword}
        onSubmit={auth.handleLogin}
        onTwoFaSubmit={auth.handleTwoFa}
      />
    )
  }

  return (
    <div className="app">
      <ChatSidebar
        idInstance={credentials.idInstance}
        onLogout={handleLogout}
        recipient={recipient}
        onRecipientChange={setRecipient}
        onCreateChat={handleCreateChat}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
      />
      <ChatWindow
        activeChat={activeChat}
        status={status}
        draft={draft}
        onDraftChange={setDraft}
        onSend={handleSend}
        sending={sending}
        listRef={listRef}
      />
    </div>
  )
}
