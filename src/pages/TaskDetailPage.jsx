import { IonBackButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { Navigate, useParams } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import './Home.css';

const TaskDetailPage = () => {
  const { id } = useParams();
  const { tasks } = useTaskContext();
  const task = tasks.find((item) => item.id === id);
  if (!task) return <Navigate to="/tasks" replace />;

  return <IonPage><IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/tasks" /></IonButtons><IonTitle>Detalle</IonTitle></IonToolbar></IonHeader><IonContent fullscreen><main className="detail-page ion-padding"><p className="eyebrow">{task.completed ? 'COMPLETADA' : 'PENDIENTE'}</p><h1>{task.title}</h1><p className="detail-copy">{task.description || 'Esta tarea no tiene descripcion.'}</p></main></IonContent></IonPage>;
};

export default TaskDetailPage;
