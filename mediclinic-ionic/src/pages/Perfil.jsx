import { useNavigate } from 'react-router-dom';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonButton } from '@ionic/react';

function Perfil({ onLogout }) {
  const navigate = useNavigate();
  const sesion = JSON.parse(localStorage.getItem('ionic_sesion'));

  const handleLogout = () => {
    localStorage.removeItem('ionic_sesion');
    onLogout();
    navigate('/login');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Perfil</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Usuario: {sesion?.usuario}</IonLabel>
        </IonItem>
        <IonButton expand="block" color="danger" className="ion-margin-top" onClick={handleLogout}>
          Cerrar sesión
        </IonButton>
      </IonContent>
    </IonPage>
  );
}

export default Perfil;