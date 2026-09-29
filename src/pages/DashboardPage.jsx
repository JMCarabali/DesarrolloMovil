import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { callOutline, leafOutline, logOutOutline, checkboxOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NetworkStatus from '../components/NetworkStatus';
import { useNetwork } from '../hooks/useNetwork';
import './Home.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isOnline } = useNetwork();
  return <IonPage><IonHeader><IonToolbar><IonTitle>Challenge 06</IonTitle><IonButton slot="end" fill="clear" onClick={async () => { await logout(); navigate('/login', { replace: true }); }} aria-label="Cerrar sesión"><IonIcon slot="icon-only" icon={logOutOutline} /></IonButton></IonToolbar></IonHeader><IonContent fullscreen><main className="task-page ion-padding"><section className="task-intro"><p className="eyebrow">{user?.email}</p><h1>Tu espacio</h1><p className="hero-copy">Cloud, realtime y offline en una sola app.</p></section><NetworkStatus /><div className="dashboard-grid"><IonButton className="dashboard-card" expand="block" onClick={() => navigate('/contacts')} disabled={!isOnline}><IonIcon slot="start" icon={callOutline} />Contactos<small>Firestore</small></IonButton><IonButton className="dashboard-card" expand="block" onClick={() => navigate('/tasks')} disabled={!isOnline}><IonIcon slot="start" icon={checkboxOutline} />Tareas<small>Realtime Database</small></IonButton><IonButton className="dashboard-card" expand="block" onClick={() => navigate('/fruits')}><IonIcon slot="start" icon={leafOutline} />Frutas<small>Dexie local</small></IonButton></div></main></IonContent></IonPage>;
};

export default DashboardPage;
