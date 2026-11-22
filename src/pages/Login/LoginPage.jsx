import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IonButton,
  IonContent,
  IonIcon,
  IonPage,
  IonSpinner,
} from '@ionic/react'
import { paw } from 'ionicons/icons'
import { useAuth } from '../../context/AuthContext'
import { DEMO_DOG_PHOTO } from '../../constants'

export function LoginPage() {
  const navigate = useNavigate()
  const { user, isConfigured, signIn, signUp, continueAsDemo } = useAuth()
  const [mode, setMode] = useState('login')
  const [petName, setPetName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  useEffect(() => {
    if (user) navigate('/tabs/home', { replace: true })
  }, [user, navigate])

  async function submit(event) {
    event.preventDefault()
    setError('')
    setMessage('')
    if (mode === 'register' && !petName.trim()) {
      setError('Escribe el nombre de tu mascota.')
      return
    }
    if (!email.trim() || password.length < 6) {
      setError('Escribe un correo y una contraseña de al menos 6 caracteres.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        await signIn(email.trim(), password)
        navigate('/tabs/home', { replace: true })
      } else {
        const result = await signUp(email.trim(), password, petName.trim())
        if (result.session) navigate('/tabs/home', { replace: true })
        else setMessage('Cuenta creada. Revisa tu correo para confirmar el registro.')
      }
    } catch (requestError) {
      setError(requestError.message || 'No se pudo completar la solicitud.')
    } finally {
      setBusy(false)
    }
  }

  function demoLogin() {
    continueAsDemo()
    navigate('/tabs/home', { replace: true })
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-wrap">
          <section className="login-card">
            <div className={`login-hero ${imageFailed ? 'image-fallback' : ''}`}>
              {!imageFailed && (
                <img
                  src={DEMO_DOG_PHOTO}
                  alt="Perro disfrutando de un paseo"
                  onError={() => setImageFailed(true)}
                />
              )}
              {imageFailed && <IonIcon icon={paw} />}
              <span className="login-paw"><IonIcon icon={paw} /></span>
            </div>
            <h1 className="login-brand">Patas en Ruta</h1>
            <p className="login-subtitle">
              Registra cada paseo: la ruta, el tiempo, las fotos y lo que vivieron juntos.
            </p>
            <div className="login-tabs" role="tablist" aria-label="Acceso a la cuenta">
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                className={mode === 'login' ? 'active' : ''}
                onClick={() => {
                  setMode('login')
                  setError('')
                  setMessage('')
                }}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                className={mode === 'register' ? 'active' : ''}
                onClick={() => {
                  setMode('register')
                  setError('')
                  setMessage('')
                }}
              >
                Crear cuenta
              </button>
            </div>
            <form onSubmit={submit}>
              {mode === 'register' && (
                <label className="login-field">
                  <span>Nombre de tu mascota</span>
                  <input
                    type="text"
                    autocomplete="off"
                    maxLength={40}
                    value={petName}
                    onChange={(event) => setPetName(event.target.value)}
                    placeholder="Ej. Luna"
                    required
                  />
                </label>
              )}
              <label className="login-field">
                <span>Correo electrónico</span>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="tu@correo.com"
                  required
                />
              </label>
              <label className="login-field">
                <span>Contraseña</span>
                <input
                  type="password"
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••"
                  required
                />
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              {message && <p className="form-success" role="status">{message}</p>}
              <IonButton className="ion-margin-top" expand="block" type="submit" disabled={busy}>
                {busy ? <IonSpinner name="crescent" /> : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
              </IonButton>
            </form>
            {!isConfigured && (
              <p className="muted" style={{ fontSize: 12, textAlign: 'center' }}>
                El login real requiere configurar Supabase. Puedes explorar ahora con la demo local.
              </p>
            )}
            <div className="login-divider">o</div>
            <IonButton className="demo-button" color="secondary" expand="block" onClick={demoLogin}>
              Entrar a la demostración
            </IonButton>
            <p className="login-footnote">En modo demo, los paseos se guardan solo en este dispositivo.</p>
          </section>
        </div>
      </IonContent>
    </IonPage>
  )
}
