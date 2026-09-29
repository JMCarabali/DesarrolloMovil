import { createContext, useContext } from 'react';
import { useFirebaseAuth } from '../hooks/useFirebaseAuth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={useFirebaseAuth()}>{children}</AuthContext.Provider>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider.');
  return context;
};
