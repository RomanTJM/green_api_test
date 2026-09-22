export default function TelegramLogo({ large = false }) {
  return (
    <div className={`logo${large ? ' large' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M9.8 15.4 9.6 19c.3 0 .5-.1.7-.3l1.7-1.6 3.5 2.6c.6.4 1.1.2 1.3-.6l2.3-10.8c.2-.9-.3-1.3-1-1L3.6 10.6c-.9.3-.9.8-.2 1l4.1 1.3 9.5-6c.4-.3.8-.1.5.2z"
        />
      </svg>
    </div>
  )
}
