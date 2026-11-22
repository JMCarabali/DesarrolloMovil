import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { IonAlert, IonButton, IonIcon, IonToast } from '@ionic/react'
import { logOutOutline, paw, refreshOutline, trashOutline } from 'ionicons/icons'
import { PageFrame } from '../../components/Shared/PageFrame'
import { useAuth } from '../../context/AuthContext'
import { useWalks } from '../../context/WalksContext'
import { formatDistance, formatDuration } from '../../helpers/storage'
import { DEMO_DOG_PHOTO, DEMO_PET_BREED, DEMO_PET_NAME } from '../../constants'
import { supabase } from '../../lib/supabase'

export function ProfilePage() {
  const navigate = useNavigate()
  const { user, isDemo, signOut } = useAuth()
  const { walks, restoreDemoWalks, clearDemoWalks } = useWalks()
  const [toast, setToast] = useState('')
  const [clearAlertOpen, setClearAlertOpen] = useState(false)
  const totalDistance = walks.reduce((sum, walk) => sum + Number(walk.distance_m || 0), 0)
  const totalDuration = walks.reduce((sum, walk) => sum + Number(walk.duration_seconds || 0), 0)
  const displayName = user?.user_metadata?.full_name || (isDemo ? 'Ana' : user?.email?.split('@')[0] || 'Amante de las mascotas')
  const petName = isDemo ? DEMO_PET_NAME : user?.user_metadata?.pet_name || 'Tu mascota'

  async function logout() {
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (error) {
      setToast(`No se pudo cerrar sesión: ${error.message}`)
    }
  }

  function restoreExamples() {
    try {
      restoreDemoWalks()
      setToast('Se restauraron los paseos de ejemplo.')
    } catch (error) {
      setToast(`No se pudieron restaurar los ejemplos: ${error.message}`)
    }
  }

  function clearHistory() {
    try {
      clearDemoWalks()
      setToast('Se vació el historial de demostración.')
    } catch (error) {
      setToast(`No se pudo vaciar el historial: ${error.message}`)
    }
  }

  return (
    <PageFrame title="Perfil" active="/tabs/profile">
      <header className="page-heading">
        <div className="eyebrow">Patas en Ruta</div>
        <h1>Tu perfil</h1>
      </header>

      <section className="profile-account">
        <div className="profile-avatar" aria-hidden="true">{displayName.charAt(0).toUpperCase()}</div>
        <div>
          <h2>{displayName}</h2>
          <p>{user?.email || 'Cuenta de demostración'}</p>
        </div>
      </section>

      <section className="pet-card">
        <div className="pet-card-top">
          {isDemo
            ? <img src={DEMO_DOG_PHOTO} alt={`${DEMO_PET_NAME}, mascota de demostración`} />
            : <div className="profile-avatar pet-image-placeholder"><IonIcon icon={paw} /></div>}
          <div>
            <div className="eyebrow">{isDemo ? 'Mascota de ejemplo' : 'Tu mascota'}</div>
            <h2>{petName}</h2>
            <p>{isDemo ? DEMO_PET_BREED : 'Nombre guardado en tu cuenta'}</p>
          </div>
        </div>
        <div className="pet-card-stats">
          <div className="stat-card"><strong>{walks.length}</strong><span>Paseos</span></div>
          <div className="stat-card"><strong>{formatDistance(totalDistance)}</strong><span>Distancia</span></div>
          <div className="stat-card"><strong>{formatDuration(totalDuration)}</strong><span>Tiempo</span></div>
        </div>
      </section>

      <section className="preferences-card">
        <h3>{isDemo ? 'Preferencias de demostración' : 'Tu cuenta'}</h3>
        <p className="muted">
          {isDemo
            ? 'Los paseos de ejemplo se guardan en este dispositivo.'
            : supabase ? 'Tus paseos son privados y están protegidos por tu cuenta.' : 'Tus datos se guardan en este dispositivo.'}
        </p>
        {isDemo && (
          <div className="demo-actions">
            <IonButton size="small" onClick={restoreExamples}>
              <IonIcon slot="start" icon={refreshOutline} />
              Restaurar ejemplos
            </IonButton>
            <IonButton size="small" onClick={() => setClearAlertOpen(true)}>
              <IonIcon slot="start" icon={trashOutline} />
              Vaciar historial
            </IonButton>
          </div>
        )}
      </section>

      <IonButton className="logout-button" expand="block" fill="outline" color="danger" onClick={logout}>
        <IonIcon slot="start" icon={logOutOutline} />
        Cerrar sesión
      </IonButton>

      <IonAlert
        isOpen={clearAlertOpen}
        header="¿Vaciar el historial?"
        message="Se eliminarán los paseos guardados en esta demostración."
        buttons={[
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Vaciar', role: 'destructive', handler: clearHistory },
        ]}
        onDidDismiss={() => setClearAlertOpen(false)}
      />
      <IonToast isOpen={Boolean(toast)} message={toast} duration={3000} onDidDismiss={() => setToast('')} />
    </PageFrame>
  )
}
