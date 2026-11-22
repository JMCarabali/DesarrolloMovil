import { IonContent, IonPage } from '@ionic/react'
import { NavLink } from 'react-router-dom'
import { homeOutline, listOutline, personCircleOutline } from 'ionicons/icons'
import { IonIcon } from '@ionic/react'
import { useNetwork } from '../../hooks/useNetwork'

const navigation = [
  { path: '/tabs/home', label: 'Inicio', icon: homeOutline },
  { path: '/tabs/history', label: 'Historial', icon: listOutline },
  { path: '/tabs/profile', label: 'Perfil', icon: personCircleOutline },
]

export function PageFrame({ title, children, active }) {
  const connected = useNetwork()
  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="page-shell" aria-label={title}>
          <div className={`connection-pill ${connected ? '' : 'offline'}`}>
            <span aria-hidden="true">{connected ? '●' : '○'}</span>
            {connected ? 'Con conexión' : 'Sin conexión · modo local'}
          </div>
          {children}
        </main>
        <nav className="bottom-nav" aria-label="Navegación principal">
          {navigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={active === item.path ? 'active' : ''}
              aria-current={active === item.path ? 'page' : undefined}
            >
              <IonIcon icon={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </IonContent>
    </IonPage>
  )
}
