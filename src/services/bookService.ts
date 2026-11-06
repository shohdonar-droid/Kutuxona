import {collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where} from 'firebase/firestore';
import {db} from '../firebase';

export interface Book {
  id: string;
  title: string;
  authorIds: string[];
  isbn: string;
  isPublished: boolean;
  coverUrl?: string;
  pdfStoragePath?: string;
  annotation?: string;
}

export const getBooks = async (publishedOnly: boolean = true) => {
  const booksRef = collection(db, 'books');
  let q = query(booksRef);
  if (publishedOnly) {
    q = query(booksRef, where('isPublished', '==', true));
  }
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Book));
};

export const getBook = async (id: string) => {
  const docRef = doc(db, 'books', id);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({id: docSnap.id, ...docSnap.data()} as Book) : null;
};

export const createBook = async (book: Omit<Book, 'id'>) => {
  return await addDoc(collection(db, 'books'), book);
};

export const updateBook = async (id: string, book: Partial<Book>) => {
  await updateDoc(doc(db, 'books', id), book);
};
