import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {LayoutDashboard, Users, BookOpen, BarChart3, Settings, ShieldAlert, FileText} from 'lucide-react';
// Import services if needed for stats.
// Assuming services exist or creating minimal placeholders.

export default function AdminDashboard() {
  // Replace with real data fetching hooks
  const stats = {
    users: 150,
    students: 120,
    books: 300,
    activeLoans: 45
  };

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Boshqaruv markazi</h1>
        <p className="text-gray-500">Tizimning umumiy holati va analitika</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          {title: 'Foydalanuvchilar', value: stats.users, icon: Users, color: 'text-blue-600'},
          {title: 'Talabalar', value: stats.students, icon: Users, color: 'text-purple-600'},
          {title: 'Jami kitoblar', value: stats.books, icon: BookOpen, color: 'text-indigo-600'},
          {title: 'Faol qarzlar', value: stats.activeLoans, icon: BookOpen, color: 'text-yellow-600'}
        ].map(stat => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
            <stat.icon className={`w-10 h-10 ${stat.color}`} />
            <div>
              <h3 className="text-sm font-medium text-gray-500">{stat.title}</h3>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4">Tezkor menyu</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Link to="/admin/users" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100">Foydalanuvchilar</Link>
                <Link to="/admin/students" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100">Talabalar</Link>
                <Link to="/admin/books" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100">Kitoblar</Link>
                <Link to="/admin/analytics" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100">Analitika</Link>
                <Link to="/admin/settings" className="p-4 bg-gray-50 rounded-lg text-center hover:bg-gray-100">Sozlamalar</Link>
              </div>
          </section>
          
          <aside className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><ShieldAlert /> Audit</h2>
             <Link to="/admin/audit" className="text-blue-600 hover:underline">Loglarni ko'rish</Link>
          </aside>
      </div>
    </div>
  );
}
