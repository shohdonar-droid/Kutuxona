import {collection, addDoc, query, where, getDocs, updateDoc, doc, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

export interface BookCopy {
  id: string;
  bookId: string;
  inventoryId: string;
  barcode: string;
  qrCode: string;
  status: 'AVAILABLE' | 'BORROWED' | 'RESERVED' | 'OVERDUE' | 'LOST' | 'DAMAGED' | 'REPAIR' | 'WRITTEN_OFF';
  location?: string;
  condition?: string;
}

export const createBookCopy = async (copy: Omit<BookCopy, 'id'>) => {
  const path = 'bookCopies';
  try {
    return await addDoc(collection(db, 'bookCopies'), copy);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const getBookCopies = async (bookId: string) => {
  const path = 'bookCopies';
  try {
    const q = query(collection(db, 'bookCopies'), where('bookId', '==', bookId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as BookCopy));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const updateBookCopyStatus = async (copyId: string, status: BookCopy['status']) => {
  const path = `bookCopies/${copyId}`;
  try {
    await updateDoc(doc(db, 'bookCopies', copyId), {status});
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getBookCopyStats = async () => {
  const path = 'bookCopies';
  try {
    const snapshot = await getDocs(collection(db, 'bookCopies'));
    const stats = {total: 0, available: 0, borrowed: 0, overdue: 0, damaged: 0, lost: 0, repair: 0};
    snapshot.forEach(doc => {
      const copy = doc.data() as BookCopy;
      stats.total++;
      if (copy.status === 'AVAILABLE') stats.available++;
      else if (copy.status === 'BORROWED') stats.borrowed++;
      else if (copy.status === 'OVERDUE') stats.overdue++;
      else if (copy.status === 'DAMAGED') stats.damaged++;
      else if (copy.status === 'LOST') stats.lost++;
      else if (copy.status === 'REPAIR') stats.repair++;
    });
    return stats;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return {total: 0, available: 0, borrowed: 0, overdue: 0, damaged: 0, lost: 0, repair: 0};
  }
};
export const getBookCopiesCount = async (bookId: string) => {
    const path = 'bookCopies';
    try {
      const q = query(collection(db, 'bookCopies'), where('bookId', '==', bookId));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return 0;
    }
};

export const createBookCopies = async (bookId: string, count: number, prefix: string) => {
    if (count <= 0) return [];
    const { writeBatch } = await import('firebase/firestore');
    const cleanPrefix = (prefix || 'BK').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 5) || 'BK';
    
    // Batch writes into chunks of 400 (Firestore limit is 500 per batch)
    const BATCH_SIZE = 400;
    const totalBatches = Math.ceil(count / BATCH_SIZE);
    let created = 0;

    for (let b = 0; b < totalBatches; b++) {
        const batch = writeBatch(db);
        const batchCount = Math.min(BATCH_SIZE, count - created);
        
        for (let i = 1; i <= batchCount; i++) {
            const index = created + i;
            const inventoryId = `${cleanPrefix}-${String(index).padStart(4, '0')}`;
            const copyDocRef = doc(collection(db, 'bookCopies'));
            batch.set(copyDocRef, {
                bookId,
                inventoryId,
                barcode: inventoryId,
                qrCode: inventoryId,
                status: 'AVAILABLE'
            });
        }
        await batch.commit();
        created += batchCount;
    }
    return created;
};

export const getBookAvailability = async (bookId: string) => {
    const path = 'bookCopies';
    try {
      const allQ = query(collection(db, 'bookCopies'), where('bookId', '==', bookId));
      const availableQ = query(collection(db, 'bookCopies'), where('bookId', '==', bookId), where('status', '==', 'AVAILABLE'));
      
      const [allSnapshot, availableSnapshot] = await Promise.all([
          getCountFromServer(allQ),
          getCountFromServer(availableQ)
      ]);
      
      return {
          total: allSnapshot.data().count,
          available: availableSnapshot.data().count
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return { total: 0, available: 0 };
    }
};
