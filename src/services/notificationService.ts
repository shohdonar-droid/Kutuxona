import {collection, query, where, getDocs, updateDoc, doc} from 'firebase/firestore';
import {db} from '../firebase';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'SYSTEM' | 'READING' | 'LOAN' | 'OVERDUE' | 'RESERVATION' | 'GENERAL';
  isRead: boolean;
  createdAt: string;
}

export const getUserNotifications = async (userId: string) => {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Notification));
};

export const markAsRead = async (notificationId: string) => {
  await updateDoc(doc(db, 'notifications', notificationId), {isRead: true});
};
