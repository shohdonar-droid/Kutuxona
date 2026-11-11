import {useEffect, useState, useMemo} from 'react';
import {getBooks, Book} from '../services/bookService';
import {getBookAvailability} from '../services/bookCopyService';
import {getCategories, Category} from '../services/categoryService';
import {Link, useSearchParams} from 'react-router-dom';
import {Search, Filter, BookOpen, ChevronRight, LayoutGrid, List, SlidersHorizontal, Package, Eye, Heart, Tag, ChevronLeft, ChevronRight as ChevronRightIcon} from 'lucide-react';
import {Card, Badge, Button} from '../components/UIComponents';
import PageHeader from '../components/PageHeader';

const ITEMS_PER_PAGE = 12; // 3 rows * 4 columns

function BookCard({book, viewMode}: {book: Book, viewMode: 'grid' | 'list'}) {
    const [availability, setAvailability] = useState<{available: number, total: number} | null>(null);

    useEffect(() => {
        getBookAvailability(book.id).then(setAvailability);
    }, [book.id]);

    const availabilityText = availability ? `${availability.available} / ${availability.total}` : '...';
    const isOutOfStock = availability && availability.available === 0;

    if (viewMode === 'grid') {
        return (
            <Link to={`/books/${book.id}`} className="group block h-full">
                <Card className="p-0 overflow-hidden border-0 bg-transparent shadow-none h-full flex flex-col hover:-translate-y-2 transition-transform duration-500">
                    <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-lg group-hover:shadow-2xl transition-shadow relative shrink-0">
                        {book.coverUrl ? (
                            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300 italic text-xs uppercase font-black tracking-widest">Muqova</div>
                        )}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black backdrop-blur-md shadow-lg flex items-center gap-1 ${isOutOfStock ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'}`}>
                                <Package size={10} /> {availabilityText}
                            </div>
                        </div>
                        
                        <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-white shadow-lg">
                            <div className="flex items-center gap-1 text-[10px] font-black">
                                <Eye size={12} className="text-blue-300" /> {book.views || 0}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-black">
                                <Heart size={12} className="text-pink-400 fill-current" /> {book.favorites || 0}
                            </div>
                        </div>
                    </div>
                    <div className="px-1 flex flex-col flex-1">
                        <h3 className="text-sm font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors mb-1">{book.title}</h3>
                        <p className="text-[11px] text-gray-500 font-bold mb-4">{book.author || "Muallif noma'lum"}</p>
                        
                        <div className="mt-auto">
                            <div className="w-full py-2 bg-blue-50 text-blue-700 text-[11px] font-black rounded-xl text-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                KO‘RISH
                            </div>
                        </div>
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
                    <div className="hidden md:flex items-center gap-8 px-6 text-right">
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Ko'rishlar</p>
                                <div className="flex items-center gap-1 justify-center text-blue-600 font-bold text-sm"><Eye size={14} /> {book.views || 0}</div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Sevimli</p>
                                <div className="flex items-center gap-1 justify-center text-pink-500 font-bold text-sm"><Heart size={14} className="fill-current" /> {book.favorites || 0}</div>
                            </div>
                            <div className="text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Mavjudlik</p>
                                <Badge variant={isOutOfStock ? 'red' : 'green'}>{availabilityText}</Badge>
                            </div>
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);

  const query = searchParams.get('q') || '';
  const activeCategoryId = searchParams.get('categoryId') || '';

  useEffect(() => {
    setCurrentPage(1);
  }, [query, activeCategoryId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
        getBooks(true),
        getCategories(true)
    ]).then(([booksData, catsData]) => {
        setBooks(booksData);
        setCategories(catsData);
        setLoading(false);
    });
  }, []);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
        const matchesQuery = (book.title.toLowerCase().includes(query.toLowerCase()) || 
                              book.isbn.includes(query) ||
                              book.author?.toLowerCase().includes(query.toLowerCase()));
        
        const matchesCategory = !activeCategoryId || book.categoryIds?.includes(activeCategoryId);
        
        return matchesQuery && matchesCategory;
    });
  }, [books, query, activeCategoryId]);

  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = useMemo(() => {
      const start = (currentPage - 1) * ITEMS_PER_PAGE;
      return filteredBooks.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredBooks, currentPage]);

  const handleCategorySelect = (id: string) => {
      setCurrentPage(1);
      setSearchParams({ q: query, categoryId: activeCategoryId === id ? '' : id });
  };

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
      
      {/* Search & Categories */}
      <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                    type="text" 
                    placeholder="Kitob nomi, muallif yoki ISBN bo‘yicha qidiring..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    value={query}
                    onChange={e => {
                        setCurrentPage(1);
                        setSearchParams({q: e.target.value, categoryId: activeCategoryId});
                    }}
                />
            </div>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
              <button
                onClick={() => handleCategorySelect('')}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black transition-all border ${
                    !activeCategoryId 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                    : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                }`}
              >
                  Barchasi
              </button>
              {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`flex-shrink-0 px-6 py-3 rounded-2xl text-xs font-black transition-all border flex items-center gap-2 ${
                        activeCategoryId === cat.id 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20' 
                        : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                    }`}
                  >
                      <Tag size={14} className={activeCategoryId === cat.id ? 'text-blue-200' : 'text-gray-300'} />
                      {cat.name}
                      <span className={`text-[10px] ml-1 px-1.5 py-0.5 rounded-md ${activeCategoryId === cat.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {cat.bookCount}
                      </span>
                  </button>
              ))}
          </div>
      </div>

      {/* Book Catalog */}
      {paginatedBooks.length > 0 ? (
        <div className="space-y-12">
            <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-12" 
                : "space-y-4"
            }>
                {paginatedBooks.map(book => (
                    <BookCard key={book.id} book={book} viewMode={viewMode} />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 pt-8">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="p-3 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 transition-all hover:bg-gray-50"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                                    : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button 
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="p-3 rounded-xl bg-white border border-gray-100 text-gray-500 disabled:opacity-30 transition-all hover:bg-gray-50"
                    >
                        <ChevronRightIcon size={20} />
                    </button>
                </div>
            )}
        </div>
      ) : (
        <Card className="flex flex-col items-center justify-center py-24 text-center">
            <BookOpen size={64} className="text-gray-100 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">Kitoblar topilmadi</h3>
            <p className="text-gray-500 mt-2 max-w-sm">
                Tanlangan kategoriya yoki qidiruv bo‘yicha hech qanday natija topilmadi.
            </p>
            <Button onClick={() => {
                setSearchParams({});
                setCurrentPage(1);
            }} className="mt-8">
                Barchasini ko'rish
            </Button>
        </Card>
      )}
    </div>
  );
}

