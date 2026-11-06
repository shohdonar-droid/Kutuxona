import {useEffect, useState} from 'react';
import {collection, getDocs} from 'firebase/firestore';
import {db} from '../../firebase';
import {Book} from '../../services/bookService';

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState({totalBooks: 0, totalStudents: 0});

  useEffect(() => {
    const fetchData = async () => {
      const books = await getDocs(collection(db, 'books'));
      const students = await getDocs(collection(db, 'users'));
      setStats({
        totalBooks: books.size,
        totalStudents: students.docs.filter(d => d.data().role === 'student').length
      });
    };
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Admin Analitikasi</h1>
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="border p-4 rounded"><h2>Jami Kitoblar</h2><p className="text-xl font-bold">{stats.totalBooks}</p></div>
        <div className="border p-4 rounded"><h2>Jami Talabalar</h2><p className="text-xl font-bold">{stats.totalStudents}</p></div>
      </div>
    </div>
  );
}
