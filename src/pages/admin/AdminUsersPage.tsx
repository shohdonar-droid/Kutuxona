import {useEffect, useState} from 'react';
import {collection, getDocs, updateDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase';
import {UserProfile} from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Search, Filter, UserCog, Mail, Shield, UserCheck, UserMinus} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
        const snapshot = await getDocs(collection(db, 'users'));
        setUsers(snapshot.docs.map(doc => ({uid: doc.id, ...doc.data()} as UserProfile)));
    } catch (err) {
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  const toggleStatus = async (user: UserProfile) => {
    try {
        await updateDoc(doc(db, 'users', user.uid), {isActive: !user.isActive});
        setUsers(users.map(u => u.uid === user.uid ? {...u, isActive: !u.isActive} : u));
    } catch (err) {
        alert("Xatolik yuz berdi");
    }
  };

  const filteredUsers = users.filter(user => 
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
        case 'admin': return <Badge variant="red">ADMIN</Badge>;
        case 'librarian': return <Badge variant="blue">KUTUBXONACHI</Badge>;
        case 'tutor': return <Badge variant="yellow">TYUTOR</Badge>;
        case 'student': return <Badge variant="green">TALABA</Badge>;
        default: return <Badge variant="gray">{role}</Badge>;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Foydalanuvchilar" 
        subtitle="Tizimdagi barcha foydalanuvchilarni ko'rish va boshqarish."
      />

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Ism yoki email bo'yicha qidirish..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <Button variant="secondary" className="bg-white border border-gray-100">
            <Filter size={18} /> Filtrlar
        </Button>
      </div>

      <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Foydalanuvchi</th>
                          <th className="px-6 py-4">Rol</th>
                          <th className="px-6 py-4">Kontakt</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Yuklanmoqda...</td></tr>
                      ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Foydalanuvchilar topilmadi.</td></tr>
                      ) : filteredUsers.map(user => (
                          <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                                          user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                                          user.role === 'librarian' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                          user.role === 'tutor' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                          'bg-green-50 text-green-700 border-green-100'
                                      }`}>
                                          {user.fullName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">ID: {user.uid.substring(0, 8)}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  {getRoleBadge(user.role)}
                              </td>
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-2 text-xs text-gray-600 font-medium italic"><Mail size={12} className="text-gray-300" /> {user.email}</div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Aktiv' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button 
                                    onClick={() => toggleStatus(user)}
                                    className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                    title={user.isActive ? 'Bloklash' : 'Faollashtirish'}
                                  >
                                      {user.isActive ? <UserMinus size={18} /> : <UserCheck size={18} />}
                                  </button>
                                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                                      <UserCog size={18} />
                                  </button>
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
