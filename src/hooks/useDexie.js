import { useLiveQuery } from 'dexie-react-hooks';
import localDb from '../data/localDb';

export const useDexie = () => {
  const fruits = useLiveQuery(() => localDb.fruits.orderBy('createdAt').reverse().toArray(), [], []);

  const addFruit = (name) => localDb.fruits.add({ name: name.trim(), createdAt: Date.now() });
  const updateFruit = (id, name) => localDb.fruits.update(id, { name: name.trim() });
  const deleteFruit = (id) => localDb.fruits.delete(id);

  return { fruits, addFruit, updateFruit, deleteFruit };
};
