import { useEffect, useMemo, useState } from 'react'
import {
  getQr,
  getStateInstance,
  inferApiUrl,
  sendAuthorizationPassword,
  setPollingSettings,
} from '../api/greenApi'
import { clearCredentials, loadCredentials, saveCredentials } from '../utils/storage'

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export function useInstanceAuth() {
  const saved = useMemo(() => loadCredentials(), [])
  const [credentials, setCredentials] = useState(saved)
  const [idInstance, setIdInstance] = useState(saved?.idInstance || '')
  const [apiTokenInstance, setApiTokenInstance] = useState(saved?.apiTokenInstance || '')
  const [apiUrl, setApiUrl] = useState(
    saved?.apiUrl || inferApiUrl(saved?.idInstance) || 'https://api.green-api.com',
  )
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [pendingAuth, setPendingAuth] = useState(null)
  const [qrImage, setQrImage] = useState('')
  const [qrHint, setQrHint] = useState('')
  const [twoFaPassword, setTwoFaPassword] = useState('')

  const finishLogin = async (nextCredentials) => {
    try {
      await setPollingSettings(nextCredentials)
    } catch {
      
    }
    saveCredentials(nextCredentials)
    setPendingAuth(null)
    setQrImage('')
    setQrHint('')
    setCredentials(nextCredentials)
  }

  const handleIdInstanceChange = (value) => {
    setIdInstance(value)
    setApiUrl(inferApiUrl(value))
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoginError('')
    setLoginLoading(true)
    const nextCredentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim() || inferApiUrl(idInstance),
    }
    try {
      const state = await getStateInstance(nextCredentials)
      if (state?.stateInstance === 'authorized') {
        await finishLogin(nextCredentials)
        return
      }
      setPendingAuth(nextCredentials)
      setQrHint(
        state?.stateInstance === 'pendingPassword'
          ? 'Введите облачный пароль Telegram (2FA)'
          : 'Инстанс ещё не привязан к Telegram. Отсканируйте QR в приложении Telegram: Настройки → Устройства → Подключить устройство.',
      )
    } catch (error) {
      setLoginError(error.message || 'Не удалось войти')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleTwoFa = async (event) => {
    event.preventDefault()
    if (!pendingAuth || !twoFaPassword.trim()) return
    setLoginError('')
    try {
      await sendAuthorizationPassword(pendingAuth, twoFaPassword.trim())
      setQrHint('Пароль отправлен, ждём авторизацию…')
      setTwoFaPassword('')
    } catch (error) {
      setLoginError(error.message || 'Не удалось отправить пароль')
    }
  }

  const logout = () => {
    clearCredentials()
    setCredentials(null)
    setPendingAuth(null)
    setQrImage('')
  }

  useEffect(() => {
    if (!pendingAuth) return undefined
    const controller = new AbortController()

    const waitForAuth = async () => {
      let checkState = false
      while (!controller.signal.aborted) {
        try {
          if (checkState) {
            const state = await getStateInstance(pendingAuth, controller.signal)
            if (state?.stateInstance === 'authorized') {
              await finishLogin(pendingAuth)
              return
            }
            if (state?.stateInstance === 'pendingPassword') {
              setQrHint('Введите облачный пароль Telegram (2FA)')
            }
          }
          checkState = true

          const qr = await getQr(pendingAuth, controller.signal)
          if (qr?.type === 'qrCode' && qr.message) {
            setQrImage(`data:image/png;base64,${qr.message}`)
            setQrHint(
              'Отсканируйте QR в Telegram: Настройки → Устройства → Подключить устройство.',
            )
          } else if (qr?.type === 'already_registered' || qr?.type === 'alreadyLogged') {
            await finishLogin(pendingAuth)
            return
          } else if (qr?.type === 'error') {
            setQrHint(qr.message || 'Не удалось получить QR-код, пробуем снова…')
          }
        } catch (error) {
          if (controller.signal.aborted || error.name === 'AbortError') return
          setQrHint(error.message || 'Ожидаем авторизацию инстанса…')
          if (error.status === 429) {
            await wait(10000)
            continue
          }
        }
        await wait(4000)
      }
    }

    waitForAuth()
    return () => controller.abort()
  }, [pendingAuth])

  return {
    credentials,
    idInstance,
    apiTokenInstance,
    apiUrl,
    loginError,
    loginLoading,
    pendingAuth,
    qrImage,
    qrHint,
    twoFaPassword,
    setApiTokenInstance,
    setApiUrl,
    setTwoFaPassword,
    handleIdInstanceChange,
    handleLogin,
    handleTwoFa,
    logout,
  }
}
