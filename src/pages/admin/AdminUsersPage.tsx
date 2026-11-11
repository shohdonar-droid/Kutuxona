import {useEffect, useState} from 'react';
import {useLocation} from 'react-router-dom';
import {updateDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase';
import {getUsersByRole, adminCreateUser, adminResetPassword, UserProfile} from '../../services/userService';
import {useAuth} from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {
    Search, Filter, UserCog, Mail, UserCheck, UserMinus, 
    Plus, UserPlus, GraduationCap, Users, BookOpenText, User, 
    FileSpreadsheet, Download, Phone, RefreshCw, Smartphone, BookOpen, Key
} from 'lucide-react';
import * as XLSX from 'xlsx';

type TabType = 'students' | 'tutors' | 'librarians';

export default function AdminUsersPage() {
  const {profile} = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
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
      loginId: '', // ID or Login
      password: '', 
      fullName: '', 
      phone: '', 
      studentId: '', 
      groupId: '',
      course: '',
      directionId: ''
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
        const actualRole = role === 'librarian' ? 'librarian' : role === 'tutor' ? 'tutor' : 'student';
        
        // Auto generate email from Login ID
        const email = `${formData.loginId.trim()}@tdtu.uz`;
        
        let payload: any = { 
            ...formData, 
            email,
            role: actualRole,
            studentId: actualRole === 'student' ? formData.loginId : (formData.studentId || '')
        };

        await adminCreateUser(payload);
        setShowForm(false);
        setFormData({loginId: '', password: '', fullName: '', phone: '', studentId: '', groupId: '', course: '', directionId: ''});
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
                    // ID, FISH, kursi, yonalishi, guruhi, tel raqami, parol
                    const loginId = String(item['ID'] || item['Talaba ID'] || item['id'] || '').trim();
                    const fullName = item['FISH'] || item['F.I.Sh.'] || item['fish'];
                    const course = String(item['kursi'] || item['Kursi'] || '');
                    const direction = item['yonalishi'] || item['Yo\'nalishi'] || item['yo\'nalish'];
                    const groupId = String(item['guruhi'] || item['Guruhi'] || '');
                    const phone = String(item['tel raqami'] || item['Telefon'] || item['tel']);
                    const password = String(item['parol'] || item['Parol'] || '123456');

                    if (!loginId || !fullName) continue;

                    await adminCreateUser({
                        fullName,
                        email: `${loginId}@tdtu.uz`,
                        password,
                        studentId: loginId,
                        course: parseInt(course) || 1,
                        directionId: direction || '',
                        groupId: groupId || '',
                        phone: phone || '',
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
            e.target.value = '';
        }
    };
    reader.readAsBinaryString(file);
  };

  const downloadTemplate = () => {
      const template = [
          { 'ID': '220101', 'FISH': 'Aliev Ali', 'kursi': '3', 'yonalishi': 'Tibbiy pedagogika', 'guruhi': '302', 'tel raqami': '+998901234567', 'parol': '123456' }
      ];
      const ws = XLSX.utils.json_to_sheet(template);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Talabalar");
      XLSX.writeFile(wb, "talaba_import_shabloni.xlsx");
  };

  const toggleStatus = async (user: UserProfile) => {
    try {
        await updateDoc(doc(db, 'users', user.uid), {isActive: !user.isActive, updatedAt: new Date().toISOString()});
        setUsers(users.map(u => u.uid === user.uid ? {...u, isActive: !u.isActive} : u));
    } catch (err) {
        alert("Xatolik yuz berdi");
    }
  };

  const handleResetPassword = async (user: UserProfile) => {
      if (!user.initialPassword) {
          alert("Ushbu foydalanuvchi uchun boshlang'ich parol saqlanmagan.");
          return;
      }
      if (!window.confirm(`Haqiqatan ham ${user.fullName} parolini '${user.initialPassword}' ga qaytarmoqchimisiz?`)) return;

      try {
          await adminResetPassword(user.uid, user.initialPassword);
          alert("Parol muvaffaqiyatli tiklandi!");
      } catch (err: any) {
          alert("Xatolik: " + err.message);
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
                        <>
                            <Button variant="secondary" onClick={downloadTemplate} className="bg-white border-blue-100 text-blue-600">
                                <Download size={18} /> Shablonni yuklash
                            </Button>
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
                        </>
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
                    <label className="text-sm font-bold text-gray-700">Login (ID)</label>
                    <div className="relative">
                        <input 
                            type="text" required
                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                            value={formData.loginId}
                            onChange={e => setFormData({...formData, loginId: e.target.value})}
                            placeholder="220101"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">@tdtu.uz</span>
                    </div>
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

                {activeTab === 'students' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Kursi</label>
                            <select 
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.course}
                                onChange={e => setFormData({...formData, course: e.target.value})}
                                required
                            >
                                <option value="">Tanlang</option>
                                <option value="1">1-kurs</option>
                                <option value="2">2-kurs</option>
                                <option value="3">3-kurs</option>
                                <option value="4">4-kurs</option>
                                <option value="5">5-kurs</option>
                                <option value="6">6-kurs</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Yo'nalishi</label>
                            <input 
                                type="text" required
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.directionId}
                                onChange={e => setFormData({...formData, directionId: e.target.value})}
                                placeholder="Masalan: Tibbiy pedagogika"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-700">Guruh</label>
                            <input 
                                type="text" required
                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={formData.groupId}
                                onChange={e => setFormData({...formData, groupId: e.target.value})}
                                placeholder="Masalan: 302"
                            />
                        </div>
                    </>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Telefon raqami</label>
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
                  <thead className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                          <th className="px-6 py-4">F.I.Sh. (FISH)</th>
                          {activeTab === 'students' ? (
                              <>
                                  <th className="px-6 py-4 text-center">Kurs</th>
                                  <th className="px-6 py-4">Yo'nalish</th>
                                  <th className="px-6 py-4 text-center">Guruh</th>
                                  <th className="px-6 py-4">Talaba ID (Login)</th>
                                  <th className="px-6 py-4">Parol</th>
                              </>
                          ) : (
                              <th className="px-6 py-4">Kontakt / Email</th>
                          )}
                          <th className="px-6 py-4 text-center">Tel raqami</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={activeTab === 'students' ? 9 : 5} className="p-10 text-center text-gray-400 italic font-medium animate-pulse">Yuklanmoqda...</td></tr>
                      ) : filteredUsers.length === 0 ? (
                          <tr><td colSpan={activeTab === 'students' ? 9 : 5} className="p-20 text-center text-gray-400 italic flex flex-col items-center">
                              <Users size={48} className="mb-4 opacity-20" />
                              Foydalanuvchilar topilmadi.
                          </td></tr>
                      ) : filteredUsers.map(user => (
                          <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold border ${
                                          user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' : 
                                          user.role === 'librarian' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                          user.role === 'tutor' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                          'bg-emerald-50 text-emerald-700 border-emerald-100'
                                      }`}>
                                          {user.fullName.charAt(0)}
                                      </div>
                                      <p className="text-sm font-bold text-gray-900 truncate max-w-[180px]" title={user.fullName}>{user.fullName}</p>
                                  </div>
                              </td>
                              {activeTab === 'students' ? (
                                  <>
                                      <td className="px-6 py-4 text-center">
                                          <span className="text-xs font-bold text-gray-700">{user.course}</span>
                                      </td>
                                      <td className="px-6 py-4">
                                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[120px]" title={user.directionId}>{user.directionId || 'Yo\'nalish'}</span>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                          <Badge variant="blue">{user.groupId || '-'}</Badge>
                                      </td>
                                      <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                                          {user.studentId || '-'}
                                      </td>
                                      <td className="px-6 py-4 font-mono text-[11px] text-gray-400">
                                          {user.initialPassword || '••••••'}
                                      </td>
                                  </>
                              ) : (
                                  <td className="px-6 py-4">
                                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium truncate max-w-[150px]" title={user.email}>
                                          <Mail size={12} className="text-gray-300 shrink-0" /> {user.email}
                                      </div>
                                  </td>
                              )}
                              <td className="px-6 py-4 text-center text-[11px] text-gray-600">
                                  {user.phone || '-'}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Faol' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => toggleStatus(user)}
                                        className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                                        title={user.isActive ? 'Nofaol qilish' : 'Faollashtirish'}
                                      >
                                          {user.isActive ? <UserMinus size={18} /> : <UserCheck size={18} />}
                                      </button>
                                      <button 
                                        onClick={() => handleResetPassword(user)}
                                        className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                                        title="Parolni tiklash"
                                      >
                                          <RefreshCw size={18} />
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
