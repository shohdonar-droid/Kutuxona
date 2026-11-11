import {doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';
import {incrementBookReads} from './bookService';

export const MIN_READING_SECONDS = 30;
export const MIN_PROGRESS_PERCENT = 5;

export interface ReadingProgress {
  id: string;
  userId: string;
  bookId: string;
  currentPage: number;
  progressPercent: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastReadAt: string;
}

export interface ReadingSession {
  id: string;
  userId: string;
  bookId: string;
  durationSeconds: number;
  startedAt: any;
}

export const getReadingProgresses = async (userId: string) => {
  const q = query(collection(db, 'readingProgress'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as ReadingProgress));
};

export const getReadingSessions = async (userId: string) => {
  const q = query(collection(db, 'readingSessions'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as ReadingSession));
};

export const getReadingProgress = async (userId: string, bookId: string) => {
  const q = query(collection(db, 'readingProgress'), where('userId', '==', userId), where('bookId', '==', bookId));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : {id: snapshot.docs[0].id, ...snapshot.docs[0].data()} as ReadingProgress & {id: string};
};

export const updateReadingProgress = async (userId: string, bookId: string, data: Partial<ReadingProgress>) => {
  const existing = await getReadingProgress(userId, bookId);
  if (existing) {
    await updateDoc(doc(db, 'readingProgress', existing.id), {...data, lastReadAt: new Date().toISOString()});
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED') {
        await incrementBookReads(bookId);
    }
  } else {
    await addDoc(collection(db, 'readingProgress'), {userId, bookId, ...data, lastReadAt: new Date().toISOString()});
    if (data.status === 'COMPLETED') {
        await incrementBookReads(bookId);
    }
  }
};

export const getTotalReadsCount = async () => {
    const snapshot = await getCountFromServer(collection(db, 'readingProgress'));
    return snapshot.data().count;
};

export const getTotalReadingSessionsCount = async () => {
    const snapshot = await getCountFromServer(collection(db, 'readingSessions'));
    return snapshot.data().count;
};

