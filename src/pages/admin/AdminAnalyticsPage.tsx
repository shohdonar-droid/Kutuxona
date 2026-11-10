import {useEffect, useState} from 'react';
import {getUsersCount, getRoleCounts} from '../../services/userService';
import {getBooksCount} from '../../services/bookService';
import {getActiveLoansCount, getLoansWithDateFilter} from '../../services/loanService';
import {Bar} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import {exportToCSV} from '../../utils/csvExport';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Users, BookOpen, Clock, Download, Calendar, TrendingUp, ArrowUpRight, AlertCircle} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
        const [users, roleCounts, books, activeLoans] = await Promise.all([
            getUsersCount(),
            getRoleCounts(),
            getBooksCount(),
            getActiveLoansCount()
        ]);
        
        const endDate = new Date();
        const startDate = new Date();
        if (dateRange === '7d') startDate.setDate(endDate.getDate() - 7);
        else if (dateRange === '30d') startDate.setDate(endDate.getDate() - 30);
        
        const loans = await getLoansWithDateFilter(startDate, endDate);
        
        setStats({users, roleCounts, books, activeLoans, loans});
    } catch (e) {
        setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
    } finally {
        setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-blue-900 font-bold">Analitika yuklanmoqda...</div>;
  if (error) return <div className="p-8 text-red-600 font-bold">{error}</div>;

  const chartData = {
    labels: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
    datasets: [{
        label: 'Kreditlar', 
        data: [12, 18, 9, 15, 20, 5, 2], 
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderRadius: 8,
    }]
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                <Users size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Foydalanuvchilar</p>
                <p className="text-3xl font-black text-gray-900">{stats.users}</p>
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                    <ArrowUpRight size={12} /> +12%
                </div>
            </div>
        </Card>
        
        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <TrendingUp size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Talabalar</p>
                <p className="text-3xl font-black text-gray-900">{stats.roleCounts.student}</p>
                <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold mt-1">
                    <ArrowUpRight size={12} /> +5%
                </div>
            </div>
        </Card>

        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                <BookOpen size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Kitoblar fondi</p>
                <p className="text-3xl font-black text-gray-900">{stats.books}</p>
                <div className="flex items-center gap-1 text-[10px] text-purple-600 font-bold mt-1">
                    <Badge variant="blue" className="text-[8px] py-0">Yangilandi</Badge>
                </div>
            </div>
        </Card>

        <Card className="flex items-center gap-6 p-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Clock size={28} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faol kreditlar</p>
                <p className="text-3xl font-black text-gray-900">{stats.activeLoans}</p>
                <div className="flex items-center gap-1 text-[10px] text-orange-600 font-bold mt-1">
                    <AlertCircle size={12} className="hidden" /> Hozirda
                </div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Calendar className="text-blue-600" /> Haftalik faollik
                </h3>
            </div>
            <div className="h-[400px] flex items-end">
                <Bar 
                    data={chartData} 
                    options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { 
                            y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                            x: { grid: { display: false } }
                        }
                    }} 
                />
            </div>
        </Card>
        
        <Card>
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                <Users className="text-blue-600" /> Rollar taqsimoti
            </h3>
            <div className="space-y-6">
                {Object.entries(stats.roleCounts).map(([role, count]: [any, any]) => (
                    <div key={role} className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                            <span className="capitalize text-gray-600">{role}</span>
                            <span className="text-gray-900">{count}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                    role === 'student' ? 'bg-green-500' : 
                                    role === 'librarian' ? 'bg-blue-500' : 
                                    role === 'tutor' ? 'bg-indigo-500' : 'bg-red-500'
                                }`} 
                                style={{width: `${(count / stats.users) * 100}%`}}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
      </div>
    </div>
  );
}
