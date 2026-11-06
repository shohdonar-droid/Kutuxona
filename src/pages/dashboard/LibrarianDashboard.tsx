import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {getBookCopyStats} from '../../services/bookCopyService';
import {LayoutDashboard, QrCode, BookOpen, BookCheck, Users, Search, BarChart3, Bell, Settings} from 'lucide-react';

export default function LibrarianDashboard() {
  const [stats, setStats] = useState({total: 0, available: 0, borrowed: 0, overdue: 0, damaged: 0, lost: 0, repair: 0});

  useEffect(() => {
    getBookCopyStats().then(setStats);
  }, []);

  const menuItems = [
    {name: 'QR Skaner', path: '/librarian/scanner', icon: QrCode, color: 'bg-blue-600'},
    {name: 'Kitob berish', path: '/librarian/loans/issue', icon: BookOpen, color: 'bg-green-600'},
    {name: 'Kitob qaytarish', path: '/librarian/loans/return', icon: BookCheck, color: 'bg-yellow-600'},
    {name: 'Kitoblar fondi', path: '/librarian/books', icon: BookOpen, color: 'bg-indigo-600'},
    {name: 'Talabalar', path: '/admin/students', icon: Users, color: 'bg-purple-600'},
    {name: 'Analitika', path: '/admin/analytics', icon: BarChart3, color: 'bg-teal-600'},
    {name: 'Bildirishnomalar', path: '/student/notifications', icon: Bell, color: 'bg-pink-600'},
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Kutubxonachi Ishchi Paneli</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border p-4 rounded shadow bg-white border-l-4 border-blue-500">
            <h3 className="text-gray-500">Jami nusxa</h3>
            <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="border p-4 rounded shadow bg-white border-l-4 border-green-500">
            <h3 className="text-gray-500">Mavjud</h3>
            <p className="text-2xl font-bold">{stats.available}</p>
        </div>
        <div className="border p-4 rounded shadow bg-white border-l-4 border-yellow-500">
            <h3 className="text-gray-500">Talabalarda</h3>
            <p className="text-2xl font-bold">{stats.borrowed}</p>
        </div>
        <div className="border p-4 rounded shadow bg-white border-l-4 border-red-500">
            <h3 className="text-gray-500">Muddati o‘tgan</h3>
            <p className="text-2xl font-bold">{stats.overdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path} className={`${item.color} text-white p-6 rounded-lg shadow-lg flex items-center space-x-4 hover:opacity-90 transition`}>
            <item.icon size={32} />
            <span className="text-lg font-semibold">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
