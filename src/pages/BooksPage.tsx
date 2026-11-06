import {useEffect, useState, useMemo} from 'react';
import {getBooks, Book} from '../services/bookService';
import {Link, useSearchParams} from 'react-router-dom';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get('q') || '';
  const subject = searchParams.get('subject') || '';

  useEffect(() => {
    getBooks(true).then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book => 
      (book.title.toLowerCase().includes(query.toLowerCase()) || 
       book.isbn.includes(query))
    );
  }, [books, query]);

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Elektron Kutubxona</h1>
      
      <div className="flex gap-4 mb-8">
        <input 
            type="text" 
            placeholder="Qidiruv..." 
            className="border p-3 rounded w-full"
            value={query}
            onChange={e => setSearchParams({q: e.target.value, subject})}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredBooks.map(book => (
          <div key={book.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition flex flex-col">
            {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-full h-48 object-cover rounded-lg mb-4" />}
            <h3 className="text-lg font-bold mb-2 flex-grow">{book.title}</h3>
            <p className="text-gray-600 text-sm mb-4">ISBN: {book.isbn}</p>
            <Link to={`/books/${book.id}`} className="bg-blue-600 text-white text-center py-2 rounded-lg font-semibold hover:bg-blue-700 transition">Batafsil</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
