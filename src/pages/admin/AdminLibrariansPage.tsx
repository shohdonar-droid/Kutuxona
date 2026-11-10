import {useEffect, useState} from 'react';
import {getUsersByRole, adminCreateUser, UserProfile} from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Plus, Search, UserPlus, Mail, Phone, Shield} from 'lucide-react';

export default function AdminLibrariansPage() {
  const [librarians, setLibrarians] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({email: '', password: '', fullName: '', phone: ''});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchLibrarians();
  }, []);

  const fetchLibrarians = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole('librarian');
      setLibrarians(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminCreateUser({...formData, role: 'librarian'});
      setShowForm(false);
      setFormData({email: '', password: '', fullName: '', phone: ''});
      fetchLibrarians();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Kutubxonachilar" 
        subtitle="Tizim kutubxonachilarini boshqarish va yangi hisob yaratish."
        actions={
            <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={18} /> {showForm ? 'Bekor qilish' : 'Yangi kutubxonachi'}
            </Button>
        }
      />

      {showForm && (
        <Card className="max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus className="text-blue-600" /> Yangi hisob yaratish</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">F.I.Sh.</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Masalan: Aliev Ali"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email</label>
                    <input 
                        type="email" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="email@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Parol</label>
                    <input 
                        type="password" required minLength={6}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="••••••"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Telefon</label>
                    <input 
                        type="tel"
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        placeholder="+998"
                    />
                </div>
                <div className="md:col-span-2 pt-4">
                    <Button type="submit" className="w-full justify-center py-4 text-lg shadow-lg shadow-blue-900/20" disabled={submitting}>
                        {submitting ? 'Yaratilmoqda...' : 'Hisobni yaratish'}
                    </Button>
                </div>
            </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Kutubxonachi</th>
                          <th className="px-6 py-4">Kontakt</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">Yuklanmoqda...</td></tr>
                      ) : librarians.length === 0 ? (
                          <tr><td colSpan={4} className="p-10 text-center text-gray-400 italic">Kutubxonachilar topilmadi.</td></tr>
                      ) : librarians.map(lib => (
                          <tr key={lib.uid} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                          {lib.fullName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-gray-900">{lib.fullName}</p>
                                          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                              <Shield size={10} /> Kutubxonachi
                                          </div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium italic"><Mail size={12} className="text-gray-300" /> {lib.email}</div>
                                  {lib.phone && <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><Phone size={12} className="text-gray-300" /> {lib.phone}</div>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={lib.isActive ? 'green' : 'red'}>{lib.isActive ? 'Aktiv' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-xs font-bold text-blue-600 hover:underline">Tahrirlash</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
}
