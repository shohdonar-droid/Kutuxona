import {useEffect, useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {getReadingProgresses} from '../../services/readingService';
import {getReservations} from '../../services/reservationService';
import {getLoans} from '../../services/loanService';
import {getBooks} from '../../services/bookService';
import PageHeader from '../../components/PageHeader';
import {StatCard, Card, Badge, Button} from '../../components/UIComponents';
import {BookOpen, Clock, Heart, BookCheck, ArrowRight, Play, AlertTriangle, Book as BookIcon} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function StudentDashboard() {
  const {profile} = useAuth();
  const [stats, setStats] = useState({readingCount: 0, reservationCount: 0, activeCount: 0, loanCount: 0});
  const [continueReading, setContinueReading] = useState<any>(null);
  const [recommendedBooks, setRecommendedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      try {
        const [progresses, activeReservations, activeLoans, allBooks] = await Promise.all([
            getReadingProgresses(profile.uid),
            getReservations(profile.uid),
            getLoans(profile.uid),
            getBooks()
        ]);

        setStats({
            readingCount: progresses.filter(p => p.status === 'COMPLETED').length,
            reservationCount: activeReservations.filter(r => r.status === 'PENDING').length,
            activeCount: progresses.filter(p => p.status === 'IN_PROGRESS').length,
            loanCount: activeLoans.filter(l => l.status === 'ACTIVE').length
        });

        const inProgress = progresses.filter(p => p.status === 'IN_PROGRESS');
        if (inProgress.length > 0) {
            const latest = inProgress.sort((a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime())[0];
            const bookInfo = allBooks.find(b => b.id === latest.bookId);
            setContinueReading({ ...latest, book: bookInfo });
        }

        // Simple recommendation: first 4 books for now
        setRecommendedBooks(allBooks.slice(0, 4));
      } catch (err) {
        console.error("Error fetching student dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);
  
  if (!profile || loading) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Salom, {profile.fullName}! 👋</h1>
            <div className="flex items-center mt-2 space-x-3">
                <Badge variant="blue">{profile.role}</Badge>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-medium text-gray-600">302-guruh</span>
                <span className="text-gray-400">|</span>
                <span className="text-sm font-medium text-gray-600">Tibbiyot fakulteti</span>
            </div>
        </div>
        <Link to="/books">
            <Button>
                Kitob izlash <ArrowRight size={18} />
            </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="O‘qilgan" value={stats.readingCount} icon={BookCheck} color="text-green-600" />
        <StatCard title="Jarayonda" value={stats.activeCount} icon={Clock} color="text-orange-500" />
        <StatCard title="Sevimlilar" value={0} icon={Heart} color="text-red-500" />
        <StatCard title="Faol bronlar" value={stats.reservationCount} icon={BookCheck} color="text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Continue Reading */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">O‘qishni davom ettirish</h2>
                <Link to="/student/reading-history" className="text-blue-600 hover:underline text-sm font-medium">Barchasi</Link>
            </div>
            
            {continueReading ? (
                <Card className="hover:shadow-md transition-shadow">
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="w-full md:w-32 h-44 bg-gray-100 rounded-lg overflow-hidden shrink-0 shadow-sm border border-gray-200">
                            {continueReading.book?.thumbnail ? (
                                <img src={continueReading.book.thumbnail} alt={continueReading.book.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-xs">No cover</div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-1">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 leading-tight mb-1">{continueReading.book?.title || 'Kitob nomi'}</h3>
                                <p className="text-gray-500 text-sm font-medium mb-4">{continueReading.book?.author || "Muallif noma'lum"}</p>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        <span>Progress</span>
                                        <span className="text-blue-600">{continueReading.progressPercent}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-100">
                                        <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${continueReading.progressPercent}%` }}></div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-6">
                                <span className="text-xs text-gray-400 font-medium italic">Oxirgi marta: {new Date(continueReading.lastReadAt).toLocaleDateString()}</span>
                                <Link to={`/student/read/${continueReading.bookId}`}>
                                    <Button variant="primary" className="shadow-lg shadow-blue-900/20">
                                        <Play size={16} fill="currentColor" /> Davom ettirish
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <Card className="flex flex-col items-center justify-center py-12 text-center">
                    <BookOpen size={48} className="text-gray-200 mb-4" />
                    <p className="text-gray-500 font-medium">Hozircha hech qanday kitob o‘qish jarayonida emas.</p>
                    <Link to="/books" className="mt-4 text-blue-600 font-bold hover:underline">Kitob tanlash</Link>
                </Card>
            )}

            {/* Recommended */}
            <div className="space-y-6 pt-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Tavsiya etilgan kitoblar</h2>
                    <Link to="/books" className="text-blue-600 hover:underline text-sm font-medium">Ko‘proq</Link>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recommendedBooks.map((book) => (
                        <Link key={book.id} to={`/books/${book.id}`} className="group">
                            <div className="aspect-[3/4] rounded-lg overflow-hidden mb-3 shadow-sm border border-gray-200 group-hover:shadow-md transition-shadow relative">
                                {book.thumbnail ? (
                                    <img src={book.thumbnail} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300 italic text-xs">No cover</div>
                                )}
                                <div className="absolute top-2 right-2">
                                    <Badge variant="blue">New</Badge>
                                </div>
                            </div>
                            <h4 className="text-sm font-bold text-gray-900 line-clamp-1 group-hover:text-blue-700 transition-colors">{book.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-1">{book.author || "Muallif noma'lum"}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
            {/* Active Loans */}
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Olingan kitoblar</h2>
                <div className="space-y-3">
                    {stats.loanCount > 0 ? (
                        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <BookIcon size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Sizda {stats.loanCount} ta fizik kitob bor</p>
                                    <Link to="/student/my-books" className="text-xs text-blue-600 hover:underline">Tafsilotlar</Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 p-6 text-center">
                            <p className="text-sm text-gray-400 font-medium italic">Sizda hozircha olingan fizik kitoblar yo‘q.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Bildirishnomalar</h2>
                    <Link to="/student/notifications" className="text-blue-600 hover:underline text-xs font-medium">Barchasi</Link>
                </div>
                <div className="space-y-3">
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-400"></div>
                        <div className="flex gap-3">
                            <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Muddati o'tayotgan kitob</p>
                                <p className="text-xs text-gray-600 leading-relaxed">«Farmakologiya» kitobini qaytarish muddatiga 2 kun qoldi.</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Bugun, 10:45</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-blue-400"></div>
                        <div className="flex gap-3">
                            <BookCheck size={18} className="text-blue-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-gray-900 mb-1">Bron tayyor</p>
                                <p className="text-xs text-gray-600 leading-relaxed">Siz bron qilgan «Anatomiya» kitobi kutubxonada tayyor.</p>
                                <p className="text-[10px] text-gray-400 mt-2 font-medium">Kecha, 16:20</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Quick Stats Summary */}
            <Card className="bg-blue-900 text-white border-0 shadow-lg shadow-blue-900/20">
                <h3 className="text-sm font-bold text-blue-200 uppercase tracking-widest mb-4">O‘qish faolligi</h3>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-3xl font-black">12.5</p>
                            <p className="text-xs text-blue-300 font-medium">soat / haftada</p>
                        </div>
                        <div className="flex items-end gap-1 h-12">
                            {[20, 45, 30, 60, 40, 75, 50].map((h, i) => (
                                <div key={i} className="w-1.5 bg-blue-400/30 rounded-full overflow-hidden">
                                    <div className="bg-white w-full rounded-full" style={{ height: `${h}%` }}></div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-blue-200 leading-relaxed pt-2 border-t border-blue-800">
                        O‘tgan haftaga qaraganda <span className="font-bold text-green-400">+12%</span> ko‘proq.
                    </p>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}
