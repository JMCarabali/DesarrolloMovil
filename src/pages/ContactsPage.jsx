import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { addOutline, arrowBackOutline, trashOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollection } from '../hooks/useCollection';
import { useNetwork } from '../hooks/useNetwork';
import './Home.css';

const ContactsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const { results, loading, error, remove } = useCollection('contacts', user?.uid);

  return <IonPage><IonHeader><IonToolbar><IonButton slot="start" fill="clear" onClick={() => navigate('/dashboard')} aria-label="Volver"><IonIcon slot="icon-only" icon={arrowBackOutline} /></IonButton><IonTitle>Contactos</IonTitle><IonButton slot="end" fill="clear" onClick={() => navigate('/contacts/new')} disabled={!isOnline} aria-label="Nuevo contacto"><IonIcon slot="icon-only" icon={addOutline} /></IonButton></IonToolbar></IonHeader><IonContent fullscreen><main className="task-page ion-padding"><section className="task-intro"><p className="eyebrow">FIRESTORE</p><h1>Mis contactos</h1><p className="hero-copy">Tus contactos sincronizados en la nube.</p></section><IonButton expand="block" onClick={() => navigate('/contacts/new')} disabled={!isOnline}><IonIcon slot="start" icon={addOutline} />Nuevo contacto</IonButton>{error && <p className="form-error">{error}</p>}{loading ? <div className="empty-state">Cargando contactos...</div> : <IonList inset>{results.length === 0 ? <IonItem><IonLabel>No hay contactos todavía.</IonLabel></IonItem> : results.map((contact) => <IonItem key={contact.id}><IonLabel><h2>{contact.nombre}</h2><p>{contact.telefono}</p></IonLabel><IonButton fill="clear" color="danger" onClick={() => remove(contact.id)} disabled={!isOnline} aria-label={`Eliminar ${contact.nombre}`}><IonIcon slot="icon-only" icon={trashOutline} /></IonButton></IonItem>)}</IonList>}</main></IonContent></IonPage>;
};

export default ContactsPage;
