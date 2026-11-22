import { useState } from 'react'
import {
  IonAlert,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
} from '@ionic/react'
import { createOutline, locationOutline, trashOutline } from 'ionicons/icons'
import { PageFrame } from '../../components/Shared/PageFrame'
import { useWalks } from '../../context/WalksContext'
import { useAuth } from '../../context/AuthContext'
import { formatDistance, formatDuration } from '../../helpers/storage'
import { DEMO_PET_NAME } from '../../constants'

function formatDate(value) {
  return new Intl.DateTimeFormat('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function RouteArt() {
  return (
    <div className="route-art" aria-hidden="true">
      <svg viewBox="0 0 180 120" preserveAspectRatio="none">
        <path className="route-line" d="M22 78 C40 72 40 38 62 44 S88 88 107 69 S137 37 158 48" />
      </svg>
    </div>
  )
}

function MiniRoute() {
  return (
    <div className="mini-route" aria-hidden="true">
      <svg viewBox="0 0 100 100">
        <path className="route-line" d="M18 60 C24 36 42 39 48 26 S70 24 74 42 S83 66 66 72 S42 83 36 66 S24 54 18 60" />
      </svg>
    </div>
  )
}

export function HistoryPage() {
  const { walks, loading, error, updateWalk, deleteWalk } = useWalks()
  const { user, isDemo } = useAuth()
  const [alert, setAlert] = useState(null)
  const [toast, setToast] = useState('')
  const totalDistance = walks.reduce((sum, walk) => sum + Number(walk.distance_m || 0), 0)
  const petName = user?.user_metadata?.pet_name || (isDemo ? DEMO_PET_NAME : 'tu mascota')

  async function saveNote(id, note) {
    try {
      await updateWalk(id, { note: note.trim() })
      setToast('Nota actualizada.')
    } catch (requestError) {
      setToast(`No se pudo actualizar: ${requestError.message}`)
    }
  }

  async function removeWalk(id) {
    try {
      await deleteWalk(id)
      setToast('Paseo eliminado.')
    } catch (requestError) {
      setToast(`No se pudo eliminar: ${requestError.message}`)
    }
  }

  return (
    <PageFrame title="Historial" active="/tabs/history">
      <header className="page-heading">
        <div className="eyebrow">Tus aventuras con {petName}</div>
        <h1>Historial</h1>
      </header>
      <p className="history-summary">
        {walks.length} {walks.length === 1 ? 'paseo' : 'paseos'} · {formatDistance(totalDistance)} recorridos
      </p>

      {loading && <div className="empty-state"><IonSpinner name="crescent" /><p>Cargando tus paseos...</p></div>}
      {error && <p className="form-error" role="alert">Error de sincronización: {error}</p>}
      {!loading && walks.length === 0 && (
        <div className="empty-state">
          <IonIcon icon={locationOutline} />
          <strong>Aún no hay paseos</strong>
          <p>Cuando termines tu primer recorrido, aparecerá aquí.</p>
        </div>
      )}

      {!loading && walks.length > 0 && (
        <div className="history-grid">
          {walks.map((walk) => (
            <article className="walk-card" key={walk.id}>
              <div className="walk-card-cover">
                {walk.photo_url ? <img src={walk.photo_url} alt="Foto del paseo" /> : <RouteArt />}
                <MiniRoute />
              </div>
              <div className="walk-card-body">
                <div className="walk-card-heading">
                  <div>
                    <h3>{walk.title || 'Paseo con Luna'}</h3>
                    <p className="walk-card-date">{formatDate(walk.started_at || walk.created_at)}</p>
                  </div>
                  <div className="walk-card-actions">
                    <IonButton
                      fill="clear"
                      aria-label="Editar nota del paseo"
                      onClick={() => setAlert({ type: 'edit', id: walk.id, note: walk.note || '' })}
                    >
                      <IonIcon icon={createOutline} />
                    </IonButton>
                    <IonButton
                      fill="clear"
                      color="danger"
                      aria-label="Eliminar paseo"
                      onClick={() => setAlert({ type: 'delete', id: walk.id })}
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </div>
                <div className="walk-metrics">
                  <span className="walk-metric">{formatDistance(walk.distance_m)}</span>
                  <span className="walk-metric">{formatDuration(walk.duration_seconds)}</span>
                  {(walk.photo_url || walk.photo_path) && <span className="walk-metric">Foto</span>}
                </div>
                {walk.note && <p className="walk-card-note">{walk.note}</p>}
              </div>
            </article>
          ))}
        </div>
      )}

      <IonAlert
        isOpen={Boolean(alert)}
        header={alert?.type === 'edit' ? 'Editar nota' : 'Eliminar paseo'}
        message={alert?.type === 'delete' ? 'Esta acción no se puede deshacer.' : undefined}
        inputs={alert?.type === 'edit' ? [{
          name: 'note',
          type: 'text',
          value: alert.note,
          placeholder: 'Escribe una nota',
          attributes: { maxlength: 160 },
        }] : []}
        buttons={alert?.type === 'edit'
          ? [{ text: 'Cancelar', role: 'cancel' }, { text: 'Guardar', handler: (data) => saveNote(alert.id, data.note) }]
          : [{ text: 'Cancelar', role: 'cancel' }, { text: 'Eliminar', role: 'destructive', handler: () => removeWalk(alert.id) }]}
        onDidDismiss={() => setAlert(null)}
      />
      <IonToast isOpen={Boolean(toast)} message={toast} duration={3000} onDidDismiss={() => setToast('')} />
    </PageFrame>
  )
}
