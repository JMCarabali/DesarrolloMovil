import Dexie from 'dexie';

const localDb = new Dexie('challenge6-local-db');
localDb.version(1).stores({ fruits: '++id, name, createdAt' });

export default localDb;
