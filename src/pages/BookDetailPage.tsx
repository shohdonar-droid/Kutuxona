import {useEffect, useState} from 'react';
import {useParams, Link} from 'react-router-dom';
import {getBook, Book} from '../services/bookService';
import {getBookAvailability} from '../services/bookCopyService';
import {useAuth} from '../context/AuthContext';
import {Card, Badge, Button} from '../components/UIComponents';
import {BookOpen, Heart, Bookmark, Info, AlertCircle, ChevronLeft} from 'lucide-react';

export default function BookDetailPage() {
  const {id} = useParams<{id: string}>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const {user, profile} = useAuth();
  const [availability, setAvailability] = useState<{available: number, total: number} | null>(null);

  useEffect(() => {
    if (id) {
      getBook(id).then(data => {
        setBook(data);
        setLoading(false);
      });
      getBookAvailability(id).then(setAvailability);
    }
  }, [id]);

  if (loading) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;
  if (!book) return <div className="p-8 text-center text-red-600 font-bold">Kitob topilmadi</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <Link to="/books" className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors">
        <ChevronLeft size={16} /> Katalogga qaytish
      </Link>

      <div className="flex flex-col lg:flex-row gap-12 items-start">
        {/* Left: Book Cover */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10 border border-gray-100 bg-white relative">
                {book.coverUrl ? (
                    <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-200">
                        <BookOpen size={64} strokeWidth={1} />
                        <p className="mt-2 text-xs font-bold uppercase tracking-widest italic text-gray-300">Muqova mavjud emas</p>
                    </div>
                )}
                <div className="absolute top-4 right-4">
                    <Badge variant="blue" className="bg-white/80 backdrop-blur-md text-blue-900 border-0 shadow-lg px-3 py-1">Elektron</Badge>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" className="flex-1 justify-center py-3">
                    <Heart size={18} className="text-red-500" /> Sevimli
                </Button>
                <Button variant="secondary" className="flex-1 justify-center py-3">
                    <Bookmark size={18} className="text-blue-500" /> Saqlash
                </Button>
            </div>
            
            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={14} /> Jismoniy fond
                </h4>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-gray-600">Fond holati:</span>
                    <Badge variant={(availability?.available || 0) > 0 ? 'green' : 'red'}>
                        {availability?.available || 0} / {availability?.total || 0} ta
                    </Badge>
                </div>
                {(availability?.total || 0) > 0 && (
                    <Button className="w-full justify-center bg-blue-600 hover:bg-blue-700 py-3 mt-2 shadow-lg shadow-blue-600/20">
                        📌 Bron qilish
                    </Button>
                )}
            </div>
        </div>

        {/* Right: Book Details */}
        <div className="flex-1 space-y-10 py-2">
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Badge variant="blue">{book.subject || 'Fan'}</Badge>
                    <Badge variant="gray">{book.language || 'O‘zbek'}</Badge>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">{book.title}</h1>
                <p className="text-xl text-gray-500 font-bold">{book.author || "Muallif noma'lum"}</p>
            </div>

            <div className="flex flex-wrap gap-10 border-y border-gray-100 py-8">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ISBN</p>
                    <p className="text-sm font-bold text-gray-700 font-mono">{book.isbn}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nashr yili</p>
                    <p className="text-sm font-bold text-gray-700">{book.year || '2024-yil'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sahifalar</p>
                    <p className="text-sm font-bold text-gray-700">{book.pages || '240'} bet</p>
                </div>
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ko‘rishlar</p>
                    <p className="text-sm font-bold text-gray-700">{book.views || '1,240'}</p>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-xl font-black text-gray-900">Kitob haqida</h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                    {book.annotation || 'Ushbu kitob uchun hali qisqacha ma\'lumot qo‘shilmagan. Kitob mazmuni bilan tanishish uchun o‘qishni boshlang.'}
                </p>
            </div>

            <div className="pt-6">
                {user ? (
                    <Link to={`/student/read/${book.id}`} className="block">
                        <Button className="w-full md:w-auto px-12 py-5 text-lg font-black shadow-2xl shadow-blue-900/30 rounded-2xl">
                            <BookOpen size={24} /> O‘QISHNI BOSHLASH
                        </Button>
                    </Link>
                ) : (
                    <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <AlertCircle className="text-blue-600" size={32} />
                            <div>
                                <h4 className="font-black text-blue-900">Eslatma</h4>
                                <p className="text-sm text-blue-700 font-medium">Kitobni elektron o‘qish uchun tizimga kirish kerak.</p>
                            </div>
                        </div>
                        <Link to="/login">
                            <Button className="whitespace-nowrap px-8 py-3">Tizimga kirish</Button>
                        </Link>
                    </div>
                )}
            </div>
            
            {/* Librarian/Admin Actions */}
            {(profile?.role === 'admin' || profile?.role === 'librarian') && (
                <div className="pt-10 mt-10 border-t border-dashed border-gray-200">
                    <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Boshqaruv amallari</h4>
                    <div className="flex gap-4">
                        <Button variant="secondary" className="px-6 py-2.5 text-sm font-bold border border-gray-200">
                            Tahrirlash
                        </Button>
                        <Button variant="secondary" className="px-6 py-2.5 text-sm font-bold border border-gray-200">
                            Nusxalarni boshqarish
                        </Button>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
