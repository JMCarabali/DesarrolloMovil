import { useState } from 'react';
import { IonButton, IonContent, IonInput, IonPage, IonText } from '@ionic/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const AuthPage = ({ mode }) => {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await (isRegister ? register(email, password) : login(email, password));
      navigate(location.state?.from || '/tasks', { replace: true });
    } catch (authError) {
      setError(authError.code === 'auth/invalid-credential' ? 'El correo o la contrasena no son validos.' : authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="auth-page">
          <section className="auth-panel">
            <p className="eyebrow">FOCUS LIST / CHALLENGE 05</p>
            <h1>{isRegister ? 'Crea tu cuenta' : 'Vuelve a tus tareas'}</h1>
            <p className="hero-copy">Organiza lo importante y avanza con claridad.</p>
            <form className="auth-form" onSubmit={handleSubmit}>
              <IonInput label="Correo electronico" labelPlacement="stacked" type="email" value={email} onIonInput={(event) => setEmail(event.detail.value ?? '')} required />
              <IonInput label="Contrasena" labelPlacement="stacked" type="password" value={password} onIonInput={(event) => setPassword(event.detail.value ?? '')} minlength="6" required />
              {error && <IonText color="danger"><p className="form-error">{error}</p></IonText>}
              <IonButton type="submit" expand="block" disabled={submitting}>{submitting ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesion'}</IonButton>
            </form>
            <p className="auth-switch">{isRegister ? 'Ya tienes una cuenta?' : 'Aun no tienes cuenta?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Inicia sesion' : 'Registrate'}</Link></p>
          </section>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
