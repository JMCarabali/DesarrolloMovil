import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase/config';

export const useCollection = (table, userId) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) { setResults([]); setLoading(false); return undefined; }
    setLoading(true);
    const collectionRef = query(collection(db, table), where('userId', '==', userId));
    return onSnapshot(collectionRef, (snapshot) => {
      setResults(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })));
      setLoading(false);
    }, (snapshotError) => { setError(snapshotError.message); setLoading(false); });
  }, [table, userId]);

  const add = (data) => addDoc(collection(db, table), { ...data, userId, createdAt: serverTimestamp() });
  const update = (id, data) => updateDoc(doc(db, table, id), data);
  const remove = (id) => deleteDoc(doc(db, table, id));

  return { results, loading, error, add, update, remove };
};
