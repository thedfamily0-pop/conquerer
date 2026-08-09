/**
 * IndexedDB Offline Storage Engine for Loadshedding & Offline Mode
 */

const DB_NAME = 'ExplorerOfflineDB';
const DB_VERSION = 1;

export interface OfflineSyncItem {
  id: string;
  type: 'XP_GAIN' | 'MOOD_CHECKIN' | 'HOMEWORK_STEP';
  payload: Record<string, unknown>;
  timestamp: string;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported in this browser'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('questions')) {
        db.createObjectStore('questions', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('stories')) {
        db.createObjectStore('stories', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('userState')) {
        db.createObjectStore('userState', { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('pendingSync')) {
        db.createObjectStore('pendingSync', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveOfflineItem<T>(storeName: string, item: T): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    store.put(item);
    return new Promise((res) => {
      tx.oncomplete = () => res();
    });
  } catch (err) {
    console.warn(`IndexedDB save failed for ${storeName}:`, err);
  }
}

export async function getOfflineItems<T>(storeName: string): Promise<T[]> {
  try {
    const db = await openDatabase();
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function queueOfflineSync(type: OfflineSyncItem['type'], payload: Record<string, unknown>): Promise<void> {
  const syncItem: OfflineSyncItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    payload,
    timestamp: new Date().toISOString()
  };
  await saveOfflineItem('pendingSync', syncItem);
}
