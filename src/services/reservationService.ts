import {collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  status: 'PENDING' | 'READY' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt?: string;
}

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
  const path = 'reservations';
  try {
    return await addDoc(collection(db, 'reservations'), {
      ...reservation,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const getReservations = async (userId?: string) => {
  const path = 'reservations';
  try {
    const reservationsRef = collection(db, 'reservations');
    const q = userId 
      ? query(reservationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
      : query(reservationsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Reservation));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateReservationStatus = async (id: string, status: Reservation['status'], data: Partial<Reservation> = {}) => {
  const path = `reservations/${id}`;
  try {
    await updateDoc(doc(db, 'reservations', id), {status, ...data});
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
