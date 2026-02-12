import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from './firebase';
import { TravelUpdate } from '@/types';

const UPDATES_COLLECTION = 'travelUpdates';

const getFirestoreOrThrow = () => {
  if (!isFirebaseConfigured || !db) {
    throw new Error('Firebase is not configured');
  }
  return db;
};

const getStorageOrThrow = () => {
  if (!isFirebaseConfigured || !storage) {
    throw new Error('Firebase is not configured');
  }
  return storage;
};

// Ajouter une nouvelle mise à jour
export async function addTravelUpdate(
  update: Omit<TravelUpdate, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const firestore = getFirestoreOrThrow();
    const docRef = await addDoc(collection(firestore, UPDATES_COLLECTION), {
      ...update,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding travel update:', error);
    throw error;
  }
}

// Récupérer toutes les mises à jour
export async function getTravelUpdates(): Promise<TravelUpdate[]> {
  try {
    if (!isFirebaseConfigured || !db) {
      return [];
    }
    const q = query(
      collection(db, UPDATES_COLLECTION),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date,
        createdAt: data.createdAt.toDate().toISOString(),
      } as TravelUpdate;
    });
  } catch (error) {
    console.error('Error getting travel updates:', error);
    throw error;
  }
}

// Upload une photo et retourner l'URL
export async function uploadPhoto(file: File, updateId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const firebaseStorage = getStorageOrThrow();
    const storageRef = ref(firebaseStorage, `photos/${updateId}/${timestamp}_${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
}

// Upload plusieurs photos
export async function uploadPhotos(files: File[], updateId: string): Promise<string[]> {
  try {
    const uploadPromises = files.map((file) => uploadPhoto(file, updateId));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading photos:', error);
    throw error;
  }
}
