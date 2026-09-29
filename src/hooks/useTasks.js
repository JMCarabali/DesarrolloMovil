import { useEffect, useState } from 'react';

const storageKey = (userId) => `challenge-05-tasks-${userId}`;

export const useTasks = (userId) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));

  useEffect(() => {
    if (!userId) {
      setTasks([]);
      setLoading(false);
      return undefined;
    }

    const saved = localStorage.getItem(storageKey(userId));
    setTasks(saved ? JSON.parse(saved) : []);
    setLoading(false);
    return undefined;
  }, [userId]);

  const saveLocal = (nextTasks) => {
    setTasks(nextTasks);
    if (userId) localStorage.setItem(storageKey(userId), JSON.stringify(nextTasks));
  };

  const addTask = async (title, description = '') => {
    if (!userId) throw new Error('Debes iniciar sesion para crear tareas.');
    const task = { title, description, completed: false, userId, createdAt: Date.now() };
    saveLocal([{ id: crypto.randomUUID(), ...task }, ...tasks]);
  };

  const updateTask = async (id, changes) => {
    if (!id) throw new Error('No se encontro el identificador de la tarea.');
    saveLocal(tasks.map((task) => task.id === id ? { ...task, ...changes } : task));
  };

  const deleteTask = async (id) => {
    if (!id) throw new Error('No se encontro el identificador de la tarea.');
    saveLocal(tasks.filter((task) => task.id !== id));
  };

  const toggleTask = (task) => updateTask(task.id, { completed: !task.completed });

  return { tasks, loading, addTask, updateTask, deleteTask, toggleTask };
};
