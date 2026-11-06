import {collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp, orderBy, runTransaction, Transaction, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';
import {updateBookCopyStatus} from './bookCopyService';
import {getLibrarySettings} from './settingsService';

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

export const issueBook = async (loan: Omit<Loan, 'id' | 'issuedAt' | 'dueAt' | 'status'>) => {
  const settings = await getLibrarySettings();
  
  return await runTransaction(db, async (transaction: Transaction) => {
    // 1. Limit check
    const loansQuery = query(collection(db, 'loans'), where('studentId', '==', loan.studentId), where('status', '==', 'ACTIVE'));
    const loansSnapshot = await getDocs(loansQuery);
    if (loansSnapshot.size >= settings.maxActiveLoans) {
        throw new Error('Talaba maksimal kitob olish limitiga yetgan.');
    }

    // 2. Copy availability check
    const copyRef = doc(db, 'bookCopies', loan.copyId);
    const copyDoc = await transaction.get(copyRef);
    if (!copyDoc.exists() || copyDoc.data().status !== 'AVAILABLE') {
      throw new Error('Kitob berish uchun mavjud emas.');
    }

    // 3. Due date calculation
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + settings.defaultLoanDays);

    const loanRef = doc(collection(db, 'loans'));
    transaction.set(loanRef, {
      ...loan,
      issuedAt: serverTimestamp(),
      dueAt: dueDate.toISOString(),
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
export const getLoansWithDateFilter = async (startDate: Date, endDate: Date) => {
  const q = query(collection(db, 'loans'), 
    where('issuedAt', '>=', startDate.toISOString()),
    where('issuedAt', '<=', endDate.toISOString())
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Loan));
};

export const getActiveLoansCount = async () => {
    const q = query(collection(db, 'loans'), where('status', '==', 'ACTIVE'));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
};
