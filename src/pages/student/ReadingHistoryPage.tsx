import {useEffect, useState} from 'react';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase';
import {useAuth} from '../../context/AuthContext';
import {Book, getBook} from '../../services/bookService';
import {ReadingProgress} from '../../services/readingService';

export default function ReadingHistoryPage() {
  const {user} = useAuth();
  const [history, setHistory] = useState<(ReadingProgress & {book?: Book})[]>([]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, 'readingProgress'), where('userId', '==', user.uid));
      getDocs(q).then(async snapshot => {
        const data = await Promise.all(snapshot.docs.map(async doc => {
          const progress = doc.data() as ReadingProgress;
          const book = await getBook(progress.bookId);
          return {...progress, book: book || undefined};
        }));
        setHistory(data);
      });
    }
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">O‘qish tarixi</h1>
      {history.map((h, i) => h.book && (
        <div key={i} className="border p-4 rounded mb-2">
            <h3 className="text-lg font-bold">{h.book.title}</h3>
            <p>Progress: {h.progressPercent}%</p>
            <p>Status: {h.status}</p>
        </div>
      ))}
    </div>
  );
}
