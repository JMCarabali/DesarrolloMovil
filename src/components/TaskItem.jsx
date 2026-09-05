import { IonButton, IonIcon, IonItem, IonLabel, IonRippleEffect } from '@ionic/react';
import { trashOutline } from 'ionicons/icons';

const TaskItem = ({ task, onToggle, onDelete }) => (
  <IonItem className={`task-item ${task.completed ? 'is-complete' : ''}`} lines="none">
    <button className="task-check ion-activatable" type="button" onClick={() => onToggle(task.id)} aria-label={`Marcar ${task.title}`}>
      {task.completed ? '✓' : ''}<IonRippleEffect />
    </button>
    <IonLabel onClick={() => onToggle(task.id)}><h3>{task.title}</h3><p>{task.completed ? 'Completada' : 'Pendiente'}</p></IonLabel>
    <IonButton fill="clear" color="medium" onClick={() => onDelete(task.id)} aria-label={`Eliminar ${task.title}`}><IonIcon slot="icon-only" icon={trashOutline} /></IonButton>
  </IonItem>
);

export default TaskItem;