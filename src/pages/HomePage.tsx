import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Book, Users, BookOpen, Library, GraduationCap, ChevronRight, Phone, Mail, MapPin, Instagram, Globe, Package, Tag } from 'lucide-react';
import { Button, Card, StatCard, Badge } from '../components/UIComponents';
import { getBooksCount, getBooks } from '../services/bookService';
import { getBookCopyStats } from '../services/bookCopyService';
import { getUsersCount } from '../services/userService';
import { getCategories, seedDefaultCategoriesIfEmpty, Category } from '../services/categoryService';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalCopies: 0,
    totalUsers: 0
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        let booksCount = 0;
        let copiesCount = 0;
        let usersCount = 0;

        try {
          const res = await fetch('/api/public-stats');
          if (res.ok) {
            const data = await res.json();
            booksCount = data.totalBooks || 0;
            copiesCount = data.totalCopies || 0;
            usersCount = data.totalUsers || 0;
          }
        } catch (apiErr) {
          // public stats API not available
        }

        // If counts not yet set from API, load books and copies directly (permitted in rules)
        if (!booksCount && !copiesCount) {
          try {
            const [bCount, cStats] = await Promise.all([
              getBooksCount().catch(() => 0),
              getBookCopyStats().catch(() => ({ total: 0 }))
            ]);
            booksCount = bCount;
            copiesCount = cStats.total;
          } catch (e) {
            // ignore
          }
        }

        if (isMounted) {
          setStats({
            totalBooks: booksCount,
            totalCopies: copiesCount,
            totalUsers: usersCount
          });
        }

        const cats = await getCategories(true).catch(() => []);
        if (isMounted) {
          setCategories(cats);
        }
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/books');
    }
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return count.toString();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/20">
                    <Library size={24} />
                </div>
                <div>
                    <h1 className="text-lg font-black text-gray-900 leading-none tracking-tighter">TDTU CHIRCHIQ</h1>
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mt-1">Elektron Kutubxona</p>
                </div>
            </div>
            <div className="hidden md:flex items-center gap-8">
                <Link to="/" className="text-sm font-bold text-blue-900 hover:text-blue-700">Bosh sahifa</Link>
                <Link to="/books" className="text-sm font-bold text-gray-500 hover:text-blue-900">Kitoblar</Link>
                <Link to="/about" className="text-sm font-bold text-gray-500 hover:text-blue-900">Biz haqimizda</Link>
                <Link to="/help" className="text-sm font-bold text-gray-500 hover:text-blue-900">Yordam</Link>
            </div>
            <div className="flex items-center gap-3">
                <Link to="/login">
                    <Button variant="secondary" className="px-5 py-2 text-sm font-bold">Kirish</Button>
                </Link>
                <Link to="/register">
                    <Button variant="primary" className="px-5 py-2 text-sm font-bold shadow-lg shadow-blue-900/20">Ro'yxatdan o'tish</Button>
                </Link>
            </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900 via-blue-900/90 to-blue-900/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="blue" className="mb-6 bg-blue-400/20 text-blue-200 border border-blue-400/30 px-4 py-1.5 backdrop-blur-md">
                Toshkent davlat tibbiyot universiteti Chirchiq filiali
            </Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
                Kelajak ilmi bugundan <br /> <span className="text-blue-400">biz bilan boshlanadi</span>
            </h2>
            <p className="text-lg md:text-xl text-blue-100/80 mb-10 max-w-2xl mx-auto font-medium">
                Kerakli adabiyotlarni izlang, o‘qing va bilimlaringizni boyiting. 
                Elektron kutubxonamiz barcha talabalar uchun ochiq.
            </p>
            
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-2 shadow-2xl shadow-black/20 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all">
                <div className="flex-1 flex items-center px-4">
                    <Search className="text-blue-300" size={24} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Kitob, muallif, fan yoki ISBN bo‘yicha qidiring..." 
                        className="w-full bg-transparent border-0 outline-none p-4 text-white placeholder:text-blue-200 font-bold"
                    />
                </div>
                <Button type="submit" className="px-10 py-4 bg-white text-blue-900 hover:bg-blue-50 font-black tracking-wide border-0">
                    QIDIRISH
                </Button>
            </form>
            
            {/* Live Real-Time System KPI Numbers */}
            <div className="mt-12 flex justify-center gap-10 md:gap-16">
                {[
                    { label: 'Jami kitoblar', value: stats.totalBooks > 0 ? formatCount(stats.totalBooks) : '0', rawValue: stats.totalBooks, icon: Book },
                    { label: 'Fizik fond', value: stats.totalCopies > 0 ? formatCount(stats.totalCopies) : '0', rawValue: stats.totalCopies, icon: Package },
                    { label: 'Foydalanuvchilar', value: stats.totalUsers > 0 ? formatCount(stats.totalUsers) : '0', rawValue: stats.totalUsers, icon: Users }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <p className="text-3xl md:text-4xl font-black text-white tracking-tight">
                            {stat.value}
                        </p>
                        <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mt-1">
                            {stat.label}
                        </p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* Dynamic System Categories */}
      <section className="relative z-20 -mt-16 max-w-7xl mx-auto px-6 lg:px-8 w-full">
        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="flex flex-col items-center text-center p-6 border-0 bg-white/90 backdrop-blur-md shadow-lg animate-pulse">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mb-4"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 w-14 bg-gray-200 rounded"></div>
                    </Card>
                ))}
            </div>
        ) : categories.length === 0 ? (
            <Card className="p-8 text-center bg-white/90 backdrop-blur-md shadow-lg">
                <p className="text-sm font-bold text-gray-500">Tizimda kategoriyalar mavjud emas.</p>
            </Card>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map(cat => (
                    <div 
                        key={cat.id} 
                        onClick={() => navigate(`/books?categoryId=${cat.id}`)}
                        className="cursor-pointer group"
                    >
                        <Card className="flex flex-col items-center text-center p-6 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 border-0 bg-white/95 backdrop-blur-md h-full justify-between">
                            <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                                {cat.icon || '📚'}
                            </span>
                            <div className="w-full">
                                <h4 className="text-sm font-extrabold text-gray-900 mb-1 line-clamp-1 group-hover:text-blue-700 transition-colors">
                                    {cat.name}
                                </h4>
                                <p className="text-[11px] font-black text-blue-600 uppercase tracking-tight">
                                    {cat.bookCount || 0} TA KITOB
                                </p>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>
        )}
      </section>

      {/* Main Content */}
      <main className="flex-grow py-24 max-w-7xl mx-auto px-6 lg:px-8 space-y-24">
        {/* Featured Section */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
            <div className="lg:col-span-2 space-y-8">
                <div className="flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Mashhur kitoblar</h2>
                        <div className="h-1 w-20 bg-blue-600 mt-2"></div>
                    </div>
                    <Link to="/books" className="text-blue-600 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                        Barchasini ko'rish <ChevronRight size={18} />
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {[
                        {title: 'Anatomiya', author: 'G\'ofurov A.', category: 'Tibbiyot', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=300&auto=format&fit=crop'},
                        {title: 'Farmakologiya', author: 'Raximov A.', category: 'Farmatsiya', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop'},
                        {title: 'Ichki kasalliklar', author: 'Karimov B.', category: 'Pediatriya', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=300&auto=format&fit=crop'}
                    ].map((book, i) => (
                        <div key={i} className="group">
                            <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-5 shadow-lg group-hover:shadow-2xl transition-all relative">
                                <img src={book.img} alt={book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                    <Link to="/login" className="w-full">
                                        <Button className="w-full justify-center bg-white text-blue-900 font-bold border-0 py-3">O‘QISH</Button>
                                    </Link>
                                </div>
                                <div className="absolute top-4 left-4">
                                    <Badge variant="blue" className="bg-blue-600 text-white border-0 shadow-lg">{book.category}</Badge>
                                </div>
                            </div>
                            <h4 className="font-black text-lg text-gray-900 group-hover:text-blue-700 transition-colors">{book.title}</h4>
                            <p className="text-gray-500 font-medium">{book.author}</p>
                        </div>
                    ))}
                </div>
            </div>
            
            <aside className="space-y-10">
                <Card className="bg-blue-900 text-white border-0 p-10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-400/20 transition-all"></div>
                    <h3 className="text-2xl font-black mb-4 relative z-10">Yangi bilimlar sari bir qadam!</h3>
                    <p className="mb-8 opacity-80 text-blue-100 leading-relaxed relative z-10">
                        Elektron kutubxonamiz barcha talabalar va o‘qituvchilar uchun 24/7 ochiq. Ro'yxatdan o'ting va o'qishni boshlang!
                    </p>
                    <Link to="/login" className="relative z-10 block">
                        <Button className="w-full justify-center bg-white text-blue-900 font-black border-0 py-4 shadow-xl">
                            Hozir boshlash
                        </Button>
                    </Link>
                </Card>
                
                <div className="space-y-6">
                    <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                        <GraduationCap className="text-blue-600" /> Mashhur yo‘nalishlar
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {['Tibbiyot', 'Farmakologiya', 'Pediatriya', 'Jarrohlik', 'Stomatologiya', 'Ginekologiya', 'Kardiologiya'].map(n => (
                            <span key={n} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-all">
                                {n}
                            </span>
                        ))}
                    </div>
                </div>
            </aside>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center text-white">
                            <Library size={24} />
                        </div>
                        <h1 className="text-lg font-black text-gray-900 leading-none tracking-tighter">TDTU CHIRCHIQ</h1>
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed">
                        Toshkent davlat tibbiyot universiteti Chirchiq filiali Elektron kutubxonasi – zamonaviy ta'lim va ilm-fan maskani.
                    </p>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100"><Instagram size={18} /></a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100"><Globe size={18} /></a>
                    </div>
                </div>
                
                <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Havolalar</h4>
                    <ul className="space-y-4">
                        <li><Link to="/books" className="text-sm font-bold text-gray-500 hover:text-blue-600">Kitoblar katalogi</Link></li>
                        <li><Link to="/news" className="text-sm font-bold text-gray-500 hover:text-blue-600">Yangiliklar</Link></li>
                        <li><Link to="/help" className="text-sm font-bold text-gray-500 hover:text-blue-600">Foydalanish qo'llanmasi</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Yordam</h4>
                    <ul className="space-y-4">
                        <li><Link to="/terms" className="text-sm font-bold text-gray-500 hover:text-blue-600">Foydalanish shartlari</Link></li>
                        <li><Link to="/privacy" className="text-sm font-bold text-gray-500 hover:text-blue-600">Maxfiylik siyosati</Link></li>
                        <li><Link to="/contact" className="text-sm font-bold text-gray-500 hover:text-blue-600">Bog'lanish</Link></li>
                    </ul>
                </div>
                
                <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Bog'lanish</h4>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                            <MapPin size={18} className="text-blue-600 shrink-0 mt-0.5" />
                            <span className="text-sm font-bold text-gray-500">Chirchiq shahri, Navoiy ko'chasi, 12-uy</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Phone size={18} className="text-blue-600" />
                            <span className="text-sm font-bold text-gray-500">+998 71 123-45-67</span>
                        </li>
                        <li className="flex items-center gap-3">
                            <Mail size={18} className="text-blue-600" />
                            <span className="text-sm font-bold text-gray-500">info@tdtu-chirchiq.uz</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs font-bold text-gray-400">© 2026 TDTU Chirchiq filiali. Barcha huquqlar himoyalangan.</p>
                <div className="flex gap-6">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Version 2.0.0</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
