import React from 'react';
import {Link} from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <header className="relative bg-blue-900 text-white p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
        <div className="relative z-10 max-w-4xl">
          <h1 className="text-5xl font-bold mb-4">TDTU Chirchiq filiali Elektron kutubxonasi</h1>
          <p className="text-xl mb-8">Bilim olish – eng yaxshi investitsiya!</p>
          <div className="flex bg-white rounded-lg p-2 shadow-lg">
            <input type="text" placeholder="Kitob nomi, muallif yoki mavzu bo'yicha qidirish..." className="flex-grow p-3 text-gray-900 outline-none" />
            <button className="bg-blue-600 text-white px-8 py-3 rounded-md font-semibold">Qidirish</button>
          </div>
        </div>
      </header>

      {/* Categories */}
      <nav className="flex justify-center gap-4 p-6 bg-white shadow-sm flex-wrap">
        {[
            {name: 'Darsliklar', icon: '📚'}, {name: 'O\'quv qo\'llanmalar', icon: '📝'}, 
            {name: 'Ilmiy adabiyotlar', icon: '🔬'}, {name: 'Jadvallar', icon: '📊'}, 
            {name: 'Jurnallar', icon: '📰'}, {name: 'Badiiy adabiyotlar', icon: '🎭'}
        ].map(cat => (
          <button key={cat.name} className="flex flex-col items-center gap-2 p-4 w-28 hover:bg-blue-50 rounded-lg transition text-gray-700 hover:text-blue-900">
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-xs font-semibold text-center">{cat.name}</span>
          </button>
        ))}
      </nav>

      {/* Content Grid */}
      <main className="p-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <section className="md:col-span-2">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">Mashhur kitoblar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {[
                    {title: 'Anatomiya', author: 'G\'ofurov A.', img: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=300&auto=format&fit=crop'},
                    {title: 'Farmakologiya', author: 'Raximov A.', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300&auto=format&fit=crop'},
                    {title: 'Ichki kasalliklar', author: 'Karimov B.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=300&auto=format&fit=crop'}
                ].map((book, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
                        <img src={book.img} alt={book.title} className="w-full h-40 object-cover rounded-lg mb-4" />
                        <h4 className="font-bold text-lg">{book.title}</h4>
                        <p className="text-gray-500 text-sm">{book.author}</p>
                    </div>
                ))}
            </div>
        </section>
        
        <aside className="space-y-6">
            <div className="bg-blue-600 p-8 rounded-2xl text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Yangi bilimlar sari bir qadam!</h3>
                <p className="mb-6 opacity-90">Elektron kutubxonamiz siz uchun!</p>
                <Link to="/login" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold">Kirish</Link>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4">Mashhur yo‘nalishlar</h3>
                <ul className="space-y-3">
                    {['Tibbiyot', 'Farmakologiya', 'Pediatriya', 'Jarrohlik'].map(n => <li key={n} className="text-gray-700 hover:text-blue-600 cursor-pointer">→ {n}</li>)}
                </ul>
            </div>
        </aside>
      </main>
    </div>
  );
}
