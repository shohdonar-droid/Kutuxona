import React from 'react';
import {Link} from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="bg-blue-900 text-white p-8">
        <h1 className="text-4xl font-bold mb-4">TDTU Chirchiq filiali Elektron kutubxonasi</h1>
        <p className="text-xl mb-6">Bilim olish – eng yaxshi investitsiya!</p>
        <div className="relative max-w-2xl">
          <input type="text" placeholder="Kitob nomi, muallif yoki mavzu bo'yicha qidirish..." className="w-full p-4 rounded-lg text-gray-900" />
          <button className="absolute right-2 top-2 bg-blue-600 text-white px-6 py-2 rounded-lg">Qidirish</button>
        </div>
      </header>

      {/* Categories */}
      <nav className="flex justify-around p-4 bg-white shadow-sm">
        {['Darsliklar', 'O\'quv qo\'llanmalar', 'Ilmiy adabiyotlar', 'Jadvallar', 'Jurnallar', 'Badiiy adabiyotlar', 'Boshqa kitoblar'].map(cat => (
          <button key={cat} className="text-gray-700 hover:text-blue-900 font-semibold">{cat}</button>
        ))}
      </nav>

      {/* Content Grid */}
      <main className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <section className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Mashhur kitoblar</h2>
            <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map(i => <div key={i} className="bg-white p-4 rounded shadow">Kitob {i}</div>)}
            </div>
        </section>
        <aside className="bg-blue-100 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-2">Yangi bilimlar sari bir qadam!</h3>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg">Kirish</button>
        </aside>
      </main>
    </div>
  );
}
