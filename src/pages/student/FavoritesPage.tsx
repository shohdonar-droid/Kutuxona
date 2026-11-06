import {useEffect, useState} from 'react';
import {getUserFavorites, Favorite, removeFavorite} from '../../services/favoriteService';
import {getBook, Book} from '../../services/bookService';
import {useAuth} from '../../context/AuthContext';
import {Link} from 'react-router-dom';

export default function FavoritesPage() {
  const {user} = useAuth();
  const [favorites, setFavorites] = useState<(Favorite & {book?: Book})[]>([]);

  useEffect(() => {
    if (user) {
      getUserFavorites(user.uid).then(async favs => {
        const favsWithBooks = await Promise.all(favs.map(async f => {
          const book = await getBook(f.bookId);
          return {...f, book: book || undefined};
        }));
        setFavorites(favsWithBooks);
      });
    }
  }, [user]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Sevimlilar</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {favorites.map(f => f.book && (
          <div key={f.id} className="border p-4 rounded shadow">
            <h3 className="text-xl font-bold">{f.book.title}</h3>
            <Link to={`/books/${f.book.id}`} className="text-blue-500">Batafsil</Link>
            <button onClick={() => removeFavorite(f.id)} className="block text-red-500 mt-2">Olib tashlash</button>
          </div>
        ))}
      </div>
    </div>
  );
}
