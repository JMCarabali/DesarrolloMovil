import { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import './Home.css';

const STORAGE_KEY = 'challenge-03-tasks';

const Home = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const savedTasks = localStorage.getItem(STORAGE_KEY);
    if (savedTasks) setTasks(JSON.parse(savedTasks));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (title) => {
    setTasks((currentTasks) => [
      ...currentTasks,
      { id: crypto.randomUUID(), title, completed: false },
    ]);
  };

  const toggleTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const deleteTask = (id) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar><IonTitle>Focus list</IonTitle></IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar><IonTitle size="large">Focus list</IonTitle></IonToolbar>
        </IonHeader>
        <main className="task-page ion-padding">
          <section className="task-intro">
            <p className="eyebrow">TASK MANAGER</p>
            <h1>Mis tareas</h1>
            <p className="hero-copy">Organiza tu dia en pequenos pasos.</p>
          </section>
          <TaskForm onAddTask={addTask} />
          <section className="list-heading"><h2>Lista de tareas</h2><span>{tasks.length}</span></section>
          <TaskList tasks={tasks} onToggleTask={toggleTask} onDeleteTask={deleteTask} />
        </main>
      </IonContent>
    </IonPage>
  );
};

export default Home;