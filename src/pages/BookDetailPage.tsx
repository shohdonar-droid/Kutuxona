import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {getBook, Book} from '../services/bookService';
import {getBookCopiesCount} from '../services/bookCopyService';
import {useAuth} from '../context/AuthContext';

export default function BookDetailPage() {
  const {id} = useParams<{id: string}>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const {user} = useAuth();
  const [copiesCount, setCopiesCount] = useState(0);

  useEffect(() => {
    if (id) {
      getBook(id).then(data => {
        setBook(data);
        setLoading(false);
      });
      getBookCopiesCount(id).then(setCopiesCount);
    }
  }, [id]);

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;
  if (!book) return <div className="p-8">Kitob topilmadi</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8">
        {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-full md:w-64 h-96 object-cover rounded-xl" />}
        <div className="flex-grow">
          <h1 className="text-3xl font-bold mb-4">{book.title}</h1>
          <p className="text-gray-600 mb-6">{book.annotation}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500">ISBN</h4>
                <p className="font-semibold">{book.isbn}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm text-gray-500">Fizik nusxalar</h4>
                <p className="font-semibold">{copiesCount} ta</p>
            </div>
          </div>

          <div className="flex gap-4">
            {user ? (
                <Link to={`/student/read/${book.id}`} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition">O‘qish</Link>
            ) : (
                <p className="text-red-500">🔐 O‘qish uchun tizimga kiring</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
