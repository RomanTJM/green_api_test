import TelegramLogo from './TelegramLogo'
import { initials } from '../utils/format'

export default function ChatWindow({
  activeChat,
  status,
  draft,
  onDraftChange,
  onSend,
  sending,
  listRef,
}) {
  if (!activeChat) {
    return (
      <main className="chat">
        <div className="placeholder">
          <TelegramLogo large />
          <h2>Telegram Web</h2>
          <p>Создайте чат по номеру или @username и отправьте текстовое сообщение.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="chat">
      <header className="chat-header">
        <div className="avatar">{initials(activeChat.title)}</div>
        <div>
          <div className="chat-title">{activeChat.title}</div>
          <div className="chat-preview">{activeChat.subtitle || activeChat.id}</div>
        </div>
      </header>
      <div className="messages" ref={listRef}>
        {activeChat.messages.map((message) => (
          <div key={message.id} className={`bubble ${message.outgoing ? 'out' : 'in'}`}>
            <p>{message.text}</p>
            <time>{message.time}</time>
          </div>
        ))}
      </div>
      {status ? <div className="status">{status}</div> : null}
      <form className="composer" onSubmit={onSend}>
        <input
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder="Написать сообщение..."
        />
        <button type="submit" disabled={sending || !draft.trim()}>
          Отправить
        </button>
      </form>
    </main>
  )
}
