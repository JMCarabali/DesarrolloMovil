import { Navigate } from 'react-router-dom'
import { IonLoading } from '@ionic/react'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) return <IonLoading isOpen message="Preparando tu espacio..." />
  if (!user) return <Navigate to="/login" replace />
  return children
}
