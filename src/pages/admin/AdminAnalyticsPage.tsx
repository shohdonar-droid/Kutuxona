import {useEffect, useState} from 'react';
import {getUsersCount, getRoleCounts} from '../../services/userService';
import {getBooksCount, getBooks, getBooksByCategoryCounts} from '../../services/bookService';
import {getActiveLoansCount, getLoansWithDateFilter} from '../../services/loanService';
import {getTotalFavoritesCount} from '../../services/favoriteService';
import {getTotalReadsCount, getTotalReadingSessionsCount} from '../../services/readingService';
import {Bar, Pie} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement} from 'chart.js';
import {exportToCSV} from '../../utils/csvExport';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Users, BookOpen, Clock, Download, Calendar, TrendingUp, ArrowUpRight, AlertCircle, Heart, Eye, BookText, PieChart, Tag} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d');

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    try {
        setLoading(true);
        const [
            users, roleCounts, booksCount, activeLoans, 
            totalFavorites, totalReads, totalSessions, 
            categoryList, booksList
        ] = await Promise.all([
            getUsersCount(),
            getRoleCounts(),
            getBooksCount(),
            getActiveLoansCount(),
            getTotalFavoritesCount(),
            getTotalReadsCount(),
            getTotalReadingSessionsCount(),
            import('../../services/categoryService').then(m => m.getCategories()),
            getBooks(false)
        ]);
        
        const endDate = new Date();
        const startDate = new Date();
        if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
        
        const loans = await getLoansWithDateFilter(startDate, endDate);
        
        setStats({
            users, roleCounts, booksCount, activeLoans, 
            totalFavorites, totalReads, totalSessions,
            categoryList, booksList, loans
        });
    } catch (e) {
        console.error(e);
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-900 font-bold">Analitika yuklanmoqda...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  const categoryData = {
    labels: stats.categoryList.map((c: any) => c.name),
    datasets: [{
        label: 'Kitoblar soni',
        data: stats.categoryList.map((c: any) => c.bookCount || 0),
        backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(107, 114, 128, 0.8)',
            'rgba(20, 184, 166, 0.8)',
            'rgba(244, 63, 94, 0.8)',
        ],
        borderWidth: 0,
    }]
  };

  // Sort books by reads for popular books chart
  const popularBooks = [...stats.booksList].sort((a, b) => (b.reads || 0) - (a.reads || 0)).slice(0, 5);

  const popularData = {
    labels: popularBooks.map(b => b.title.substring(0, 15) + '...'),
    datasets: [
        {
            label: 'O\'qilgan',
            data: popularBooks.map(b => b.reads || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderRadius: 6,
        },
        {
            label: 'Sevimli',
            data: popularBooks.map(b => b.favorites || 0),
            backgroundColor: 'rgba(236, 72, 153, 0.8)',
            borderRadius: 6,
        }
    ]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Analitika Markazi" 
        subtitle="Kutubxona faoliyati va foydalanuvchilar statistikasi."
        actions={
            <div className="flex gap-2">
                <select 
                    value={dateRange} 
                    onChange={e => setDateRange(e.target.value)} 
                    className="p-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="today">Bugun</option>
                    <option value="7d">Oxirgi 7 kun</option>
                    <option value="30d">Oxirgi 30 kun</option>
                </select>
                <Button variant="secondary" onClick={() => exportToCSV(stats.loans, 'loans')} className="bg-white border border-gray-100">
                    <Download size={18} /> Eksport
                </Button>
            </div>
        }
      />
      
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Users size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Foydalanuvchilar</p>
                <p className="text-3xl font-black text-gray-900">{stats.users}</p>
            </div>
        </Card>
        
        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <BookOpen size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Jami Kitoblar</p>
                <p className="text-3xl font-black text-gray-900">{stats.booksCount}</p>
            </div>
        </Card>

        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Clock size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faol Kreditlar</p>
                <p className="text-3xl font-black text-gray-900">{stats.activeLoans}</p>
            </div>
        </Card>

        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center text-pink-600 shrink-0">
                <Heart size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sevimli Kitoblar</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalFavorites}</p>
            </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-indigo-50 border-indigo-100">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 text-white rounded-xl"><BookText size={20} /></div>
                  <div>
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Jami O'qishlar</p>
                      <p className="text-2xl font-black text-indigo-900">{stats.totalReads}</p>
                  </div>
              </div>
          </Card>
          <Card className="p-6 bg-emerald-50 border-emerald-100">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl"><TrendingUp size={20} /></div>
                  <div>
                      <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">O'qish seanslari</p>
                      <p className="text-2xl font-black text-emerald-900">{stats.totalSessions}</p>
                  </div>
              </div>
          </Card>
          <Card className="p-6 bg-amber-50 border-amber-100">
              <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-600 text-white rounded-xl"><Eye size={20} /></div>
                  <div>
                      <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">O'rtacha faollik</p>
                      <p className="text-2xl font-black text-amber-900">{Math.round(stats.totalReads / (stats.users || 1) * 10) / 10} kitob/foyd.</p>
                  </div>
              </div>
          </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-8">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <PieChart className="text-blue-600" /> Yo'nalishlar (Kategoriyalar)
            </h3>
            <div className="h-[300px] flex justify-center">
                <Pie 
                    data={categoryData}
                    options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right' } }
                    }}
                />
            </div>
        </Card>
        
        <Card className="p-8">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <TrendingUp className="text-blue-600" /> Eng ommabop kitoblar
            </h3>
            <div className="h-[300px]">
                <Bar 
                    data={popularData}
                    options={{
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: { legend: { position: 'bottom' } },
                        scales: { x: { beginAtZero: true } }
                    }}
                />
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Tag className="text-blue-600" /> Kategoriyalar tahlili
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.categoryList.map((cat: any) => (
                    <div key={cat.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-blue-100 hover:bg-white transition-all group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-gray-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Tag size={14} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                                <p className="text-[10px] text-gray-400 font-medium">#{cat.id.substring(0, 5)}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black text-blue-900">{cat.bookCount || 0}</p>
                            <Badge variant={cat.isActive ? 'green' : 'gray'} className="text-[8px] py-0">
                                {cat.isActive ? 'Faol' : 'Passiv'}
                            </Badge>
                        </div>
                    </div>
                ))}
            </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                <h3 className="text-lg font-black text-gray-900">Kitoblar faolligi (Barcha kitoblar)</h3>
                <Badge variant="blue">{stats.booksList.length} ta kitob</Badge>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-[10px] uppercase font-black text-gray-400 tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Kitob nomi</th>
                            <th className="px-6 py-4 text-center">Yo'nalish</th>
                            <th className="px-6 py-4 text-center">Ko'rishlar</th>
                            <th className="px-6 py-4 text-center">O'qilgan</th>
                            <th className="px-6 py-4 text-center">Sevimli</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {stats.booksList.slice(0, 10).map((book: any) => (
                            <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-bold text-gray-900 text-sm">{book.title}</td>
                                <td className="px-6 py-4 text-center text-xs text-gray-500 font-medium">{book.subject || 'Boshqa'}</td>
                                <td className="px-6 py-4 text-center font-mono text-sm text-blue-600 font-bold">{book.views || 0}</td>
                                <td className="px-6 py-4 text-center font-mono text-sm text-green-600 font-bold">{book.reads || 0}</td>
                                <td className="px-6 py-4 text-center font-mono text-sm text-pink-600 font-bold">{book.favorites || 0}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
      </div>
    </div>
  );
}
