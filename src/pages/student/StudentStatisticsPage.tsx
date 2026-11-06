import {useEffect, useState, useMemo} from 'react';
import {useAuth} from '../../context/AuthContext';
import {getReadingProgresses, ReadingProgress, getReadingSessions, ReadingSession, MIN_READING_SECONDS} from '../../services/readingService';
import {getStudentLoans, Loan} from '../../services/loanService';
import {getUserFavorites} from '../../services/favoriteService';
import {getReservations, Reservation} from '../../services/reservationService';
import {Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend} from 'chart.js';
import {Bar} from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StudentStatisticsPage() {
  const {user} = useAuth();
  const [stats, setStats] = useState({completed: 0, inProgress: 0, favorites: 0, physical: 0, overdue: 0, reservations: 0, totalTime: 0, viewed: 0});
  const [progressData, setProgressData] = useState<ReadingProgress[]>([]);

  useEffect(() => {
    if (user) {
      Promise.all([
        getReadingProgresses(user.uid),
        getStudentLoans(user.uid),
        getUserFavorites(user.uid),
        getReservations(user.uid),
        getReadingSessions(user.uid)
      ]).then(([progresses, loans, favorites, reservations, sessions]) => {
        const completed = progresses.filter(p => p.status === 'COMPLETED').length;
        const inProgress = progresses.filter(p => p.status === 'IN_PROGRESS').length;
        // Only count meaningful sessions
        const totalTime = sessions.filter(s => s.durationSeconds >= MIN_READING_SECONDS).reduce((sum, s) => sum + s.durationSeconds, 0);
        
        setStats({
          completed,
          inProgress,
          viewed: progresses.length,
          favorites: favorites.length,
          physical: loans.filter(l => l.status === 'ACTIVE').length,
          overdue: loans.filter(l => l.status === 'OVERDUE').length,
          reservations: reservations.filter(r => r.status === 'PENDING' || r.status === 'READY').length,
          totalTime
        });
        setProgressData(progresses);
      });
    }
  }, [user]);

  const chartData = useMemo(() => ({
    labels: ['0-25%', '26-50%', '51-75%', '76-99%', '100%'],
    datasets: [{
      label: 'Progress Distribution',
      data: [
        progressData.filter(p => p.progressPercent <= 25).length,
        progressData.filter(p => p.progressPercent > 25 && p.progressPercent <= 50).length,
        progressData.filter(p => p.progressPercent > 50 && p.progressPercent <= 75).length,
        progressData.filter(p => p.progressPercent > 75 && p.status === 'IN_PROGRESS').length,
        progressData.filter(p => p.status === 'COMPLETED').length,
      ],
      backgroundColor: 'rgba(54, 162, 235, 0.5)',
    }]
  }), [progressData]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours > 0 ? hours + ' soat ' : ''}${minutes} daqiqa`;
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Shaxsiy Statistika</h1>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="border p-4 rounded shadow bg-blue-50"><h3>Tugatilgan</h3><p className="text-xl font-bold">{stats.completed}</p></div>
        <div className="border p-4 rounded shadow bg-green-50"><h3>O‘qilmoqda</h3><p className="text-xl font-bold">{stats.inProgress}</p></div>
        <div className="border p-4 rounded shadow"><h3>Ko‘rilgan</h3><p className="text-xl font-bold">{stats.viewed}</p></div>
        <div className="border p-4 rounded shadow"><h3>Sevimlilar</h3><p className="text-xl font-bold">{stats.favorites}</p></div>
        <div className="border p-4 rounded shadow"><h3>O‘qish vaqti</h3><p className="text-xl font-bold">{formatTime(stats.totalTime)}</p></div>
        <div className="border p-4 rounded shadow"><h3>Fizik kitoblar</h3><p className="text-xl font-bold">{stats.physical}</p></div>
        <div className="border p-4 rounded shadow bg-red-50"><h3>Muddati o‘tgan</h3><p className="text-xl font-bold">{stats.overdue}</p></div>
        <div className="border p-4 rounded shadow"><h3>Rezervatsiyalar</h3><p className="text-xl font-bold">{stats.reservations}</p></div>
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-2">O‘qish progressi taqsimoti</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
}
