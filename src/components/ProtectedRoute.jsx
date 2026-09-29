import { Navigate } from 'react-router-dom';
import { IonSpinner } from '@ionic/react';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loading"><IonSpinner name="crescent" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
