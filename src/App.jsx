import { useEffect, useRef, useState } from 'react'
import { IonApp, IonContent, IonIcon, IonSpinner } from '@ionic/react'
import { ribbonOutline, cameraOutline, checkmarkCircle, chevronForward, compassOutline, footstepsOutline, lockClosedOutline, logOutOutline, medalOutline, personOutline, radioButtonOnOutline, timerOutline, trophyOutline } from 'ionicons/icons'
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Geolocation } from '@capacitor/geolocation'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Motion } from '@capacitor/motion'
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth'
import { collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, firebaseEnabled } from './firebase.js'

const missions = [
  { id: 'photo', title: 'Captura el momento', detail: 'Toma una foto para dejar evidencia.', points: 40, icon: cameraOutline, action: 'Tomar foto' },
  { id: 'movement', title: 'Explora tu entorno', detail: 'Aléjate más de 30 m de tu ubicación inicial.', points: 60, icon: footstepsOutline, action: 'Comenzar recorrido' },
  { id: 'stillness', title: 'Pausa consciente', detail: 'Llega a 50 m y permanece quieto durante 10 segundos.', points: 80, icon: timerOutline, action: 'Iniciar pausa' },
]
const demoRivals = [
  { uid: 'sample-1', name: 'Valentina R.', points: 260 }, { uid: 'sample-2', name: 'Mateo C.', points: 210 },
  { uid: 'sample-3', name: 'Sara M.', points: 160 }, { uid: 'sample-4', name: 'Nicolás P.', points: 90 },
]
const initial = { points: 0, missions: { photo: false, movement: false, stillness: false }, distance: 0, origin: null, photoData: '' }
const keyFor = (uid) => `uao-missions-${uid}`
const pageForPath = { '/tasks': 'missions', '/ranking': 'ranking', '/results': 'results' }
const pathForPage = { missions: '/tasks', ranking: '/ranking', results: '/results' }
const radians = (value) => value * Math.PI / 180

function distanceBetween(a, b) {
  const lat = radians(b.latitude - a.latitude)
  const lon = radians(b.longitude - a.longitude)
  const value = Math.sin(lat / 2) ** 2 + Math.cos(radians(a.latitude)) * Math.cos(radians(b.latitude)) * Math.sin(lon / 2) ** 2
  return 6371000 * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value))
}

async function readProgress(uid) {
  let localProgress = initial
  try {
    const saved = localStorage.getItem(keyFor(uid))
    if (saved) {
      const parsed = JSON.parse(saved)
      localProgress = { ...initial, ...parsed, missions: { ...initial.missions, ...parsed.missions } }
    }
  } catch { /* Use the initial state when local storage is unavailable. */ }
  if (db && !uid.startsWith('demo-')) {
    try {
      const snapshot = await getDoc(doc(db, 'users', uid))
      if (snapshot.exists()) {
        const saved = { ...initial, ...snapshot.data(), missions: { ...initial.missions, ...snapshot.data().missions } }
        localStorage.setItem(keyFor(uid), JSON.stringify(saved))
        return saved
      }
    } catch { /* Keep the last local copy while Firebase is offline. */ }
  }
  return localProgress
}

async function persistProgress(uid, user, progress) {
  const value = JSON.stringify(progress)
  localStorage.setItem(keyFor(uid), value)
  if (db && !uid.startsWith('demo-')) {
    const { photoData, ...syncableProgress } = progress
    const name = user.displayName || user.name || user.email?.split('@')[0] || 'Estudiante'
    await Promise.all([
      setDoc(doc(db, 'users', uid), { uid, name, email: user.email || '', ...syncableProgress, updatedAt: serverTimestamp() }, { merge: true }),
      setDoc(doc(db, 'leaderboard', uid), { uid, name, points: progress.points, updatedAt: serverTimestamp() }, { merge: true }),
    ])
  }
}

async function sendNotification(title, body) {
  try {
    const permission = await LocalNotifications.checkPermissions()
    if (permission.display !== 'granted') await LocalNotifications.requestPermissions()
    await LocalNotifications.schedule({ notifications: [{ id: Math.floor(Date.now() % 2147483647), title, body, schedule: { at: new Date(Date.now() + 500) } }] })
  } catch {
    if ('Notification' in window && Notification.permission === 'granted') new Notification(title, { body })
  }
}

function AuthScreen({ onDemo }) {
  const [registering, setRegistering] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true)
    try {
      if (!auth) throw new Error('Firebase no está configurado. Entra en modo demo o completa el archivo .env.')
      if (registering) {
        const credential = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(credential.user, { displayName: name.trim() })
        await Promise.all([
          setDoc(doc(db, 'users', credential.user.uid), { uid: credential.user.uid, name: name.trim(), email, ...initial, updatedAt: serverTimestamp() }),
          setDoc(doc(db, 'leaderboard', credential.user.uid), { uid: credential.user.uid, name: name.trim(), points: 0, updatedAt: serverTimestamp() }),
        ])
      } else await signInWithEmailAndPassword(auth, email, password)
    } catch (submitError) { setError(submitError.message || 'No se pudo completar el acceso.') } finally { setBusy(false) }
  }

  return <main className="auth-layout">
    <section className="auth-story">
      <div className="brand-lockup"><span className="brand-mark">uao</span><span className="brand-divider" /><span>Campus en movimiento</span></div>
      <div className="auth-headline"><p className="eyebrow">PARCIAL 2 · RETOS DE CAMPUS</p><h1>Un pequeño reto.<br /><em>Una gran historia.</em></h1><p>Explora, captura y haz una pausa. Cada misión suma puntos para ti.</p></div>
      <div className="story-stats"><div><strong>03</strong><span>misiones</span></div><div><strong>180</strong><span>puntos posibles</span></div><span className="story-orbit orbit-one" /><span className="story-orbit orbit-two" /></div>
    </section>
    <section className="auth-panel"><div className="auth-form-wrap">
      <span className="small-label">BIENVENIDO A UAO</span><h2>{registering ? 'Crea tu cuenta' : 'Inicia tu recorrido'}</h2><p className="muted">{registering ? 'Regístrate para guardar tus misiones y puntaje.' : 'Ingresa para continuar donde lo dejaste.'}</p>
      <form onSubmit={submit} className="auth-form">
        {registering && <label>Nombre completo<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Tu nombre" required autoComplete="name" /></label>}
        <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@uao.edu.co" required autoComplete="email" /></label>
        <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo 6 caracteres" required minLength="6" autoComplete={registering ? 'new-password' : 'current-password'} /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button auth-submit" type="submit" disabled={busy || !firebaseEnabled}>{busy ? <IonSpinner name="crescent" /> : registering ? 'Crear cuenta' : 'Iniciar sesión'}{!busy && <IonIcon icon={chevronForward} />}</button>
      </form>
      <button className="text-button" onClick={() => { setRegistering(!registering); setError('') }}>{registering ? 'Ya tengo cuenta · Iniciar sesión' : '¿Primera vez? Crear cuenta'}</button>
      {!firebaseEnabled && <div className="demo-callout"><span className="demo-dot" /><div><strong>Firebase pendiente de configurar</strong><p>Prueba el recorrido localmente o agrega las claves de Firebase para activar cuentas reales.</p><button className="demo-button" onClick={() => onDemo(email, name)}>Entrar en modo demo <IonIcon icon={chevronForward} /></button></div></div>}
      <p className="auth-footnote"><IonIcon icon={lockClosedOutline} />{firebaseEnabled ? 'Acceso protegido con Firebase Authentication' : 'El modo demo guarda el progreso solo en este dispositivo'}</p>
    </div></section>
  </main>
}

function App() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [progress, setProgress] = useState(initial)
  const progressRef = useRef(initial)
  const [page, setPage] = useState(() => pageForPath[window.location.pathname] || 'missions')
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [locationBusy, setLocationBusy] = useState(false)
  const [sensorMessage, setSensorMessage] = useState('')
  const [stillnessActive, setStillnessActive] = useState(false)
  const [countdown, setCountdown] = useState(10)
  const [ranking, setRanking] = useState([])
  const watchId = useRef(null)
  const motionListener = useRef(null)
  const movingRef = useRef(false)
  const timerRef = useRef(null)

  function saveProgress(next) {
    progressRef.current = next; setProgress(next)
    if (user) persistProgress(user.uid, user, next).catch((error) => console.error('No se pudo sincronizar el progreso', error))
  }

  useEffect(() => {
    if (auth) return onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); setAuthLoading(false) })
    const session = localStorage.getItem('uao-demo-session')
    if (session) setUser(JSON.parse(session))
    setAuthLoading(false)
    return undefined
  }, [])

  useEffect(() => {
    const path = pathForPage[page]
    if (window.location.pathname !== path) window.history.pushState({}, '', path)
  }, [page])

  useEffect(() => {
    function restorePage() {
      setPage(pageForPath[window.location.pathname] || 'missions')
    }
    window.addEventListener('popstate', restorePage)
    return () => window.removeEventListener('popstate', restorePage)
  }, [])

  useEffect(() => {
    let active = true
    if (!user) { setProgress(initial); progressRef.current = initial; return undefined }
    setLoadingProgress(true)
    readProgress(user.uid).then((saved) => {
      if (active) { setProgress(saved); progressRef.current = saved }
    }).catch((error) => console.error('No se pudo cargar el progreso', error)).finally(() => { if (active) setLoadingProgress(false) })
    return () => { active = false }
  }, [user])

  useEffect(() => () => {
    if (watchId.current !== null) Geolocation.clearWatch({ id: watchId.current })
    motionListener.current?.remove()
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  useEffect(() => {
    if (!user) return undefined
    let active = true
    async function loadRanking() {
      let others = demoRivals
      if (db && !user.uid.startsWith('demo-')) {
        const top = await getDocs(query(collection(db, 'leaderboard'), orderBy('points', 'desc'), limit(5)))
        others = top.docs.map((entry) => ({ uid: entry.id, ...entry.data() })).filter((entry) => entry.uid !== user.uid).slice(0, 4)
      }
      const me = { uid: user.uid, name: user.displayName || user.name || user.email?.split('@')[0] || 'Tú', points: progressRef.current.points }
      const next = [me, ...others.filter((entry) => entry.uid !== user.uid)].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5)
      if (active) setRanking(next)
    }
    loadRanking().catch((error) => console.error('No se pudo cargar el ranking', error))
    return () => { active = false }
  }, [user, progress.points])

  function completeMission(id, extra = {}) {
    const before = progressRef.current
    if (before.missions[id]) return false
    const mission = missions.find((entry) => entry.id === id)
    const next = { ...before, ...extra, points: before.points + mission.points, missions: { ...before.missions, [id]: true } }
    saveProgress(next)
    sendNotification('Has completado una misión', `Ganaste ${mission.points} puntos por: ${mission.title}.`)
    if (Object.values(next.missions).filter(Boolean).length === 2) sendNotification('Te falta 1 misión para completar', 'Estás a un paso de terminar todos los retos.')
    return true
  }

  async function capturePhoto() {
    try {
      const photo = await Camera.getPhoto({ quality: 65, allowEditing: false, resultType: CameraResultType.DataUrl, source: CameraSource.Camera })
      completeMission('photo', { photoData: photo.dataUrl || '' })
    } catch (error) {
      if (!error.message?.toLowerCase().includes('cancel')) setSensorMessage('No se pudo abrir la cámara. Revisa los permisos del dispositivo.')
    }
  }

  async function startTracking() {
    if (watchId.current !== null || progressRef.current.missions.movement) return
    setLocationBusy(true); setSensorMessage('Buscando tu ubicación inicial…')
    try {
      await Geolocation.requestPermissions()
      const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 15000 })
      const origin = { latitude: position.coords.latitude, longitude: position.coords.longitude }
      saveProgress({ ...progressRef.current, origin, distance: 0 })
      setSensorMessage('Recorrido activo. Al superar 30 m completas esta misión; con 50 m se habilita la pausa.')
      watchId.current = await Geolocation.watchPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 1000 }, (nextPosition, error) => {
        if (error || !nextPosition) { setSensorMessage('No se pudo leer la ubicación. Comprueba los permisos y vuelve a intentarlo.'); return }
        if (nextPosition.coords.accuracy > 30) {
          setSensorMessage('Señal GPS imprecisa. Espera unos segundos para obtener una medición más confiable.')
          return
        }
        const distance = distanceBetween(origin, { latitude: nextPosition.coords.latitude, longitude: nextPosition.coords.longitude })
        const rounded = Math.round(distance)
        if (distance > 30 && !progressRef.current.missions.movement) completeMission('movement')
        saveProgress({ ...progressRef.current, origin, distance: Math.max(progressRef.current.distance || 0, rounded) })
        setSensorMessage(distance >= 50 ? '¡50 m alcanzados! La pausa consciente ya está disponible.' : `Distancia recorrida: ${rounded} m · objetivo de desbloqueo: 50 m`)
      })
    } catch (error) { setSensorMessage(error.message || 'Activa el permiso de ubicación para iniciar el recorrido.') }
    finally { setLocationBusy(false) }
  }

  async function beginStillness() {
    if (stillnessActive || progressRef.current.missions.stillness || progressRef.current.distance < 50) return
    movingRef.current = false; setCountdown(10); setStillnessActive(true)
    try {
      const deviceMotion = globalThis.DeviceMotionEvent
      if (!deviceMotion) throw new Error('Este dispositivo no expone el acelerómetro.')
      if (typeof deviceMotion.requestPermission === 'function') {
        const permission = await deviceMotion.requestPermission()
        if (permission !== 'granted') throw new Error('Debes permitir el acceso al sensor de movimiento.')
      }
      let lastMotionAt = Date.now()
      let previousGravity = null
      motionListener.current = await Motion.addListener('accel', (event) => {
        lastMotionAt = Date.now()
        if (event.acceleration) {
          const { x = 0, y = 0, z = 0 } = event.acceleration
          if (Math.sqrt(x ** 2 + y ** 2 + z ** 2) > 1.2) movingRef.current = true
          return
        }
        const gravity = event.accelerationIncludingGravity
        if (!gravity) return
        if (previousGravity) {
          const change = Math.sqrt((gravity.x - previousGravity.x) ** 2 + (gravity.y - previousGravity.y) ** 2 + (gravity.z - previousGravity.z) ** 2)
          if (change > 1.5) movingRef.current = true
        }
        previousGravity = gravity
      })
      let started = Date.now()
      timerRef.current = setInterval(() => {
        if (Date.now() - lastMotionAt > 3000) {
          clearInterval(timerRef.current); timerRef.current = null
          motionListener.current?.remove(); motionListener.current = null; setStillnessActive(false)
          setSensorMessage('No llegan datos del acelerómetro. Revisa los permisos del dispositivo e inténtalo de nuevo.')
          return
        }
        const elapsed = Math.floor((Date.now() - started) / 1000)
        if (movingRef.current) { movingRef.current = false; started = Date.now(); setCountdown(10); return }
        const remaining = Math.max(0, 10 - elapsed); setCountdown(remaining)
        if (remaining === 0) {
          clearInterval(timerRef.current); timerRef.current = null
          motionListener.current?.remove(); motionListener.current = null; setStillnessActive(false)
          Haptics.impact({ style: ImpactStyle.Heavy }).catch(() => {})
          setSensorMessage('Quietud detectada: el teléfono vibró.')
          completeMission('stillness')
        }
      }, 200)
    } catch (error) {
      setStillnessActive(false); setSensorMessage(error.message || 'No se pudo activar el acelerómetro. Revisa los permisos del dispositivo.')
    }
  }

  async function logout() {
    if (auth) await signOut(auth)
    else localStorage.removeItem('uao-demo-session')
    if (watchId.current !== null) { await Geolocation.clearWatch({ id: watchId.current }); watchId.current = null }
    setUser(null)
  }

  function enterDemo(email, name) {
    const cleanEmail = email.trim().toLowerCase()
    const session = { uid: `demo-${cleanEmail ? btoa(cleanEmail).replace(/=/g, '') : 'estudiante'}`, email: cleanEmail || 'estudiante@uao.edu.co', name: name.trim() || 'Estudiante UAO' }
    localStorage.setItem('uao-demo-session', JSON.stringify(session)); setUser(session)
  }

  if (authLoading) return <IonApp><div className="loading-screen"><IonSpinner name="crescent" /><span>Preparando tu recorrido</span></div></IonApp>
  if (!user) return <IonApp><AuthScreen onDemo={enterDemo} /></IonApp>
  const completed = Object.values(progress.missions).filter(Boolean).length
  const percent = Math.round(completed / missions.length * 100)
  const userName = user.displayName || user.name || user.email?.split('@')[0] || 'Estudiante'
  const stillnessUnlocked = progress.distance >= 50 || progress.missions.stillness

  return <IonApp><IonContent fullscreen className="app-content"><div className="app-shell">
    <header className="topbar"><a className="brand-lockup app-brand" href="#inicio" onClick={(event) => { event.preventDefault(); setPage('missions') }}><span className="brand-mark">uao</span><span className="brand-divider" /><span>Misiones</span></a><nav className="desktop-nav" aria-label="Navegación principal"><button className={page === 'missions' ? 'nav-active' : ''} onClick={() => setPage('missions')}>Retos</button><button className={page === 'ranking' ? 'nav-active' : ''} onClick={() => setPage('ranking')}>Ranking</button><button className={page === 'results' ? 'nav-active' : ''} onClick={() => setPage('results')}>Resultados</button></nav><div className="topbar-user"><span className="avatar">{userName.slice(0, 1).toUpperCase()}</span><span className="user-greeting">Hola, <strong>{userName.split(' ')[0]}</strong></span><button className="icon-button" title="Cerrar sesión" onClick={logout}><IonIcon icon={logOutOutline} /></button></div></header>
    <main className="dashboard">
      {page === 'missions' && <>
        <section className="welcome-row"><div><p className="eyebrow">TU TABLERO · CAMPUS UAO</p><h1>Hoy es un buen día<br /><em>para moverte.</em></h1></div><div className="welcome-stamp"><IonIcon icon={compassOutline} /><span>Explora<br />a tu ritmo</span></div></section>
        <section className="summary-grid" aria-label="Resumen de progreso"><div className="score-block"><span className="summary-label">PUNTAJE TOTAL</span><div className="score-value">{progress.points}<span> pts</span></div><div className="score-note"><IonIcon icon={ribbonOutline} /> Tu siguiente logro está cerca</div></div><div className="progress-block"><div className="progress-head"><span className="summary-label">PROGRESO</span><strong>{percent}%</strong></div><div className="progress-track"><span style={{ width: `${percent}%` }} /></div><div className="progress-foot"><span>{completed} de 3 misiones</span><span>{3 - completed} pendientes</span></div></div></section>
        <div className="section-heading"><div><p className="eyebrow">TU RECORRIDO</p><h2>Misiones <span>({completed}/3)</span></h2></div><span className="points-legend"><IonIcon icon={medalOutline} /> Puntos por misión</span></div>
        {loadingProgress ? <div className="inline-loading"><IonSpinner name="crescent" /> Cargando tu progreso…</div> : <section className="mission-list">{missions.map((mission, index) => {
          const done = progress.missions[mission.id]
          const locked = mission.id === 'stillness' && !stillnessUnlocked
          const tracking = mission.id === 'movement' && !done && progress.origin
          return <article className={`mission-row ${done ? 'is-done' : ''} ${locked ? 'is-locked' : ''}`} key={mission.id}>
            <div className={`mission-icon mission-icon-${mission.id}`}><IonIcon icon={done ? checkmarkCircle : locked ? lockClosedOutline : mission.icon} /></div>
            <div className="mission-copy"><div className="mission-title-line"><span className="mission-index">0{index + 1}</span><h3>{mission.title}</h3>{done && <span className="status-pill completed-pill">Completada</span>}{locked && <span className="status-pill locked-pill">Bloqueada</span>}{tracking && <span className="status-pill active-pill">En curso</span>}</div><p>{mission.detail}</p>
              {mission.id === 'movement' && progress.origin && !done && <div className="distance-line"><span className="distance-meter"><span style={{ width: `${Math.min(100, progress.distance / 50 * 100)}%` }} /></span><span>{progress.distance} / 50 m</span></div>}
              {mission.id === 'stillness' && stillnessActive && <div className="countdown-line"><span className="countdown-number">{countdown}</span><span>segundos en quietud</span></div>}
              {mission.id === 'photo' && progress.photoData && <img className="evidence-thumb" src={progress.photoData} alt="Foto de evidencia" />}
            </div>
            <div className="mission-action"><span className="mission-points">+{mission.points} <small>pts</small></span>{!done && <button className="action-button" disabled={locked || loadingProgress || locationBusy || (mission.id === 'stillness' && stillnessActive)} onClick={() => mission.id === 'photo' ? capturePhoto() : mission.id === 'movement' ? startTracking() : beginStillness()}>{mission.id === 'movement' && locationBusy ? <IonSpinner name="crescent" /> : mission.id === 'stillness' && stillnessActive ? 'En marcha…' : mission.id === 'movement' && tracking ? 'Midiendo…' : mission.action}<IonIcon icon={chevronForward} /></button>}</div>
          </article>
        })}</section>}
        {sensorMessage && <p className="sensor-message" role="status"><IonIcon icon={radioButtonOnOutline} />{sensorMessage}</p>}
        <div className="dashboard-bottom"><div className="hint-band"><span className="hint-mark"><IonIcon icon={ribbonOutline} /></span><div><strong>Un reto a la vez.</strong><p>Tu progreso se guarda en este dispositivo{firebaseEnabled ? ' y en Firebase.' : '.'}</p></div></div><button className="secondary-link" onClick={() => setPage('results')}>Ver resultados <IonIcon icon={chevronForward} /></button></div>
      </>}
      {page === 'ranking' && <section className="subpage"><p className="eyebrow">CLASIFICACIÓN DEL CAMPUS</p><h1>El esfuerzo<br /><em>se comparte.</em></h1><p className="subpage-intro">Así va el top 5 según los puntos acumulados.</p><div className="ranking-table"><div className="ranking-header"><span>POS.</span><span>ESTUDIANTE</span><span>PUNTOS</span></div>{ranking.map((entry, index) => <div className={`ranking-row ${entry.uid === user.uid ? 'ranking-self' : ''}`} key={entry.uid}><span className={`rank-number ${index === 0 ? 'rank-first' : ''}`}>{String(index + 1).padStart(2, '0')}</span><div className="rank-name"><span className="avatar rank-avatar">{(entry.name || 'U').slice(0, 1).toUpperCase()}</span><span>{entry.name || 'Estudiante'}{entry.uid === user.uid && <small> · TÚ</small>}</span></div><strong>{entry.points || 0} <small>pts</small></strong></div>)}</div>{!firebaseEnabled && <p className="ranking-note">Modo demo: los demás puestos son perfiles de muestra. Configura Firebase para consultar usuarios reales.</p>}</section>}
      {page === 'results' && <section className="subpage results-page"><p className="eyebrow">CIERRE DEL RECORRIDO</p><h1>Lo que lograste<br /><em>hoy cuenta.</em></h1><div className="result-score"><span>Tu puntaje</span><strong>{progress.points}<small> pts</small></strong></div><div className="result-stats"><div><strong>{completed}<small>/3</small></strong><span>misiones completadas</span></div><div><strong>{percent}%</strong><span>progreso total</span></div></div><div className="result-state"><span className={`result-indicator ${completed === 3 ? 'all-done' : ''}`}><IonIcon icon={completed === 3 ? trophyOutline : footstepsOutline} /></span><div><strong>{completed === 3 ? 'Recorrido completado' : completed === 0 ? 'Tu recorrido te espera' : 'Vas por buen camino'}</strong><p>{completed === 3 ? 'Terminaste todas las misiones. ¡Gran trabajo!' : `Has completado ${completed} de 3 misiones. Cada paso suma.`}</p></div></div><button className="primary-button results-action" onClick={() => setPage('missions')}>Volver a misiones <IonIcon icon={chevronForward} /></button></section>}
    </main>
    <nav className="bottom-nav" aria-label="Navegación principal"><button className={page === 'missions' ? 'nav-active' : ''} onClick={() => setPage('missions')}><IonIcon icon={compassOutline} /><span>Misiones</span></button><button className={page === 'ranking' ? 'nav-active' : ''} onClick={() => setPage('ranking')}><IonIcon icon={trophyOutline} /><span>Ranking</span></button><button className={page === 'results' ? 'nav-active' : ''} onClick={() => setPage('results')}><IonIcon icon={personOutline} /><span>Resultados</span></button></nav>
    <footer className="desktop-footer"><span>UNIVERSIDAD AUTÓNOMA DE OCCIDENTE</span><span>Misiones UAO <b>·</b> Parcial 2</span></footer>
  </div></IonContent></IonApp>
}

export default App