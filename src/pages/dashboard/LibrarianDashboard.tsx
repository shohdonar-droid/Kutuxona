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
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Kutubxonachi Ishchi Paneli</h1>
        <p className="text-gray-500">Kutubxona faoliyatini boshqarish va monitoring</p>
      </header>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {[
          {title: 'Jami nusxa', value: stats.total, color: 'border-blue-500'},
          {title: 'Mavjud', value: stats.available, color: 'border-green-500'},
          {title: 'Talabalarda', value: stats.borrowed, color: 'border-yellow-500'},
          {title: 'Muddati o‘tgan', value: stats.overdue, color: 'border-red-500'}
        ].map(stat => (
          <div key={stat.title} className={`bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 ${stat.color}`}>
            <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Link key={item.name} to={item.path} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 hover:border-blue-200 hover:shadow-md transition group">
            <div className={`${item.color} p-3 rounded-lg text-white`}>
              <item.icon size={24} />
            </div>
            <span className="text-lg font-medium text-gray-700 group-hover:text-blue-900">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
