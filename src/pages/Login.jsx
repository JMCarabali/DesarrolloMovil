// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonInput, IonButton, IonToast } from '@ionic/react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarError, setMostrarError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    if (email === 'user@mail.com' && password === '123') {
      localStorage.setItem('logged', 'true');
      onLogin();
      navigate('/list');
    } else {
      setMostrarError(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Demo Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonInput
            label="Email"
            labelPlacement="floating"
            type="email"
            value={email}
            onIonInput={(e) => setEmail(e.detail.value)}
          />
        </IonItem>
        <IonItem>
          <IonInput
            label="Password"
            labelPlacement="floating"
            type="password"
            value={password}
            onIonInput={(e) => setPassword(e.detail.value)}
          />
        </IonItem>
        <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>
          Ingresar
        </IonButton>

        <IonToast
          isOpen={mostrarError}
          message="Credenciales incorrectas"
          duration={2000}
          color="danger"
          onDidDismiss={() => setMostrarError(false)}
        />
      </IonContent>
    </IonPage>
  );
}

export default Login;