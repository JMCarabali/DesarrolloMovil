// src/App.jsx
import { useState, useEffect } from 'react';
import Login from './Login';
import Pacientes from './Pacientes';

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const sesion = JSON.parse(localStorage.getItem('sesion'));
    if (sesion) {
      setUsuario(sesion.usuario);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('sesion');
    setUsuario(null);
  };

  return (
    <div className="app-container">
      {usuario ? (
        <Pacientes usuario={usuario} onLogout={handleLogout} />
      ) : (
        <Login onLogin={setUsuario} />
      )}
    </div>
  );
}

export default App;