import {useEffect, useState} from 'react';
import {getUsersByRole, adminCreateUser, UserProfile} from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Plus, UserPlus, Mail, Phone, Users} from 'lucide-react';

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({email: '', password: '', fullName: '', phone: ''});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTutors();
  }, []);

  const fetchTutors = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole('tutor');
      setTutors(data);
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
      await adminCreateUser({...formData, role: 'tutor'});
      setShowForm(false);
      setFormData({email: '', password: '', fullName: '', phone: ''});
      fetchTutors();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Tyutorlar" 
        subtitle="O'qituvchilar va guruh murabbiylari ro'yxati."
        actions={
            <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={18} /> {showForm ? 'Bekor qilish' : 'Yangi tyutor'}
            </Button>
        }
      />

      {showForm && (
        <Card className="max-w-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus className="text-blue-600" /> Yangi tyutor hisobi</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">F.I.Sh.</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="Ism Familiya"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email</label>
                    <input 
                        type="email" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="tutor@tdtu.uz"
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
                        {submitting ? 'Yaratilmoqda...' : 'Tyutorni saqlash'}
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
                          <th className="px-6 py-4">Tyutor</th>
                          <th className="px-6 py-4">Guruhlar</th>
                          <th className="px-6 py-4">Kontakt</th>
                          <th className="px-6 py-4 text-center">Holat</th>
                          <th className="px-6 py-4 text-right">Boshqaruv</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Yuklanmoqda...</td></tr>
                      ) : tutors.length === 0 ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Tyutorlar topilmadi.</td></tr>
                      ) : tutors.map(tutor => (
                          <tr key={tutor.uid} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                          {tutor.fullName.charAt(0)}
                                      </div>
                                      <p className="text-sm font-bold text-gray-900">{tutor.fullName}</p>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-1 text-xs font-bold text-gray-500">
                                      <Users size={14} className="text-gray-300" /> {tutor.groupIds?.length || 0} ta guruh
                                  </div>
                              </td>
                              <td className="px-6 py-4 space-y-1">
                                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><Mail size={12} className="text-gray-300" /> {tutor.email}</div>
                                  {tutor.phone && <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><Phone size={12} className="text-gray-300" /> {tutor.phone}</div>}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={tutor.isActive ? 'green' : 'yellow'}>{tutor.isActive ? 'Aktiv' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-xs font-bold text-blue-600 hover:underline">Guruhlarni biriktirish</button>
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
