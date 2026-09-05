import { IonText } from '@ionic/react';
import TaskItem from './TaskItem';

const TaskList = ({ tasks, onToggleTask, onDeleteTask }) => {
  if (tasks.length === 0) {
    return <div className="empty-state"><span className="empty-icon">+</span><IonText><h3>Tu lista esta despejada</h3></IonText><IonText color="medium"><p>Agrega una tarea para empezar a avanzar.</p></IonText></div>;
  }

  return <div className="task-list">{tasks.map((task) => <TaskItem key={task.id} task={task} onToggle={onToggleTask} onDelete={onDeleteTask} />)}</div>;
};

export default TaskList;