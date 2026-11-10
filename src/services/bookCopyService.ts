import {collection, addDoc, query, where, getDocs, updateDoc, doc, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';

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
  return await addDoc(collection(db, 'bookCopies'), copy);
};

export const getBookCopies = async (bookId: string) => {
  const q = query(collection(db, 'bookCopies'), where('bookId', '==', bookId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as BookCopy));
};

export const updateBookCopyStatus = async (copyId: string, status: BookCopy['status']) => {
  await updateDoc(doc(db, 'bookCopies', copyId), {status});
};

export const getBookCopyStats = async () => {
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
};
export const getBookCopiesCount = async (bookId: string) => {
    const q = query(collection(db, 'bookCopies'), where('bookId', '==', bookId));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
};

export const createBookCopies = async (bookId: string, count: number, prefix: string) => {
    const promises = [];
    for (let i = 1; i <= count; i++) {
        const inventoryId = `${prefix}-${String(i).padStart(3, '0')}`;
        promises.push(addDoc(collection(db, 'bookCopies'), {
            bookId,
            inventoryId,
            barcode: inventoryId,
            qrCode: inventoryId,
            status: 'AVAILABLE'
        }));
    }
    return await Promise.all(promises);
};

export const getBookAvailability = async (bookId: string) => {
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
};
