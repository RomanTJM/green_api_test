import { useCallback, useEffect, useState } from 'react'
import { loadChats, saveChats } from '../utils/storage'

export function useChats(idInstance) {
  const [chats, setChats] = useState(() => loadChats(idInstance))
  const [activeChatId, setActiveChatId] = useState(null)

  const upsertChat = useCallback((chatId, patch) => {
    setChats((prev) => {
      const index = prev.findIndex((chat) => chat.id === chatId)
      if (index === -1) {
        return [
          {
            id: chatId,
            title: patch.title || chatId,
            subtitle: patch.subtitle || '',
            messages: patch.message ? [patch.message] : [],
          },
          ...prev,
        ]
      }
      const next = [...prev]
      const current = next[index]
      const messages = patch.message
        ? current.messages.some((item) => item.id && item.id === patch.message.id)
          ? current.messages
          : [...current.messages, patch.message]
        : current.messages
      next[index] = {
        ...current,
        title: patch.title || current.title,
        subtitle: patch.subtitle ?? current.subtitle,
        messages,
      }
      return [next[index], ...next.filter((_, i) => i !== index)]
    })
  }, [])

  const resetChats = useCallback(() => {
    setChats([])
    setActiveChatId(null)
  }, [])

  useEffect(() => {
    if (!idInstance) return
    setChats(loadChats(idInstance))
  }, [idInstance])

  useEffect(() => {
    if (!idInstance) return
    saveChats(idInstance, chats)
  }, [chats, idInstance])

  const activeChat = chats.find((chat) => chat.id === activeChatId) || null

  return { chats, activeChat, activeChatId, setActiveChatId, upsertChat, resetChats }
}
