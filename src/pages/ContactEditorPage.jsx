import { useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonList, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCollection } from '../hooks/useCollection';
import { useNetwork } from '../hooks/useNetwork';
import './Home.css';

const ContactEditorPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isOnline } = useNetwork();
  const { add } = useCollection('contacts', user?.uid);
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!isOnline) return setError('Necesitas conexión para guardar contactos.');
    if (!nombre.trim() || !telefono.trim()) return setError('Completa nombre y teléfono.');
    try { await add({ nombre: nombre.trim(), telefono: telefono.trim() }); navigate('/contacts'); } catch (saveError) { setError(saveError.message); }
  };

  return <IonPage><IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/contacts" /></IonButtons><IonTitle>Nuevo contacto</IonTitle></IonToolbar></IonHeader><IonContent fullscreen><main className="editor-page ion-padding"><form className="editor-form" onSubmit={handleSubmit}><IonList><IonItem><IonInput label="Nombre" labelPlacement="stacked" value={nombre} onIonInput={(event) => setNombre(event.detail.value ?? '')} required /></IonItem><IonItem><IonInput label="Teléfono" labelPlacement="stacked" type="tel" value={telefono} onIonInput={(event) => setTelefono(event.detail.value ?? '')} required /></IonItem></IonList>{error && <IonText color="danger"><p className="form-error">{error}</p></IonText>}<IonButton type="submit" expand="block" disabled={!isOnline}>Guardar contacto</IonButton></form></main></IonContent></IonPage>;
};

export default ContactEditorPage;
