import { useNavigate } from 'react-router-dom';
import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { addOutline, arrowBackOutline, logOutOutline } from 'ionicons/icons';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import { useNetwork } from '../hooks/useNetwork';
import './Home.css';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tasks, loading, toggleTask, deleteTask } = useTaskContext();
  const { isOnline } = useNetwork();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonButton slot="start" fill="clear" onClick={() => navigate('/dashboard')} aria-label="Volver"><IonIcon slot="icon-only" icon={arrowBackOutline} /></IonButton><IonTitle>Focus list</IonTitle><IonButton slot="end" fill="clear" onClick={handleLogout} aria-label="Cerrar sesion"><IonIcon slot="icon-only" icon={logOutOutline} /></IonButton></IonToolbar></IonHeader>
      <IonContent fullscreen>
        <main className="task-page ion-padding">
          <section className="task-intro"><p className="eyebrow">{user?.email}</p><h1>Mis tareas</h1><p className="hero-copy">Organiza tu dia en pequenos pasos.</p></section>
          <section className="list-heading"><div><h2>Lista de tareas</h2><span>{tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}</span></div><IonButton onClick={() => navigate('/tasks/new')} disabled={!isOnline}><IonIcon slot="start" icon={addOutline} />Nueva</IonButton></section>
          {!isOnline && <div className="empty-state"><h3>Sin conexión</h3><p>Las acciones de tareas requieren internet.</p></div>}{loading ? <div className="empty-state">Cargando tareas...</div> : <TaskList tasks={tasks} onToggleTask={isOnline ? toggleTask : () => {}} onDeleteTask={isOnline ? deleteTask : () => {}} onEditTask={(task) => navigate(`/tasks/${task.id}/edit`)} onOpenTask={(task) => navigate(`/tasks/${task.id}`)} />}
        </main>
      </IonContent>
    </IonPage>
  );
};

export default TasksPage;
