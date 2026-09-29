import { useState } from 'react';
import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonList, IonPage, IonText, IonTitle, IonToolbar } from '@ionic/react';
import { addOutline, arrowBackOutline, createOutline, trashOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { useDexie } from '../hooks/useDexie';
import './Home.css';

const FruitsPage = () => {
  const navigate = useNavigate();
  const { fruits, addFruit, updateFruit, deleteFruit } = useDexie();
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const save = async () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    if (editingId) await updateFruit(editingId, cleanName); else await addFruit(cleanName);
    setName(''); setEditingId(null);
  };

  return <IonPage><IonHeader><IonToolbar><IonButton slot="start" fill="clear" onClick={() => navigate('/dashboard')} aria-label="Volver"><IonIcon slot="icon-only" icon={arrowBackOutline} /></IonButton><IonTitle>Frutas</IonTitle></IonToolbar></IonHeader><IonContent fullscreen><main className="task-page ion-padding"><section className="task-intro"><p className="eyebrow">DEXIE / OFFLINE</p><h1>Frutas</h1><p className="hero-copy">Datos locales que se actualizan al instante.</p></section><div className="task-form"><IonInput className="task-input" label="Nombre de la fruta" labelPlacement="stacked" value={name} onIonInput={(event) => setName(event.detail.value ?? '')} placeholder="Ej. Mango" /><IonButton onClick={save} aria-label={editingId ? 'Actualizar fruta' : 'Agregar fruta'}><IonIcon slot="icon-only" icon={editingId ? createOutline : addOutline} /></IonButton></div><IonList inset>{fruits.length === 0 ? <IonItem><IonLabel>No hay frutas todavía.</IonLabel></IonItem> : fruits.map((fruit) => <IonItem key={fruit.id}><IonLabel>{fruit.name}</IonLabel><IonButton fill="clear" onClick={() => { setEditingId(fruit.id); setName(fruit.name); }} aria-label={`Editar ${fruit.name}`}><IonIcon slot="icon-only" icon={createOutline} /></IonButton><IonButton fill="clear" color="danger" onClick={() => deleteFruit(fruit.id)} aria-label={`Eliminar ${fruit.name}`}><IonIcon slot="icon-only" icon={trashOutline} /></IonButton></IonItem>)}</IonList><IonText color="medium"><p>Las frutas funcionan sin conexión.</p></IonText></main></IonContent></IonPage>;
};

export default FruitsPage;
