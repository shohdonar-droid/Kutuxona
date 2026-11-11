import {Link, Outlet, useLocation} from 'react-router-dom';
import {useState} from 'react';
import {
  LayoutDashboard, Users, BookOpen, BookCheck, ShieldAlert, BarChart3, Settings, LogOut,
  Home, Book, Bookmark, History, Bell, User, BookOpenText, Package, QrCode, ArrowLeftRight,
  PlusCircle, AlertTriangle, FileText, GraduationCap, Building2, ClipboardList, Heart, Tag, Search
} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import {auth} from '../firebase';

export default function SidebarLayout() {
  const {profile} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const isUserRoute = location.pathname.includes('/admin/librarians') || 
                     location.pathname.includes('/admin/tutors') || 
                     location.pathname.includes('/admin/students') ||
                     location.pathname.includes('/admin/users');

  const [userMenuOpen, setUserMenuOpen] = useState(isUserRoute);

  const getMenuItems = () => {
    if (!profile) return [];
    
    if (profile.role === 'admin') {
      return [
        { section: 'BOSHQRUV' },
        { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
        { 
            name: 'Foydalanuvchilar', 
            icon: Users,
            submenu: [
                { name: 'Kutubxonachilar', path: '/admin/librarians', icon: BookOpenText },
                { name: 'Tyutorlar', path: '/admin/tutors', icon: User },
                { name: 'Talabalar', path: '/admin/students', icon: GraduationCap },
            ]
        },
        { name: 'Guruhlar', path: '/admin/groups', icon: Building2 },
        
        { section: 'KUTUBXONA' },
        { name: 'Kitoblar', path: '/admin/books', icon: BookOpen },
        { name: 'Kategoriyalar', path: '/admin/categories', icon: Tag },
        { name: 'Fizik nusxalar', path: '/admin/copies', icon: Package },
        { name: 'Berilganlar', path: '/admin/loans', icon: ArrowLeftRight },
        { name: 'Bronlar', path: '/admin/reservations', icon: BookCheck },
        
        { section: 'TAHLIL' },
        { name: 'Analitika', path: '/admin/analitika', icon: BarChart3 },
        { name: 'Hisobotlar', path: '/admin/reports', icon: FileText },
        
        { section: 'TIZIM' },
        { name: 'Audit loglari', path: '/admin/audit', icon: ShieldAlert },
        { name: 'Sozlamalar', path: '/admin/settings', icon: Settings },
      ];
    }
    
    if (profile.role === 'librarian') {
      return [
        { name: 'Bosh sahifa', path: '/librarian', icon: LayoutDashboard },
        
        { section: 'FOND' },
        { name: 'Kitoblar fondi', path: '/librarian/books', icon: BookOpen },
        { name: 'Kategoriyalar', path: '/admin/categories', icon: Tag },
        { name: 'Kitob nusxalari', path: '/librarian/copies', icon: Package },
        { name: 'Kitob qo‘shish', path: '/admin/books', icon: PlusCircle },
        
        { section: 'OPERATSIYALAR' },
        { name: 'Kitob berish', path: '/librarian/loans/issue', icon: ArrowLeftRight },
        { name: 'Kitob qaytarish', path: '/librarian/loans/return', icon: ArrowLeftRight },
        { name: 'Skaner', path: '/librarian/scanner', icon: QrCode },
        
        { section: 'NAZORAT' },
        { name: 'Bronlar', path: '/librarian/reservations', icon: BookCheck },
        { name: 'Muddati o‘tganlar', path: '/librarian/overdue', icon: AlertTriangle },
        { name: 'Talabalar', path: '/admin/students', icon: GraduationCap },
        
        { section: 'HISOBOT' },
        { name: 'Hisobotlar', path: '/librarian/reports', icon: FileText },
        { name: 'Bildirishnomalar', path: '/student/notifications', icon: Bell },
      ];
    }
    
    if (profile.role === 'tutor') {
      return [
        { name: 'Bosh sahifa', path: '/tutor', icon: LayoutDashboard },
        
        { section: 'MONITORING' },
        { name: 'Mening guruhlarim', path: '/tutor/groups', icon: Building2 },
        { name: 'Talabalar', path: '/tutor/students', icon: GraduationCap },
        { name: 'Kitob faolligi', path: '/tutor/activity', icon: BookOpen },
        { name: 'O‘qish statistikasi', path: '/tutor/statistics', icon: BarChart3 },
        { name: 'Faolligi pastlar', path: '/tutor/low-activity', icon: AlertTriangle },
        
        { section: 'HISOBOT' },
        { name: 'Hisobotlar', path: '/tutor/reports', icon: FileText },
        { name: 'Bildirishnomalar', path: '/student/notifications', icon: Bell },
      ];
    }
    
    if (profile.role === 'student') {
      return [
        { section: 'ASOSIY' },
        { name: 'Bosh sahifa', path: '/student', icon: Home },
        { name: 'Kitoblar', path: '/books', icon: Book },
        
        { section: 'MENING KUTUBXONAM' },
        { name: 'Sevimlilar', path: '/student/favorites', icon: Heart },
        { name: 'O‘qish tarixi', path: '/student/reading-history', icon: History },
        { name: 'Mening kitoblarim', path: '/student/my-books', icon: BookOpen },
        { name: 'Bronlarim', path: '/student/reservations', icon: Bookmark },
        
        { section: 'FAOLIYAT' },
        { name: 'Mening statistikam', path: '/student/statistics', icon: BarChart3 },
        { name: 'Bildirishnomalar', path: '/student/notifications', icon: Bell },
      ];
    }
    return [];
  };

  if (!profile) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:block flex flex-col shrink-0 overflow-y-auto h-screen sticky top-0">
        <h1 className="text-xl font-bold mb-10 text-center tracking-wider text-white">TDTU CHIRCHIQ</h1>
        <nav className="space-y-1 flex-1">
          {getMenuItems().map((item: any, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="text-xs font-semibold text-blue-300 mt-6 mb-2 px-3 uppercase tracking-widest">
                  {item.section}
                </div>
              );
            }
            
            if (item.submenu) {
                return (
                    <div key={idx} className="space-y-1">
                        <button 
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors hover:bg-blue-800/50 text-blue-100`}
                        >
                            <div className="flex items-center space-x-3">
                                <item.icon size={18} className="text-blue-300" />
                                <span className="text-sm font-medium">{item.name}</span>
                            </div>
                            <PlusCircle size={14} className={`transition-transform ${userMenuOpen ? 'rotate-45 text-white' : 'text-blue-400'}`} />
                        </button>
                        {userMenuOpen && (
                            <div className="pl-6 space-y-1">
                                {item.submenu.map((sub: any) => (
                                    <Link
                                        key={sub.path}
                                        to={sub.path}
                                        className={`flex items-center space-x-3 p-2.5 rounded-lg transition-colors ${
                                            location.pathname === sub.path ? 'bg-blue-800 text-white shadow-sm' : 'hover:bg-blue-800/40 text-blue-200'
                                        }`}
                                    >
                                        <sub.icon size={14} className={location.pathname === sub.path ? 'text-white' : 'text-blue-400'} />
                                        <span className="text-xs font-medium">{sub.name}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                  location.pathname === item.path ? 'bg-blue-800 text-white shadow-sm' : 'hover:bg-blue-800/50 text-blue-100'
                }`}
              >
                <item.icon size={18} className={location.pathname === item.path ? 'text-white' : 'text-blue-300'} />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="mt-8 pt-8 border-t border-blue-800 space-y-1">
            <Link to={`/${profile.role}/profile`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition text-blue-100">
                <User size={18} className="text-blue-300" />
                <span className="text-sm font-medium">Profil</span>
            </Link>
            <Link to={`/${profile.role}/settings`} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-blue-800 transition text-blue-100">
                <Settings size={18} className="text-blue-300" />
                <span className="text-sm font-medium">Sozlamalar</span>
            </Link>
            <button
                onClick={() => auth.signOut()}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-red-900/30 transition text-red-200 mt-2 text-left"
            >
                <LogOut size={18} />
                <span className="text-sm font-medium">Chiqish</span>
            </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center gap-8">
                <div className="text-sm text-gray-500 font-medium hidden lg:block">
                    {location.pathname.split('/').filter(Boolean).map((p, i) => (
                        <span key={p}>
                            <span className="capitalize">{p}</span>
                            {i < location.pathname.split('/').filter(Boolean).length - 1 && <span className="mx-2 text-gray-300">/</span>}
                        </span>
                    ))}
                </div>
                
                <div className="relative group min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Kitob qidirish..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-200 outline-none transition-all text-sm font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                navigate(`/books?q=${encodeURIComponent(searchQuery)}`);
                                setSearchQuery('');
                            }
                        }}
                    />
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex flex-col text-right mr-2">
                    <span className="text-sm font-bold text-gray-900 leading-none">{profile.fullName}</span>
                    <span className="text-xs text-gray-500 uppercase font-semibold mt-1 tracking-tighter">{profile.role}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200 shadow-sm">
                    {profile.fullName.charAt(0)}
                </div>
            </div>
        </div>
        <div className="p-0">
            <Outlet />
        </div>
      </main>
    </div>
  );
}
