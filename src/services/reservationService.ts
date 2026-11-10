import {collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy} from 'firebase/firestore';
import {db} from '../firebase';

export interface Reservation {
  id: string;
  userId: string;
  bookId: string;
  status: 'PENDING' | 'READY' | 'FULFILLED' | 'CANCELLED' | 'EXPIRED';
  createdAt: string;
  expiresAt?: string;
}

export const createReservation = async (reservation: Omit<Reservation, 'id' | 'createdAt' | 'status'>) => {
  return await addDoc(collection(db, 'reservations'), {
    ...reservation,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  });
};

export const getReservations = async (userId?: string) => {
  const reservationsRef = collection(db, 'reservations');
  const q = userId 
    ? query(reservationsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'))
    : query(reservationsRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Reservation));
};

export const updateReservationStatus = async (id: string, status: Reservation['status'], data: Partial<Reservation> = {}) => {
  await updateDoc(doc(db, 'reservations', id), {status, ...data});
};
