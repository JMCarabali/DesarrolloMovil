import { useNavigate } from 'react-router-dom';
import { IonButton, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { addOutline, logOutOutline } from 'ionicons/icons';
import TaskList from '../components/TaskList';
import { useAuth } from '../context/AuthContext';
import { useTaskContext } from '../context/TaskContext';
import './Home.css';

const TasksPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { tasks, loading, toggleTask, deleteTask } = useTaskContext();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>Focus list</IonTitle><IonButton slot="end" fill="clear" onClick={handleLogout} aria-label="Cerrar sesion"><IonIcon slot="icon-only" icon={logOutOutline} /></IonButton></IonToolbar></IonHeader>
      <IonContent fullscreen>
        <main className="task-page ion-padding">
          <section className="task-intro"><p className="eyebrow">{user?.email}</p><h1>Mis tareas</h1><p className="hero-copy">Organiza tu dia en pequenos pasos.</p></section>
          <section className="list-heading"><div><h2>Lista de tareas</h2><span>{tasks.length} {tasks.length === 1 ? 'tarea' : 'tareas'}</span></div><IonButton onClick={() => navigate('/tasks/new')}><IonIcon slot="start" icon={addOutline} />Nueva</IonButton></section>
          {loading ? <div className="empty-state">Cargando tareas...</div> : <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} onEditTask={(task) => navigate(`/tasks/${task.id}/edit`)} onOpenTask={(task) => navigate(`/tasks/${task.id}`)} />}
        </main>
      </IonContent>
    </IonPage>
  );
};

export default TasksPage;
