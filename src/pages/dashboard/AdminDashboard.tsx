import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {
  Users, BookOpen, BarChart3, Settings, ShieldAlert, GraduationCap, User, 
  BookOpenText, Package, ArrowLeftRight, BookCheck, AlertTriangle, ArrowRight,
  TrendingUp, Activity, ClipboardList, Tag
} from 'lucide-react';
import {getUsersCount, getStudentsCount} from '../../services/userService';
import {getBooksCount} from '../../services/bookService';
import {getActiveLoansCount} from '../../services/loanService';
import {getBookCopyStats} from '../../services/bookCopyService';
import {StatCard, Card, Badge, Button} from '../../components/UIComponents';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    users: 0, students: 0, tutors: 0, librarians: 0, 
    books: 0, copies: 0, activeLoans: 0, overdue: 0,
    categories: 0, totalCopies: 0
  });
  const [loading, setLoading] = useState(true);

    useEffect(() => {
    const fetchData = async () => {
        try {
            const [users, books, students, activeLoans, categories, copyStats] = await Promise.all([
                getUsersCount(),
                getBooksCount(),
                getStudentsCount(),
                getActiveLoansCount(),
                import('../../services/categoryService').then(m => m.getCategories()),
                getBookCopyStats()
            ]);
            setStats(prev => ({ 
                ...prev, 
                users, students, books, activeLoans,
                categories: categories.length,
                totalCopies: copyStats.total
            }));
        } catch (err) {
            console.error("Error fetching admin dashboard stats:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  const quickActions = [
    { name: 'Kitob qo‘shish', path: '/admin/books', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Kategoriyalar', path: '/admin/categories', icon: Tag, color: 'text-orange-600', bg: 'bg-orange-50' },
    { name: 'Talaba qo‘shish', path: '/admin/students', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { name: 'Guruh boshqarish', path: '/admin/groups', icon: Activity, color: 'text-green-600', bg: 'bg-green-50' },
    { name: 'Tizim Hisoboti', path: '/admin/reports', icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (loading) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Tizim boshqaruvi</h1>
            <p className="text-gray-500 mt-2 font-medium">Elektron kutubxona faoliyatining umumiy holati va nazorati.</p>
        </div>
        <Link to="/admin/analitika">
            <Button variant="primary" className="shadow-lg shadow-blue-900/20">
                <BarChart3 size={18} /> To‘liq analitika
            </Button>
        </Link>
      </div>
      
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard title="Foydalanuvchilar" value={stats.users} icon={Users} color="text-blue-600" />
        <StatCard title="Talabalar" value={stats.students} icon={GraduationCap} color="text-indigo-600" />
        <StatCard title="Kitoblar" value={stats.totalCopies} icon={BookOpen} color="text-emerald-600" />
        <StatCard title="Kategoriyalar" value={stats.categories} icon={Tag} color="text-orange-500" />
        <StatCard title="Faol kreditlar" value={stats.activeLoans} icon={ArrowLeftRight} color="text-pink-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content: Activity & Charts placeholder */}
        <div className="lg:col-span-2 space-y-10">
            {/* Quick Actions Row */}
            <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Tezkor amallar</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {quickActions.map((action) => (
                        <Link key={action.name} to={action.path} className="group">
                            <Card className="p-4 flex flex-col items-center text-center gap-3 hover:border-blue-200 hover:shadow-md transition-all h-full">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.bg} ${action.color} group-hover:scale-110 transition-transform`}>
                                    <action.icon size={20} />
                                </div>
                                <span className="text-xs font-bold text-gray-700 leading-tight group-hover:text-blue-700 transition-colors">{action.name}</span>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Performance Chart Placeholder */}
            <Card className="bg-white p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Tizim faolligi</h2>
                        <p className="text-sm text-gray-400 mt-1">Oxirgi 7 kunlik o'qish va kreditlar statistikasi</p>
                    </div>
                    <select className="bg-gray-50 border-0 rounded-lg px-4 py-2 text-sm font-bold text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none">
                        <option>Oxirgi 7 kun</option>
                        <option>Shu oy</option>
                    </select>
                </div>
                
                <div className="h-64 w-full flex items-end justify-between gap-2 px-2">
                    {[40, 65, 35, 80, 50, 90, 60].map((h, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3">
                            <div className="w-full flex gap-1 justify-center items-end h-48">
                                <div className="w-2 md:w-3 bg-blue-600 rounded-t-sm" style={{ height: `${h}%` }}></div>
                                <div className="w-2 md:w-3 bg-indigo-200 rounded-t-sm" style={{ height: `${h/2}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}
                            </span>
                        </div>
                    ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-50 flex gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="text-xs font-bold text-gray-500">Kitob o'qish</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-indigo-200 rounded-full"></div>
                        <span className="text-xs font-bold text-gray-500">Kreditlar</span>
                    </div>
                </div>
            </Card>
        </div>

        {/* Sidebar: System Status & Audit */}
        <div className="space-y-8">
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">So'nggi faoliyat</h2>
                    <Link to="/admin/audit" className="text-blue-600 hover:underline text-xs font-medium">Barchasi</Link>
                </div>
                <div className="space-y-4">
                    {[
                        { user: 'Kutubxonachi (Aliev)', action: 'Yangi kitob qo‘shildi', time: '5 daqiqa oldin', type: 'success' },
                        { user: 'Admin', action: 'Sozlamalar o‘zgartirildi', time: '1 soat oldin', type: 'info' },
                        { user: 'Tizim', action: 'Xabarnomalar yuborildi', time: '2 soat oldin', type: 'system' }
                    ].map((log, i) => (
                        <div key={i} className="flex gap-4 group">
                            <div className="relative flex flex-col items-center">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 z-10"></div>
                                {i < 2 && <div className="w-0.5 h-full bg-gray-100 absolute top-4"></div>}
                            </div>
                            <div className="pb-4">
                                <p className="text-xs font-bold text-gray-900">{log.user}</p>
                                <p className="text-xs text-gray-500 mt-1">{log.action}</p>
                                <p className="text-[10px] text-gray-400 mt-1 font-medium italic">{log.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Card className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white border-0 shadow-xl shadow-blue-900/20">
                <div className="flex items-center gap-3 mb-6">
                    <ShieldAlert size={20} className="text-blue-300" />
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-200">Tizim holati</h3>
                </div>
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-100">Baza yuklamasi</span>
                        <Badge variant="blue">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-100">Xabarnomalar</span>
                        <Badge variant="green">Aktiv</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-blue-100">Scheduler</span>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase text-green-400">Running</span>
                        </div>
                    </div>
                </div>
                <Link to="/admin/settings" className="block mt-8">
                    <Button variant="secondary" className="w-full justify-center bg-white/10 hover:bg-white/20 text-white border-0 py-2.5">
                        <Settings size={16} /> Tizim sozlamalari
                    </Button>
                </Link>
            </Card>
        </div>
      </div>
    </div>
  );
}
