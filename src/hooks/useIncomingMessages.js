import { useEffect, useRef } from 'react'
import { deleteNotification, extractMessageText, receiveNotification } from '../api/greenApi'
import { formatTime } from '../utils/format'

export function useIncomingMessages(credentials, upsertChat, setActiveChatId) {
  const credentialsRef = useRef(credentials)
  credentialsRef.current = credentials

  useEffect(() => {
    if (!credentials) return undefined
    const controller = new AbortController()

    const poll = async () => {
      while (!controller.signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentialsRef.current,
            controller.signal,
          )
          if (!notification?.receiptId) continue

          const body = notification.body || {}
          if (body.typeWebhook === 'incomingMessageReceived') {
            const chatId = String(body.senderData?.chatId || '')
            const text = extractMessageText(body.messageData)
            if (chatId && text) {
              upsertChat(chatId, {
                title:
                  body.senderData?.chatName ||
                  body.senderData?.senderName ||
                  chatId,
                subtitle: body.senderData?.senderPhoneNumber
                  ? `+${body.senderData.senderPhoneNumber}`
                  : chatId,
                message: {
                  id: body.idMessage,
                  text,
                  outgoing: false,
                  time: formatTime(body.timestamp),
                },
              })
              setActiveChatId((current) => current || chatId)
            }
          }

          await deleteNotification(credentialsRef.current, notification.receiptId)
        } catch (error) {
          if (controller.signal.aborted) return
          if (error.name !== 'AbortError') {
            await new Promise((resolve) => setTimeout(resolve, error.status === 429 ? 10000 : 1500))
          }
        }
      }
    }

    poll()
    return () => controller.abort()
  }, [credentials, upsertChat, setActiveChatId])
}
