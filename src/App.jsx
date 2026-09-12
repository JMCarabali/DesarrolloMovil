// src/App.jsx
import { useState, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

import Login from './pages/Login';
import List from './pages/List';

setupIonicReact();

function App() {
  const [logueado, setLogueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const logged = localStorage.getItem('logged');
    if (logged === 'true') setLogueado(true);
    setCargando(false);
  }, []);

  if (cargando) return null;

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Routes>
            <Route
              path="/login"
              element={<Login onLogin={() => setLogueado(true)} />}
            />
            <Route
              path="/list"
              element={
                logueado
                  ? <List onLogout={() => setLogueado(false)} />
                  : <Navigate to="/login" />
              }
            />
            <Route
              path="/"
              element={<Navigate to={logueado ? '/list' : '/login'} />}
            />
          </Routes>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;