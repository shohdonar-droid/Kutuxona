import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {getBook, Book} from '../services/bookService';
import {useAuth} from '../context/AuthContext';

export default function BookDetailPage() {
  const {id} = useParams<{id: string}>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();

  useEffect(() => {
    if (id) {
      getBook(id).then(data => {
        setBook(data);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!book) return <div>Kitob topilmadi</div>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p className="text-gray-700 mb-4">{book.annotation}</p>
      {user ? (
        <Link to={`/student/read/${book.id}`} className="bg-blue-600 text-white px-4 py-2 rounded">Kitobni o‘qish</Link>
      ) : (
        <p className="text-red-500">🔐 Kitobni o‘qish uchun tizimga kiring</p>
      )}
    </div>
  );
}
