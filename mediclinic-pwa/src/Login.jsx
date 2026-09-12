// src/Login.jsx
import { useState } from 'react';

const USUARIOS = [
  { usuario: 'admin', password: '1234' },
  { usuario: 'doctor', password: 'abcd' },
];

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    const encontrado = USUARIOS.find(
      (u) => u.usuario === usuario && u.password === password
    );

    if (encontrado) {
      localStorage.setItem('sesion', JSON.stringify({ usuario }));
      setError('');
      onLogin(usuario);
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="card">
      <h3>Iniciar sesión</h3>
      <input
        className="form-input"
        placeholder="Usuario"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
      />
      <input
        className="form-input"
        placeholder="Contraseña"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btn" onClick={handleSubmit}>
        Ingresar
      </button>
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export default Login;