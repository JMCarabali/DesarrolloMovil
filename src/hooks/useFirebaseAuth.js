import { useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from '../firebase/config';

export const useFirebaseAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(auth));

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  const requireAuth = () => {
    if (!auth) {
      throw new Error('Configura las variables de Firebase para activar la autenticacion.');
    }
  };

  const login = (email, password) => {
    requireAuth();
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = (email, password) => {
    requireAuth();
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    requireAuth();
    return signOut(auth);
  };

  return { user, loading, login, register, logout };
};
