import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {collection, getDocs, updateDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase';
import {getUsersByRole, adminCreateUser, UserProfile} from '../../services/userService';
import {useAuth} from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {
    Search, Filter, UserCog, Mail, Shield, UserCheck, UserMinus, 
    Plus, UserPlus, GraduationCap, Users, BookOpenText, User, 
    FileSpreadsheet, Upload, Phone
} from 'lucide-react';
import * as XLSX from 'xlsx';

type TabType = 'students' | 'tutors' | 'librarians';

export default function AdminUsersPage() {
  const {profile} = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
      if (profile?.role !== 'admin') return 'students';
      if (location.pathname.includes('students')) return 'students';
      if (location.pathname.includes('tutors')) return 'tutors';
      if (location.pathname.includes('librarians')) return 'librarians';
      return 'students';
  });
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
      email: '', 
      password: '', 
      fullName: '', 
      phone: '', 
      studentId: '', 
      groupId: ''
  });

  useEffect(() => {
    if (profile?.role !== 'admin') {
        setActiveTab('students');
        return;
    }
    if (location.pathname.includes('students')) setActiveTab('students');
    else if (location.pathname.includes('tutors')) setActiveTab('tutors');
    else if (location.pathname.includes('librarians')) setActiveTab('librarians');
  }, [location.pathname, profile?.role]);

  useEffect(() => {
    fetchUsersByTab();
  }, [activeTab]);

  const fetchUsersByTab = async () => {
    setLoading(true);
    try {
        const role = activeTab.slice(0, -1) as any;
        const data = await getUsersByRole(role === 'librarian' ? 'librarian' : role === 'tutor' ? 'tutor' : 'student');
        setUsers(data);
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
        const role = activeTab.slice(0, -1) as any;
        await adminCreateUser({
            ...formData, 
            role: role === 'librarian' ? 'librarian' : role === 'tutor' ? 'tutor' : 'student'
        });
        setShowForm(false);
        setFormData({email: '', password: '', fullName: '', phone: '', studentId: '', groupId: ''});
        fetchUsersByTab();
        alert("Foydalanuvchi muvaffaqiyatli yaratildi!");
    } catch (err: any) {
        alert(err.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
        try {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws) as any[];

            let success = 0;
            let failed = 0;

            for (const item of data) {
                try {
                    // Expecting columns: F.I.Sh., Email, Parol, StudentID, Guruh
                    await adminCreateUser({
                        fullName: item['F.I.Sh.'] || item['Full Name'],
                        email: item['Email'],
                        password: String(item['Parol'] || item['Password'] || '123456'),
                        studentId: String(item['StudentID'] || item['ID']),
                        groupId: String(item['Guruh'] || item['Group']),
                        role: 'student'
                    });
                    success++;
                } catch (err) {
                    console.error("Failed to import student:", item, err);
                    failed++;
                }
            }
            alert(`Import yakunlandi! Muvaffaqiyatli: ${success}, Xato: ${failed}`);
            fetchUsersByTab();
        } catch (err) {
            console.error("Excel processing error:", err);
            alert("Excel faylni o'qishda xatolik yuz berdi.");
        } finally {
            setImporting(false);
        }
    };
    reader.readAsBinaryString(file);
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
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
      { id: 'students', label: 'Talabalar', icon: GraduationCap },
      { id: 'tutors', label: 'Tyutorlar', icon: User },
      { id: 'librarians', label: 'Kutubxonachilar', icon: BookOpenText },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title={profile?.role === 'admin' ? "Foydalanuvchilar boshqaruvi" : "Talabalar ro'yxati"} 
        subtitle={profile?.role === 'admin' ? "Tizim foydalanuvchilarini ro'yxatga olish, import qilish va tahrirlash." : "Guruh talabalari ma'lumotlari."}
        actions={
            profile?.role === 'admin' ? (
                <div className="flex gap-2">
                    {activeTab === 'students' && (
                        <div className="relative">
                            <input 
                                type="file" 
                                accept=".xlsx, .xls" 
                                className="hidden" 
                                id="excel-upload" 
                                onChange={handleExcelImport}
                                disabled={importing}
                            />
                            <label 
                                htmlFor="excel-upload" 
                                className={`flex items-center gap-2 px-5 py-2.5 bg-green-50 text-green-700 rounded-lg font-bold text-sm cursor-pointer border border-green-100 hover:bg-green-100 transition-all ${importing ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <FileSpreadsheet size={18} /> {importing ? 'Yuklanmoqda...' : 'Excel Import'}
                            </label>
                        </div>
                    )}
                    <Button onClick={() => setShowForm(!showForm)}>
                        <Plus size={18} /> {showForm ? 'Bekor qilish' : `Yangi ${activeTab === 'students' ? 'talaba' : activeTab === 'tutors' ? 'tyutor' : 'kutubxonachi'}`}
                    </Button>
                </div>
            ) : null
        }
      />

      {/* Tabs */}
      {profile?.role === 'admin' && (
        <div className="flex p-1 bg-gray-100 rounded-2xl w-fit">
            {tabs.map(tab => (
                <button
                    key={tab.id}
                    onClick={() => {
                        setActiveTab(tab.id as TabType);
                        setShowForm(false);
                    }}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                        activeTab === tab.id 
                        ? 'bg-white text-blue-900 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                    <tab.icon size={18} />
                    {tab.label}
                </button>
            ))}
        </div>
      )}

      {showForm && (
        <Card className="max-w-4xl border-2 border-blue-100">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <UserPlus className="text-blue-600" /> 
                {activeTab === 'students' ? 'Yangi talaba' : activeTab === 'tutors' ? 'Yangi tyutor' : 'Yangi kutubxonachi'} qo'shish
            </h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">F.I.Sh.</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                        placeholder="To'liq ism familiya"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email</label>
                    <input 
                        type="email" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        placeholder="example@tdtu.uz"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Parol</label>
                    <input 
                        type="password" required minLength={6}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder="Kamida 6 ta belgi"
                    />
                </div>
                {activeTab === 'students' ? (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Student ID</label>
                            <input 
                                type="text" required
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.studentId}
                                onChange={e => setFormData({...formData, studentId: e.target.value})}
                                placeholder="Talaba guvohnoma raqami"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Guruh</label>
                            <input 
                                type="text" required
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.groupId}
                                onChange={e => setFormData({...formData, groupId: e.target.value})}
                                placeholder="Masalan: 302-guruh"
                            />
                        </div>
                    </>
                ) : (
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
                )}
                <div className="md:col-span-2 pt-4">
                    <Button type="submit" className="w-full justify-center py-4 text-lg shadow-lg shadow-blue-900/20" disabled={submitting}>
                        {submitting ? 'Yaratilmoqda...' : 'Hisobni saqlash'}
                    </Button>
                </div>
            </form>
        </Card>
      )}

      {/* Search Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input 
                type="text" 
                placeholder="Ism, email yoki ID bo'yicha qidirish..." 
                className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-medium"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
        </div>
        <Button variant="secondary" className="bg-white border border-gray-100 h-14">
            <Filter size={18} /> Filtrlar
        </Button>
      </div>

      {/* Users Table */}
      <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Foydalanuvchi</th>
                          {activeTab === 'students' ? (
                              <>
                                  <th className="px-6 py-4">Guruh</th>
                                  <th className="px-6 py-4">ID</th>
                              </>
                          ) : (
                              <th className="px-6 py-4">Kontakt</th>
                          )}
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic font-medium animate-pulse">Yuklanmoqda...</td></tr>
                      ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan={5} className="p-20 text-center text-gray-400 italic flex flex-col items-center">
                              <Users size={48} className="mb-4 opacity-20" />
                              Foydalanuvchilar topilmadi.
                          </td></tr>
                      ) : filteredUsers.map(user => (
                          <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border ${
                                          user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                                          user.role === 'librarian' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                          user.role === 'tutor' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                          'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      }`}>
                                          {user.fullName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-gray-900">{user.fullName}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">{user.email}</p>
                                      </div>
                                  </div>
                              </td>
                              {activeTab === 'students' ? (
                                  <>
                                      <td className="px-6 py-4">
                                          <Badge variant="blue">{user.groupId || 'Noma\'lum'}</Badge>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-xs text-gray-500">
                                          {user.studentId || '-'}
                                      </td>
                                  </>
                              ) : (
                                  <td className="px-6 py-4">
                                      <div className="flex flex-col gap-1">
                                          {user.phone && <div className="flex items-center gap-2 text-xs text-gray-600 font-medium"><Phone size={12} className="text-gray-300" /> {user.phone}</div>}
                                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-medium italic"><Mail size={10} /> {user.email}</div>
                                      </div>
                                  </td>
                              )}
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Aktiv' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                  </div>
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
