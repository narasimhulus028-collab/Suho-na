import { GalleryImage } from '../types';

const DB_NAME = 'SuhonaSelfieDB';
const DB_VERSION = 1;
const STORE_NAME = 'selfie_gallery';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Save multiple selfie images to IndexedDB
 */
export async function saveSelfiesToDB(images: GalleryImage[]): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    for (const img of images) {
      store.put(img);
    }

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error saving selfies to IndexedDB:', err);
  }
}

/**
 * Load all selfie images from IndexedDB
 */
export async function loadSelfiesFromDB(): Promise<GalleryImage[]> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve((request.result || []) as GalleryImage[]);
      };
      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('Error loading selfies from IndexedDB:', err);
    return [];
  }
}

/**
 * Delete a selfie image from IndexedDB
 */
export async function deleteSelfieFromDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn('Error deleting selfie from IndexedDB:', err);
  }
}
