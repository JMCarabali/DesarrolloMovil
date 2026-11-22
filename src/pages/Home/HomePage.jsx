import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/react'
import {
  cameraOutline,
  flagOutline,
  locateOutline,
  paw,
  walkOutline,
  createOutline,
} from 'ionicons/icons'
import { PageFrame } from '../../components/Shared/PageFrame'
import { WalkMap } from '../../components/Home/WalkMap'
import { useAuth } from '../../context/AuthContext'
import { useWalks } from '../../context/WalksContext'
import { useCamera } from '../../hooks/useCamera'
import { useGeolocation } from '../../hooks/useGeolocation'
import { useHaptics } from '../../hooks/useHaptics'
import { formatDistance, formatDuration, distanceBetween } from '../../helpers/storage'
import { DEMO_PET_NAME } from '../../constants'

function formatPace(seconds, meters) {
  if (meters < 100) return '--:-- /km'
  const paceSeconds = Math.round(seconds / (meters / 1000))
  const minutes = Math.floor(paceSeconds / 60)
  const remainingSeconds = String(paceSeconds % 60).padStart(2, '0')
  return `${minutes}:${remainingSeconds} /km`
}

function formatShortDate(value) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function HomePage() {
  const { user, isDemo } = useAuth()
  const { walks, addWalk } = useWalks()
  const { position, error: locationError, getCurrentPosition, startWatching, stopWatching } = useGeolocation()
  const { takePhoto } = useCamera()
  const tapFeedback = useHaptics()
  const [points, setPoints] = useState([])
  const [startedAt, setStartedAt] = useState(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [distance, setDistance] = useState(0)
  const [photo, setPhoto] = useState(null)
  const [note, setNote] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [toast, setToast] = useState('')
  const [finishAlertOpen, setFinishAlertOpen] = useState(false)
  const [referenceTime] = useState(() => Date.now())
  const pointsRef = useRef([])
  const distanceRef = useRef(0)
  const isTracking = Boolean(startedAt)

  useEffect(() => {
    if (!startedAt) return undefined
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [startedAt])

  async function beginWalk() {
    setBusy(true)
    setToast('')
    try {
      const initialPosition = position || await getCurrentPosition()
      pointsRef.current = [initialPosition]
      distanceRef.current = 0
      setPoints([initialPosition])
      setDistance(0)
      setPhoto(null)
      setNote('')
      setNoteOpen(false)
      setElapsedSeconds(0)
      setStartedAt(Date.now())
      await startWatching((nextPosition) => {
        const lastPosition = pointsRef.current[pointsRef.current.length - 1]
        if (!lastPosition) {
          pointsRef.current = [nextPosition]
          setPoints([nextPosition])
          return
        }
        const stepDistance = distanceBetween(lastPosition, nextPosition)
        if (stepDistance < 2) return
        distanceRef.current += stepDistance
        const nextPoints = [...pointsRef.current, nextPosition]
        pointsRef.current = nextPoints
        setPoints(nextPoints)
        setDistance(distanceRef.current)
      })
      await tapFeedback()
    } catch (error) {
      setStartedAt(null)
      setToast(`No se pudo iniciar el GPS: ${error.message || 'revisa los permisos del dispositivo.'}`)
    } finally {
      setBusy(false)
    }
  }

  async function finishWalk() {
    setBusy(true)
    try {
      await stopWatching()
      const finishedAt = Date.now()
      const firstPoint = pointsRef.current[0] || position
      const lastPoint = pointsRef.current[pointsRef.current.length - 1] || position
      await addWalk({
        title: `Paseo del ${new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(new Date(startedAt))}`,
        started_at: new Date(startedAt).toISOString(),
        duration_seconds: Math.floor((finishedAt - startedAt) / 1000),
        distance_m: Math.round(distanceRef.current),
        start_lat: firstPoint?.latitude ?? null,
        start_lng: firstPoint?.longitude ?? null,
        end_lat: lastPoint?.latitude ?? null,
        end_lng: lastPoint?.longitude ?? null,
        coordinates: pointsRef.current,
        note: note.trim(),
        photo_data: photo,
      })
      setStartedAt(null)
      setPoints([])
      pointsRef.current = []
      setDistance(0)
      setElapsedSeconds(0)
      setNote('')
      setNoteOpen(false)
      await tapFeedback()
      setToast('Paseo guardado en tu historial.')
    } catch (error) {
      setToast(`No se pudo guardar el paseo: ${error.message}`)
    } finally {
      setBusy(false)
    }
  }

  async function capturePhoto() {
    try {
      setPhoto(await takePhoto())
      setToast('Foto lista para guardar con este paseo.')
    } catch (error) {
      setToast(`No se pudo tomar la foto: ${error.message}`)
    }
  }

  async function refreshLocation() {
    try {
      await getCurrentPosition()
      setToast('Ubicación actualizada.')
    } catch (error) {
      setToast(`No se pudo actualizar la ubicación: ${error.message}`)
    }
  }

  const recentWalks = walks.filter((walk) => {
    const date = new Date(walk.started_at || walk.created_at).getTime()
    return date >= referenceTime - 7 * 24 * 60 * 60 * 1000
  })
  const weeklyDistance = recentWalks.reduce((sum, walk) => sum + Number(walk.distance_m || 0), 0)
  const weeklyDuration = recentWalks.reduce((sum, walk) => sum + Number(walk.duration_seconds || 0), 0)
  const latestWalk = walks[0]
  const displayName = user?.user_metadata?.full_name || (isDemo ? 'Ana' : user?.email?.split('@')[0] || 'amigo')
  const petName = user?.user_metadata?.pet_name || (isDemo ? DEMO_PET_NAME : 'tu mascota')
  const latestPoints = latestWalk?.coordinates || []

  return (
    <PageFrame title="Patas en Ruta" active="/tabs/home">
      {!isTracking ? (
        <>
          <header className="home-heading">
            <div>
              <p className="home-greeting">Hola, {displayName}</p>
              <h1>¿Salimos con {petName}?</h1>
            </div>
            <div className="paw-badge" aria-hidden="true"><IonIcon icon={paw} /></div>
          </header>

          <section className="home-map-card" aria-label="Mapa del paseo">
            <span className="map-label">
              <IonIcon icon={locateOutline} /> {position ? 'Tu ubicación' : 'Cali, Colombia · mapa de referencia'}
            </span>
            <WalkMap
              position={position || (latestPoints.length ? latestPoints[latestPoints.length - 1] : null)}
              points={latestPoints}
            />
          </section>
          <button type="button" className="location-link" onClick={refreshLocation}>
            Actualizar ubicación
          </button>

          <div className="section-row">
            <h2>Últimos 7 días</h2>
          </div>
          <div className="stat-grid" aria-live="polite">
            <div className="stat-card"><strong>{formatDistance(weeklyDistance)}</strong><span>Distancia</span></div>
            <div className="stat-card"><strong>{formatDuration(weeklyDuration)}</strong><span>Duración</span></div>
            <div className="stat-card"><strong>{recentWalks.length}</strong><span>Paseos</span></div>
          </div>

          <IonButton className="primary-walk-button" expand="block" onClick={beginWalk} disabled={busy}>
            {busy ? <IonSpinner name="crescent" /> : <><IonIcon slot="start" icon={walkOutline} />Iniciar paseo</>}
          </IonButton>

          <div className="section-row">
            <h2>Último paseo</h2>
            <Link className="text-link" to="/tabs/history">Ver historial</Link>
          </div>
          {latestWalk ? (
            <article className="latest-walk-card">
              {latestWalk.photo_url
                ? <img src={latestWalk.photo_url} alt="Perro durante un paseo" />
                : <div className="latest-walk-placeholder" aria-hidden="true"><IonIcon icon={paw} /></div>}
              <div>
                <h3>{latestWalk.title || 'Paseo con Luna'}</h3>
                <p>{formatShortDate(latestWalk.started_at || latestWalk.created_at)}</p>
                <p>{formatDistance(latestWalk.distance_m)} · {formatDuration(latestWalk.duration_seconds)}</p>
              </div>
            </article>
          ) : (
            <div className="empty-latest">Tu primer paseo aparecerá aquí.</div>
          )}
        </>
      ) : (
        <>
          <header className="tracking-heading">
            <div className="eyebrow">Paseando con {petName}</div>
            <h1>Paseo en curso</h1>
          </header>

          <section className="tracking-map-card" aria-label="Ruta actual">
            <span className="map-label">{isDemo ? 'GPS de demostración' : 'GPS activo'}</span>
            <WalkMap position={position} points={points} />
          </section>

          <section className="tracking-summary" aria-live="polite">
            <p className="tracking-timer">{formatDuration(elapsedSeconds)}</p>
            <div className="tracking-stats">
              <div className="tracking-stat"><span>Distancia</span><strong>{formatDistance(distance)}</strong></div>
              <div className="tracking-stat"><span>Ritmo</span><strong>{formatPace(elapsedSeconds, distance)}</strong></div>
            </div>
          </section>

          <div className="tracking-controls">
            <IonButton className="control-gps" onClick={refreshLocation} aria-label="Actualizar GPS">
              <IonIcon icon={locateOutline} />
              GPS
            </IonButton>
            <IonButton className="control-soft" onClick={capturePhoto} aria-label="Tomar una foto">
              <IonIcon icon={cameraOutline} />
              Cámara
            </IonButton>
            <IonButton className="control-soft" onClick={() => setNoteOpen((open) => !open)} aria-label="Agregar nota">
              <IonIcon icon={createOutline} />
              Nota
            </IonButton>
            <IonButton className="control-finish" onClick={() => setFinishAlertOpen(true)} disabled={busy} aria-label="Finalizar paseo">
              <IonIcon icon={flagOutline} />
              Finalizar
            </IonButton>
          </div>

          {photo && <img className="walk-photo" src={photo} alt="Foto tomada durante el paseo" />}
          {noteOpen && (
            <label className="walk-note">
              <span className="muted">Nota del paseo</span>
              <textarea
                className="note-input"
                value={note}
                maxLength={160}
                onChange={(event) => setNote(event.target.value)}
                placeholder="¿Qué disfrutaron hoy?"
                rows={3}
              />
            </label>
          )}
        </>
      )}

      <IonAlert
        isOpen={finishAlertOpen}
        header="¿Guardar el paseo?"
        message="El recorrido quedará en tu historial."
        buttons={[
          { text: 'Seguir paseando', role: 'cancel' },
          { text: 'Descartar', role: 'destructive', handler: () => { setFinishAlertOpen(false); setStartedAt(null); stopWatching() } },
          { text: 'Guardar', handler: () => finishWalk() },
        ]}
        onDidDismiss={() => setFinishAlertOpen(false)}
      />
      {locationError && <p className="form-error" role="alert">{locationError}</p>}
      <IonToast isOpen={Boolean(toast)} message={toast} duration={3500} onDidDismiss={() => setToast('')} />
    </PageFrame>
  )
}
