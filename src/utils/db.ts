import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'TrustChainOfflineDB';
const STORE_NAME = 'pending_sync';

export async function initOfflineDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function savePendingSync(data: any) {
  const db = await initOfflineDB();
  await db.put(STORE_NAME, data);
}

export async function getPendingSyncs() {
  const db = await initOfflineDB();
  return db.getAll(STORE_NAME);
}

export async function removePendingSync(id: string | number) {
  const db = await initOfflineDB();
  await db.delete(STORE_NAME, id);
}

export async function clearPendingSyncs() {
  const db = await initOfflineDB();
  await db.clear(STORE_NAME);
}
