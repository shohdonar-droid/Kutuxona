import {collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, runTransaction, Transaction} from 'firebase/firestore';
import {db} from '../firebase';
import {updateBookCopyStatus} from './bookCopyService';

export interface Loan {
  id: string;
  studentId: string;
  studentGroupId: string;
  bookId: string;
  copyId: string;
  inventoryId: string;
  issuedAt: any;
  dueAt: any;
  status: 'ACTIVE' | 'RETURNED' | 'OVERDUE' | 'LOST' | 'DAMAGED';
}

export const issueBook = async (loan: Omit<Loan, 'id' | 'issuedAt' | 'status'>) => {
  return await runTransaction(db, async (transaction: Transaction) => {
    const copyRef = doc(db, 'bookCopies', loan.copyId);
    const copyDoc = await transaction.get(copyRef);
    if (!copyDoc.exists() || copyDoc.data().status !== 'AVAILABLE') {
      throw new Error('Kitob berish uchun mavjud emas.');
    }

    const loanRef = doc(collection(db, 'loans'));
    transaction.set(loanRef, {
      ...loan,
      issuedAt: serverTimestamp(),
      status: 'ACTIVE'
    });
    transaction.update(copyRef, { status: 'BORROWED' });
    return loanRef.id;
  });
};

export const returnBook = async (loanId: string, copyId: string, status: Loan['status'], bookId: string) => {
  return await runTransaction(db, async (transaction: Transaction) => {
    const loanRef = doc(db, 'loans', loanId);
    const copyRef = doc(db, 'bookCopies', copyId);
    
    transaction.update(loanRef, {
      status: status === 'ACTIVE' ? 'RETURNED' : status,
      returnedAt: serverTimestamp()
    });
    
    const copyStatus = status === 'ACTIVE' ? 'AVAILABLE' : status;
    transaction.update(copyRef, { status: copyStatus });

    if (copyStatus === 'AVAILABLE') {
        const q = query(collection(db, 'reservations'), where('bookId', '==', bookId), where('status', '==', 'PENDING'), orderBy('createdAt', 'asc'));
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
            const nextReservation = snapshot.docs[0];
            transaction.update(doc(db, 'reservations', nextReservation.id), {
                status: 'READY',
                expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString()
            });
        }
    }
  });
};

export const getStudentLoans = async (studentId: string) => {
  const q = query(collection(db, 'loans'), where('studentId', '==', studentId), where('status', '==', 'ACTIVE'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Loan));
};
