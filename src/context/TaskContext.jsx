import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';
import { useTasks } from '../hooks/useTasks';

const TaskContext = createContext(null);

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const taskState = useTasks(user?.uid);
  return <TaskContext.Provider value={taskState}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error('useTaskContext debe usarse dentro de TaskProvider.');
  return context;
};
