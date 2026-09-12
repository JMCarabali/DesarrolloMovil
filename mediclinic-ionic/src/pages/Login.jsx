import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonInput, IonButton, IonToast,
} from '@ionic/react';

const USUARIOS = [{ usuario: 'medico', password: '1234' }];

function Login({ onLogin }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarError, setMostrarError] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    const encontrado = USUARIOS.find(
      (u) => u.usuario === usuario && u.password === password
    );

    if (encontrado) {
      localStorage.setItem('ionic_sesion', JSON.stringify({ usuario }));
      onLogin();
      navigate('/app/visitas');
    } else {
      setMostrarError(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Iniciar sesión</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
  <div style={{ maxWidth: '400px', margin: '0 auto' }}>
    <IonItem>
      <IonInput
        label="Usuario"
        labelPlacement="floating"
        value={usuario}
        onIonChange={(e) => setUsuario(e.detail.value)}
      />
    </IonItem>
    <IonItem>
      <IonInput
        label="Contraseña"
        labelPlacement="floating"
        type="password"
        value={password}
        onIonChange={(e) => setPassword(e.detail.value)}
      />
    </IonItem>
    <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>
      Ingresar
    </IonButton>
  </div>

  <IonToast
    isOpen={mostrarError}
    message="Usuario o contraseña incorrectos"
    duration={2000}
    color="danger"
    onDidDismiss={() => setMostrarError(false)}
  />
</IonContent>
    </IonPage>
  );
}

export default Login;