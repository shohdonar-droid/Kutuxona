import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getBookCopyStats} from '../../services/bookCopyService';
import {getLoans} from '../../services/loanService';
import {getReservations} from '../../services/reservationService';
import {QrCode, BookOpen, BookCheck, Users, BarChart3, Bell, ArrowRight, ArrowLeftRight, PlusCircle, AlertTriangle, Clock, ClipboardList} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import {StatCard, Card, Badge, Button} from '../../components/UIComponents';

export default function LibrarianDashboard() {
  const [stats, setStats] = useState({total: 0, available: 0, borrowed: 0, overdue: 0});
  const [recentLoans, setRecentLoans] = useState<any[]>([]);
  const [activeReservations, setActiveReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [copyStats, allLoans, allReservations] = await Promise.all([
            getBookCopyStats(),
            getLoans(''), // passing empty to get all if service allows, or I should audit loanService
            getReservations('')
        ]);
        setStats(copyStats);
        
        // Filter recent loans (last 5)
        setRecentLoans(allLoans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5));
        
        // Filter active reservations (waiting)
        setActiveReservations(allReservations.filter(r => r.status === 'PENDING').slice(0, 5));
      } catch (err) {
        console.error("Error fetching librarian dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const quickActions = [
    {name: 'Kitob berish', path: '/librarian/loans/issue', icon: ArrowLeftRight, color: 'text-green-600', bg: 'bg-green-50', desc: 'Talabaga kitob rasmiylashtirish'},
    {name: 'Kitob qaytarish', path: '/librarian/loans/return', icon: ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-50', desc: 'Qabul qilingan kitoblarni yopish'},
    {name: 'QR Skaner', path: '/librarian/scanner', icon: QrCode, color: 'text-orange-600', bg: 'bg-orange-50', desc: 'Kitob nusxasini tezkor aniqlash'},
    {name: 'Yangi kitob', path: '/admin/books', icon: PlusCircle, color: 'text-purple-600', bg: 'bg-purple-50', desc: 'Fondga yangi adabiyot qo‘shish'},
  ];

  if (loading) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Kutubxona boshqaruvi</h1>
        <p className="text-gray-500 mt-2 font-medium">Bugungi kutubxona faoliyatini nazorat qiling va operatsiyalarni bajaring.</p>
      </div>
      
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Jami nusxalar" value={stats.total} icon={BookOpen} color="text-blue-600" />
        <StatCard title="Mavjud" value={stats.available} icon={BookCheck} color="text-green-600" />
        <StatCard title="Talabalarda" value={stats.borrowed} icon={Users} color="text-yellow-600" />
        <StatCard title="Muddati o‘tgan" value={stats.overdue} icon={AlertTriangle} color="text-red-600" />
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Tezkor amallar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
                <Link key={action.name} to={action.path} className="group">
                    <Card className="hover:border-blue-200 hover:shadow-md transition-all h-full flex flex-col justify-between">
                        <div className="flex flex-col gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                <action.icon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{action.name}</h3>
                                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{action.desc}</p>
                            </div>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Operations */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Bugungi operatsiyalar</h2>
                <Link to="/librarian/reports" className="text-blue-600 hover:underline text-sm font-medium">Barchasi</Link>
            </div>
            
            <Card className="p-0 overflow-hidden">
                {recentLoans.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Talaba</th>
                                    <th className="px-6 py-4">Kitob</th>
                                    <th className="px-6 py-4">Sana</th>
                                    <th className="px-6 py-4">Holat</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentLoans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{loan.studentName || 'F.I.Sh.'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{loan.bookTitle || 'Kitob nomi'}</td>
                                        <td className="px-6 py-4 text-xs text-gray-400">{new Date(loan.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <Badge variant={loan.status === 'ACTIVE' ? 'blue' : 'green'}>
                                                {loan.status === 'ACTIVE' ? 'Olingan' : 'Qaytarilgan'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <ClipboardList size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-medium">Bugun hali operatsiyalar bajarilmadi.</p>
                    </div>
                )}
            </Card>
        </div>

        {/* Reservations & Overdue alerts */}
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Kutilayotgan bronlar</h2>
                    <Link to="/librarian/reservations" className="text-blue-600 hover:underline text-xs font-medium">Barchasi</Link>
                </div>
                <div className="space-y-3">
                    {activeReservations.length > 0 ? activeReservations.map(res => (
                        <div key={res.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:border-blue-100 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <Badge variant="yellow"># {res.queuePosition || 1}</Badge>
                                <span className="text-[10px] text-gray-400 font-medium">{new Date(res.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{res.bookTitle || 'Kitob nomi'}</p>
                            <p className="text-xs text-gray-500 mt-1">{res.studentName || 'Talaba F.I.Sh.'}</p>
                        </div>
                    )) : (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                             <p className="text-xs text-gray-400 font-medium italic">Faol bronlar yo‘q.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-red-900 text-white rounded-2xl shadow-xl shadow-red-900/20">
                <div className="flex items-center gap-3 mb-4 text-red-200">
                    <AlertTriangle size={20} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Muddati o‘tganlar</h3>
                </div>
                <div className="space-y-4">
                    <div>
                        <p className="text-3xl font-black">{stats.overdue}</p>
                        <p className="text-xs text-red-200/70 font-medium mt-1">ta kitob qaytarilishi kerak</p>
                    </div>
                    <Link to="/librarian/overdue">
                        <Button variant="secondary" className="w-full justify-center bg-white/10 hover:bg-white/20 text-white border-0 py-2.5 mt-2">
                            Ro‘yxatni ko‘rish
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
