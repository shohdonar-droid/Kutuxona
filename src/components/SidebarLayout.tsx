import {Link, Outlet, useLocation} from 'react-router-dom';
import {LayoutDashboard, Users, BookOpen, BookCheck, ShieldAlert, BarChart3, Settings, LogOut} from 'lucide-react';
import {useAuth} from '../context/AuthContext';

export default function SidebarLayout() {
  const {profile} = useAuth();
  const location = useLocation();

  const getMenuItems = () => {
    if (!profile) return [];
    const baseItems = [
      {name: 'Dashboard', path: `/${profile.role}`, icon: LayoutDashboard},
    ];

    if (profile.role === 'admin') {
      return [
        ...baseItems,
        {name: 'Analitika', path: '/admin/analitika', icon: BarChart3},
        {name: 'Foydalanuvchilar', path: '/admin/users', icon: Users},
        {name: 'Kitoblar', path: '/admin/books', icon: BookOpen},
        {name: 'Audit', path: '/admin/audit', icon: ShieldAlert},
        {name: 'Sozlamalar', path: '/admin/settings', icon: Settings},
      ];
    }
    // Add other roles as needed
    return baseItems;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white p-6 hidden md:block">
        <h1 className="text-xl font-bold mb-10">TDTU Chirchiq</h1>
        <nav className="space-y-4">
          {getMenuItems().map(item => (
            <Link key={item.name} to={item.path} className={`flex items-center space-x-3 p-3 rounded-lg ${location.pathname === item.path ? 'bg-blue-800' : 'hover:bg-blue-800'}`}>
              <item.icon size={20} />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
