import {useEffect, useState, useMemo} from 'react';
import {getBooks, Book} from '../services/bookService';
import {getBookAvailability} from '../services/bookCopyService';
import {Link, useSearchParams} from 'react-router-dom';
import {Search, Filter, BookOpen, ChevronRight, LayoutGrid, List, SlidersHorizontal, Package} from 'lucide-react';
import {Card, Badge, Button} from '../components/UIComponents';
import PageHeader from '../components/PageHeader';

function BookCard({book, viewMode}: {book: Book, viewMode: 'grid' | 'list'}) {
    const [availability, setAvailability] = useState<{available: number, total: number} | null>(null);

    useEffect(() => {
        getBookAvailability(book.id).then(setAvailability);
    }, [book.id]);

    const availabilityText = availability ? `${availability.available} / ${availability.total}` : '...';
    const isOutOfStock = availability && availability.available === 0;

    if (viewMode === 'grid') {
        return (
            <Link to={`/books/${book.id}`} className="group">
                <Card className="p-0 overflow-hidden border-0 bg-transparent shadow-none hover:-translate-y-2 transition-transform duration-500">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:shadow-2xl transition-shadow relative">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 italic text-xs">No cover</div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <Badge variant="blue" className="bg-blue-600/90 text-white border-0 backdrop-blur-md shadow-lg">New</Badge>
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black backdrop-blur-md shadow-lg flex items-center gap-1 ${isOutOfStock ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
                                <Package size={10} /> {availabilityText}
                            </div>
                        </div>
                    </div>
                    <div className="px-1">
                        <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors">{book.title}</h3>
                        <p className="text-xs text-gray-500 mt-1 font-bold">{book.author || "Muallif noma'lum"}</p>
                    </div>
                </Card>
            </Link>
        );
    }

    return (
        <Link to={`/books/${book.id}`} className="group block">
            <Card className="p-4 hover:border-blue-200 transition-all">
                <div className="flex gap-6 items-center">
                    <div className="w-16 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-100">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300 text-[10px]">No cover</div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-black text-gray-900 group-hover:text-blue-700 transition-colors">{book.title}</h3>
                        <p className="text-sm text-gray-500 font-bold">{book.author}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-8 px-6">
                        <div className="text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Mavjudlik</p>
                            <Badge variant={isOutOfStock ? 'red' : 'green'}>{availabilityText}</Badge>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">ISBN</p>
                            <p className="text-sm text-gray-700 font-mono">{book.isbn}</p>
                        </div>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
            </Card>
        </Link>
    );
}

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
       book.isbn.includes(query) ||
       book.author?.toLowerCase().includes(query.toLowerCase()))
    );
  }, [books, query]);

  if (loading) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Elektron Kutubxona</h1>
            <p className="text-gray-500 mt-2 font-medium">O‘zingizga kerakli adabiyotni toping va o‘qishni boshlang.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
            <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'}`}
            >
                <LayoutGrid size={20} />
            </button>
            <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600 shadow-inner' : 'text-gray-400 hover:bg-gray-50'}`}
            >
                <List size={20} />
            </button>
        </div>
      </div>
      
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Kitob nomi, muallif yoki ISBN bo‘yicha qidiring..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                value={query}
                onChange={e => setSearchParams({q: e.target.value, subject})}
            />
        </div>
        <Button variant="secondary" className="px-8 py-4 border border-gray-100 bg-white">
            <SlidersHorizontal size={18} /> Filtrlar
        </Button>
      </div>

      {/* Book Catalog */}
      {filteredBooks.length > 0 ? (
        <div className={viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8" 
            : "space-y-4"
        }>
            {filteredBooks.map(book => (
                <BookCard key={book.id} book={book} viewMode={viewMode} />
            ))}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={64} className="text-gray-100 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">Kitoblar topilmadi</h3>
            <p className="text-gray-500 mt-2 max-w-sm">
                Qidiruv so‘rovingiz bo‘yicha hech qanday natija topilmadi. 
                Iltimos, boshqa so‘zlar bilan urinib ko‘ring.
            </p>
            <Button onClick={() => setSearchParams({})} className="mt-8">
                Barcha kitoblarni ko'rish
            </Button>
        </Card>
      )}
    </div>
  );
}
