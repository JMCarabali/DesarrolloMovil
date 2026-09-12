import { Navigate, Route, Routes } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { useState, useEffect } from 'react';

import Login from './pages/Login';
import TabsLayout from './pages/TabsLayout';

setupIonicReact();

function App() {
  const [logueado, setLogueado] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const sesion = JSON.parse(localStorage.getItem('ionic_sesion'));
    if (sesion) setLogueado(true);
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
              path="/app/*"
              element={
                logueado ? (
                  <TabsLayout onLogout={() => setLogueado(false)} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            <Route
              path="/"
              element={<Navigate to={logueado ? '/app/visitas' : '/login'} />}
            />
          </Routes>
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}

export default App;