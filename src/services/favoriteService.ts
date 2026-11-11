import {collection, addDoc, query, where, getDocs, deleteDoc, doc, getDoc, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';
import {incrementBookFavorites} from './bookService';

export interface Favorite {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
}

export const addFavorite = async (userId: string, bookId: string) => {
  await addDoc(collection(db, 'favorites'), {userId, bookId, createdAt: new Date().toISOString()});
  await incrementBookFavorites(bookId, 1);
};

export const removeFavorite = async (favoriteId: string) => {
  const favDoc = await getDoc(doc(db, 'favorites', favoriteId));
  if (favDoc.exists()) {
      const bookId = favDoc.data().bookId;
      await deleteDoc(doc(db, 'favorites', favoriteId));
      await incrementBookFavorites(bookId, -1);
  }
};

export const getUserFavorites = async (userId: string) => {
  const q = query(collection(db, 'favorites'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Favorite));
};

export const getTotalFavoritesCount = async () => {
    const snapshot = await getCountFromServer(collection(db, 'favorites'));
    return snapshot.data().count;
};

