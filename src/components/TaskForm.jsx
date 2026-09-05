import { useState } from 'react';
import { IonButton, IonIcon, IonInput } from '@ionic/react';
import { addOutline } from 'ionicons/icons';

const TaskForm = ({ onAddTask }) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    onAddTask(cleanTitle);
    setTitle('');
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <IonInput className="task-input" label="Nueva tarea" labelPlacement="stacked" placeholder="Ej. Preparar la presentacion" value={title} onIonInput={(event) => setTitle(event.detail.value ?? '')} maxlength={80} />
      <IonButton type="submit" aria-label="Agregar tarea"><IonIcon slot="icon-only" icon={addOutline} /></IonButton>
    </form>
  );
};

export default TaskForm;