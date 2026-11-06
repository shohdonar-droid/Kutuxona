import {useEffect, useState} from 'react';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase';
import {useAuth} from '../../context/AuthContext';
import {Book, getBook} from '../../services/bookService';
import {ReadingProgress} from '../../services/readingService';
import {Loan} from '../../services/loanService';

export default function MyBooksPage() {
  const {user} = useAuth();
  const [inProgress, setInProgress] = useState<(ReadingProgress & {book?: Book})[]>([]);
  const [activeLoans, setActiveLoans] = useState<(Loan & {book?: Book})[]>([]);

  useEffect(() => {
    if (user) {
      const qProgress = query(collection(db, 'readingProgress'), where('userId', '==', user.uid), where('status', '==', 'IN_PROGRESS'));
      getDocs(qProgress).then(async snapshot => {
        const data = await Promise.all(snapshot.docs.map(async doc => {
          const progress = doc.data() as ReadingProgress;
          const book = await getBook(progress.bookId);
          return {...progress, book: book || undefined};
        }));
        setInProgress(data);
      });
      
      const qLoans = query(collection(db, 'loans'), where('studentId', '==', user.uid), where('status', '==', 'ACTIVE'));
      getDocs(qLoans).then(async snapshot => {
        const data = await Promise.all(snapshot.docs.map(async doc => {
          const loan = doc.data() as Loan;
          const book = await getBook(loan.bookId);
          return {...loan, book: book || undefined};
        }));
        setActiveLoans(data);
      });
    }
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Mening kitoblarim</h1>
      
      <h2 className="text-xl font-semibold mb-2">Elektron kitoblar</h2>
      {inProgress.map((h, i) => h.book && (
        <div key={i} className="border p-4 rounded mb-2">
            <h3 className="text-lg font-bold">{h.book.title}</h3>
            <p>Progress: {h.progressPercent}%</p>
        </div>
      ))}

      <h2 className="text-xl font-semibold mb-2 mt-4">Fizik kitoblar</h2>
      {activeLoans.map((l, i) => l.book && (
        <div key={i} className="border p-4 rounded mb-2">
            <h3 className="text-lg font-bold">{l.book.title}</h3>
            <p>Inventar: {l.inventoryId}</p>
        </div>
      ))}
    </div>
  );
}
