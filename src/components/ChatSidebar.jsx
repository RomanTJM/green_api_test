import TelegramLogo from './TelegramLogo'
import { initials } from '../utils/format'

export default function ChatSidebar({
  idInstance,
  onLogout,
  recipient,
  onRecipientChange,
  onCreateChat,
  chats,
  activeChatId,
  onSelectChat,
}) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="brand compact">
          <TelegramLogo />
          <div>
            <strong>Telegram</strong>
            <span>id {idInstance}</span>
          </div>
        </div>
        <button className="ghost" type="button" onClick={onLogout}>
          Выйти
        </button>
      </div>

      <form className="new-chat" onSubmit={onCreateChat}>
        <input
          value={recipient}
          onChange={(event) => onRecipientChange(event.target.value)}
          placeholder="Номер или @username"
        />
        <button type="submit">Чат</button>
      </form>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="empty">Создайте чат по номеру получателя</div>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
              type="button"
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="avatar">{initials(chat.title)}</div>
              <div>
                <div className="chat-title">{chat.title}</div>
                <div className="chat-preview">
                  {chat.messages.at(-1)?.text || chat.subtitle || chat.id}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </aside>
  )
}
