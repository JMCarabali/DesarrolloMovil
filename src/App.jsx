import { Navigate, Route } from 'react-router-dom'
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { AuthProvider } from './context/AuthContext'
import { WalksProvider } from './context/WalksContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { LoginPage } from './pages/Login/LoginPage'
import { HomePage } from './pages/Home/HomePage'
import { HistoryPage } from './pages/History/HistoryPage'
import { ProfilePage } from './pages/Profile/ProfilePage'

setupIonicReact()

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <AuthProvider>
          <WalksProvider>
            <IonRouterOutlet animated={false}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/tabs/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/tabs/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/tabs/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/" element={<Navigate to="/tabs/home" replace />} />
              <Route path="*" element={<Navigate to="/tabs/home" replace />} />
            </IonRouterOutlet>
          </WalksProvider>
        </AuthProvider>
      </IonReactRouter>
    </IonApp>
  )
}
