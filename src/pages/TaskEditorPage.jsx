import { useEffect, useState } from 'react';
import { IonBackButton, IonButton, IonButtons, IonContent, IonHeader, IonInput, IonPage, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { IonText } from '@ionic/react';
import { useTaskContext } from '../context/TaskContext';
import './Home.css';

const TaskEditorPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { tasks, addTask, updateTask } = useTaskContext();
  const isCreating = location.pathname.endsWith('/new');
  const editingTask = tasks.find((task) => task.id === id);
  const [title, setTitle] = useState(editingTask?.title || '');
  const [description, setDescription] = useState(editingTask?.description || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description || '');
    }
  }, [editingTask]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    setError('');
    try {
      if (isCreating) await addTask(cleanTitle, description.trim());
      else if (id) await updateTask(id, { title: cleanTitle, description: description.trim() });
      else throw new Error('No se encontro la tarea que quieres editar.');
      navigate('/tasks', { replace: true });
    } catch (saveError) {
      setError(saveError.code === 'permission-denied' ? 'Firebase rechazo la operacion. Revisa las reglas de Firestore.' : saveError.message);
    }
  };

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonButtons slot="start"><IonBackButton defaultHref="/tasks" /></IonButtons><IonTitle>{isCreating ? 'Nueva tarea' : 'Editar tarea'}</IonTitle></IonToolbar></IonHeader>
      <IonContent fullscreen><main className="editor-page ion-padding"><form className="editor-form" onSubmit={handleSubmit}><IonInput label="Titulo" labelPlacement="stacked" value={title} onIonInput={(event) => setTitle(event.detail.value ?? '')} maxlength="80" required /><IonTextarea label="Descripcion" labelPlacement="stacked" value={description} onIonInput={(event) => setDescription(event.detail.value ?? '')} autoGrow />{error && <IonText color="danger"><p className="form-error">{error}</p></IonText>}<IonButton type="submit" expand="block">Guardar tarea</IonButton></form></main></IonContent>
    </IonPage>
  );
};

export default TaskEditorPage;
