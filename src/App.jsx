import { lazy, Suspense } from 'react'
import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'

const CapabilityPage = lazy(() => import('./pages/CapabilityPage.jsx'))

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/" element={<HomePage />} />
          <Route
            exact
            path="/:capabilityId"
            element={(
              <Suspense fallback={<div className="route-loading">Cargando herramienta…</div>}>
                <CapabilityPage />
              </Suspense>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  )
}
