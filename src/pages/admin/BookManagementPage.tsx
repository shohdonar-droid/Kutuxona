import {useEffect, useState} from 'react';
import {getBooks, Book, updateBook} from '../../services/bookService';

export default function BookManagementPage() {
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    getBooks(false).then(setBooks);
  }, []);

  const togglePublished = async (book: Book) => {
    await updateBook(book.id, {isPublished: !book.isPublished});
    setBooks(books.map(b => b.id === book.id ? {...b, isPublished: !b.isPublished} : b));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Kitoblarni boshqarish</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Nomi</th>
            <th>ISBN</th>
            <th>Holat</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.isbn}</td>
              <td>{book.isPublished ? 'Published' : 'Draft'}</td>
              <td>
                <button onClick={() => togglePublished(book)}>
                  {book.isPublished ? 'Unpublish' : 'Publish'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
