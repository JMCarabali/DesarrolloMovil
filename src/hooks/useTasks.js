import { useEffect, useState } from 'react';
import { onValue, push, ref, remove, set } from 'firebase/database';
import { realtimeDb } from '../firebase/config';

export const useTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return undefined;
    }

    setLoading(true);
    setError(null);
    const tasksRef = ref(realtimeDb, `tasks/${userId}`);
    return onValue(tasksRef, (snapshot) => {
      const value = snapshot.val() || {};
      setTasks(Object.entries(value).map(([id, task]) => ({ id, ...task })).sort((a, b) => b.createdAt - a.createdAt));
      setLoading(false);
    }, (snapshotError) => {
      setError(snapshotError.message);
      setLoading(false);
    });
  }, [userId]);

  const addTask = async (title, description = '') => {
    if (!userId) throw new Error('Debes iniciar sesion para crear tareas.');
    const taskRef = push(ref(realtimeDb, `tasks/${userId}`));
    await set(taskRef, { title, description, completed: false, userId, createdAt: Date.now() });
  };

  const updateTask = async (id, changes) => {
    if (!id) throw new Error('No se encontro el identificador de la tarea.');
    await set(ref(realtimeDb, `tasks/${userId}/${id}`), { ...tasks.find((task) => task.id === id), ...changes, userId });
  };

  const deleteTask = async (id) => {
    if (!id) throw new Error('No se encontro el identificador de la tarea.');
    await remove(ref(realtimeDb, `tasks/${userId}/${id}`));
  };

  const toggleTask = (id) => {
    const task = tasks.find((item) => item.id === id);
    if (!task) throw new Error('No se encontro la tarea que quieres actualizar.');
    return updateTask(id, { completed: !task.completed });
  };

  return { tasks, loading, error, addTask, updateTask, deleteTask, toggleTask };
};
