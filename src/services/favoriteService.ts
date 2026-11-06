import {collection, addDoc, query, where, getDocs, deleteDoc, doc} from 'firebase/firestore';
import {db} from '../firebase';

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

export const addFavorite = async (userId: string, bookId: string) => {
  await addDoc(collection(db, 'favorites'), {userId, bookId, createdAt: new Date().toISOString()});
};

export const removeFavorite = async (favoriteId: string) => {
  await deleteDoc(doc(db, 'favorites', favoriteId));
};

export const getUserFavorites = async (userId: string) => {
  const q = query(collection(db, 'favorites'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Favorite));
};
