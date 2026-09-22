import TelegramLogo from './TelegramLogo'

export default function LoginScreen({
  idInstance,
  onIdInstanceChange,
  apiTokenInstance,
  onApiTokenInstanceChange,
  apiUrl,
  onApiUrlChange,
  loginError,
  loginLoading,
  pendingAuth,
  qrHint,
  qrImage,
  twoFaPassword,
  onTwoFaPasswordChange,
  onSubmit,
  onTwoFaSubmit,
}) {
  return (
    <div className="login-page">
      <form className="login-card" onSubmit={onSubmit}>
        <div className="brand">
          <TelegramLogo />
          <div>
            <h1>Telegram</h1>
            <p>Чат через GREEN-API</p>
          </div>
        </div>
        <label>
          idInstance
          <input
            value={idInstance}
            onChange={(event) => onIdInstanceChange(event.target.value)}
            placeholder="000000000000"
            required
            autoComplete="off"
          />
        </label>
        <label>
          apiTokenInstance
          <input
            value={apiTokenInstance}
            onChange={(event) => onApiTokenInstanceChange(event.target.value)}
            placeholder="токен из кабинета GREEN-API"
            required
            autoComplete="off"
          />
        </label>
        <label>
          apiUrl
          <input
            value={apiUrl}
            onChange={(event) => onApiUrlChange(event.target.value)}
            placeholder="https://4100.api.green-api.com"
          />
        </label>
        {loginError ? <div className="error">{loginError}</div> : null}
        {qrHint ? <div className="hint">{qrHint}</div> : null}
        {qrImage ? (
          <div className="qr-box">
            <img src={qrImage} alt="QR-код авторизации Telegram" />
          </div>
        ) : null}
        {pendingAuth ? (
          <div className="twofa">
            <input
              value={twoFaPassword}
              onChange={(event) => onTwoFaPasswordChange(event.target.value)}
              placeholder="Облачный пароль Telegram, если включён"
              type="password"
            />
            <button type="button" onClick={onTwoFaSubmit}>
              Отправить пароль
            </button>
          </div>
        ) : null}
        <button type="submit" disabled={loginLoading}>
          {loginLoading ? 'Проверяем…' : pendingAuth ? 'Обновить статус' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
