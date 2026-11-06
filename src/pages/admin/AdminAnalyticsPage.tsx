import {useEffect, useState} from 'react';
import {collection, getDocs, query, where, Timestamp} from 'firebase/firestore';
import {db} from '../../firebase';
import {getUsersCount, getRoleCounts} from '../../services/userService';
import {getBooksCount} from '../../services/bookService';
import {getActiveLoansCount, getLoansWithDateFilter} from '../../services/loanService';
import {Bar} from 'react-chartjs-2';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import {exportToCSV} from '../../utils/csvExport';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState('7d'); // 'today', '7d', '30d'

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
        
        // Date filtering logic for other analytics
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

  if (loading) return <div className="p-8">Yuklanmoqda...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!stats) return <div className="p-8">Ma'lumot mavjud emas.</div>;

  const chartData = {
    labels: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'],
    datasets: [{label: 'Kreditlar', data: [12, 18, 9, 15, 20, 5, 2], backgroundColor: 'rgba(59, 130, 246, 0.5)'}]
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Analitika Markazi</h1>
        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="p-2 border rounded">
            <option value="today">Bugun</option>
            <option value="7d">Oxirgi 7 kun</option>
            <option value="30d">Oxirgi 30 kun</option>
        </select>
        <button onClick={() => exportToCSV(stats.loans, 'loans')} className="bg-green-600 text-white p-2 rounded">CSV Eksport</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h3>Foydalanuvchilar</h3><p className="text-3xl font-bold">{stats.users}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h3>Talabalar</h3><p className="text-3xl font-bold">{stats.roleCounts.student}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h3>Kitoblar</h3><p className="text-3xl font-bold">{stats.books}</p></div>
        <div className="bg-white p-6 rounded-xl shadow-sm border"><h3>Faol kreditlar</h3><p className="text-3xl font-bold">{stats.activeLoans}</p></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <Bar data={chartData} />
      </div>
    </div>
  );
}
