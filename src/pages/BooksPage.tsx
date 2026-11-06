import {useEffect, useState} from 'react';
import {getBooks, Book} from '../services/bookService';
import {Link} from 'react-router-dom';

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBooks(true).then(data => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Elektron Kutubxona</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map(book => (
          <div key={book.id} className="border rounded p-4 shadow">
            <h3 className="text-xl font-semibold">{book.title}</h3>
            <p className="text-gray-600">ISBN: {book.isbn}</p>
            <Link to={`/books/${book.id}`} className="text-blue-500 hover:underline">Batafsil</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
