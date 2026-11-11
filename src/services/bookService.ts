import {collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

export interface Book {
  id: string;
  title: string;
  authorIds: string[];
  categoryIds?: string[];
  author?: string;
  subject?: string;
  language?: string;
  isbn: string;
  isPublished: boolean;
  coverUrl?: string;
  pdfStoragePath?: string;
  pdfUrl?: string;
  annotation?: string;
  year?: string;
  pages?: string;
  views?: number;
  reads?: number;
  favorites?: number;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

export const getBooks = async (publishedOnly: boolean = true, categoryId?: string) => {
  const path = 'books';
  try {
    const booksRef = collection(db, 'books');
    let q = query(booksRef);
    
    const constraints: any[] = [];
    if (publishedOnly) {
      constraints.push(where('isPublished', '==', true));
    }
    if (categoryId) {
      constraints.push(where('categoryIds', 'array-contains', categoryId));
    }
    
    if (constraints.length > 0) {
      q = query(booksRef, ...constraints);
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Book));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const getBooksCount = async () => {
    const path = 'books';
    try {
      const snapshot = await getCountFromServer(collection(db, 'books'));
      return snapshot.data().count;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return 0;
    }
};

export const getBook = async (id: string) => {
  const path = `books/${id}`;
  try {
    const docRef = doc(db, 'books', id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? ({id: docSnap.id, ...docSnap.data()} as Book) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const createBook = async (book: Omit<Book, 'id'>) => {
  const path = 'books';
  try {
    return await addDoc(collection(db, 'books'), book);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateBook = async (id: string, book: Partial<Book>) => {
  const path = `books/${id}`;
  try {
    await updateDoc(doc(db, 'books', id), book);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const incrementBookViews = async (id: string) => {
    const {increment} = await import('firebase/firestore');
    await updateBook(id, { views: increment(1) as any });
};

export const incrementBookReads = async (id: string) => {
    const {increment} = await import('firebase/firestore');
    await updateBook(id, { reads: increment(1) as any });
};

export const incrementBookFavorites = async (id: string, amount: number = 1) => {
    const {increment} = await import('firebase/firestore');
    await updateBook(id, { favorites: increment(amount) as any });
};

export const getBooksByCategoryCounts = async () => {
    const path = 'books';
    try {
        const snapshot = await getDocs(collection(db, 'books'));
        const counts: Record<string, number> = {};
        snapshot.forEach(doc => {
            const book = doc.data() as Book;
            const cat = book.subject || "Boshqa";
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
        return {};
    }
};

