import {useEffect, useState} from 'react';
import {getGroups, Group} from '../../services/groupService';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Building2, Plus, Users, Search} from 'lucide-react';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getGroups().then(data => {
        setGroups(data);
        setLoading(false);
    });
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Guruhlar boshqaruvi" 
        subtitle="Universitet guruhlari va ularga biriktirilgan tyutorlar."
        actions={
            <Button>
                <Plus size={18} /> Yangi guruh
            </Button>
        }
      />

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
            type="text" 
            placeholder="Guruh nomi bo'yicha qidirish..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Guruh nomi</th>
                          <th className="px-6 py-4">Kodi</th>
                          <th className="px-6 py-4">Tyutorlar</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Yuklanmoqda...</td></tr>
                      ) : groups.length === 0 ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Guruhlar topilmadi.</td></tr>
                      ) : groups.map(g => (
                          <tr key={g.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                          <Building2 size={20} />
                                      </div>
                                      <span className="text-sm font-bold text-gray-900">{g.name}</span>
                                  </div>
                              </td>
                              <td className="px-6 py-4 font-mono text-xs text-gray-500">{g.code}</td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                      <Users size={14} className="text-gray-300" /> {g.tutorIds?.length || 0} ta tyutor
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={g.isActive ? 'green' : 'red'}>{g.isActive ? 'Faol' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-xs font-bold text-blue-600 hover:underline">Boshqarish</button>
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
