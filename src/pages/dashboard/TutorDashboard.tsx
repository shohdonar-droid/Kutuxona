import {useEffect, useState, useMemo} from 'react';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase';
import {useAuth} from '../../context/AuthContext';
import {Group} from '../../services/groupService';
import {Student} from '../../services/studentService';
import PageHeader from '../../components/PageHeader';
import {StatCard, Card, Badge, Button} from '../../components/UIComponents';
import {Users, UserCheck, UserX, BarChart3, GraduationCap, Building2, Search, ArrowRight, ClipboardList, AlertTriangle} from 'lucide-react';
import {Link} from 'react-router-dom';

export default function TutorDashboard() {
  const {profile} = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.uid) {
      const q = query(collection(db, 'groups'), where('tutorIds', 'array-contains', profile.uid));
      getDocs(q).then(snapshot => {
        const groupsData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Group));
        setGroups(groupsData);
        if (groupsData.length > 0) setSelectedGroupId(groupsData[0].id);
        setLoading(false);
      }).catch(err => {
        console.error("Error fetching tutor groups:", err);
        setLoading(false);
      });
    }
  }, [profile]);

  useEffect(() => {
    if (selectedGroupId) {
      setLoading(true);
      const q = query(collection(db, 'students'), where('groupId', '==', selectedGroupId));
      getDocs(q).then(snapshot => {
        setStudents(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Student)));
      }).finally(() => setLoading(false));
    }
  }, [selectedGroupId]);

  const activeCount = useMemo(() => students.filter(s => s.status === 'ACTIVE').length, [students]);
  const lowActivityCount = useMemo(() => students.filter(s => s.status !== 'ACTIVE').length, [students]);

  if (!profile || (loading && groups.length === 0)) return <div className="p-8 text-center text-blue-900 font-bold">Yuklanmoqda...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Talabalar monitoringi</h1>
            <p className="text-gray-500 mt-2 font-medium">O‘zingizga biriktirilgan guruhlar va talabalar faolligini kuzating.</p>
        </div>
        <div className="flex gap-2">
            <Link to="/tutor/statistics">
                <Button variant="secondary">
                    <BarChart3 size={18} /> To‘liq tahlil
                </Button>
            </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Guruhlar soni" value={groups.length} icon={Building2} color="text-blue-600" />
        <StatCard title="Jami talabalar" value={students.length} icon={GraduationCap} color="text-indigo-600" />
        <StatCard title="Faol talabalar" value={activeCount} icon={UserCheck} color="text-green-600" />
        <StatCard title="Faolligi past" value={lowActivityCount} icon={UserX} color="text-red-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Left: Group Selector & Low Activity Alert */}
        <div className="space-y-8">
            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Guruhni tanlang</h2>
                <div className="space-y-2">
                    {groups.map(g => (
                        <button
                            key={g.id}
                            onClick={() => setSelectedGroupId(g.id)}
                            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                                selectedGroupId === g.id 
                                ? 'bg-blue-900 text-white border-blue-900 shadow-lg shadow-blue-900/20' 
                                : 'bg-white text-gray-700 border-gray-100 hover:border-blue-200'
                            }`}
                        >
                            <span className="font-bold text-sm">{g.name}</span>
                            <ArrowRight size={16} className={selectedGroupId === g.id ? 'text-blue-300' : 'text-gray-300'} />
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
                <div className="flex items-center gap-2 text-red-600 mb-4">
                    <AlertTriangle size={20} />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Diqqat!</h3>
                </div>
                <p className="text-sm font-bold text-gray-900 mb-2">{lowActivityCount} ta talaba faol emas</p>
                <p className="text-xs text-gray-500 leading-relaxed mb-4">Ushbu talabalar oxirgi 30 kun ichida kutubxonadan foydalanmagan.</p>
                <Link to="/tutor/low-activity">
                    <Button variant="danger" className="w-full justify-center bg-red-600 hover:bg-red-700 text-white border-0 py-2.5">
                        Ko'rish
                    </Button>
                </Link>
            </div>
        </div>

        {/* Right: Student Monitoring Table */}
        <div className="lg:col-span-3 space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                    {groups.find(g => g.id === selectedGroupId)?.name || 'Guruh'} talabalari
                </h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Talaba qidirish..." 
                        className="pl-10 pr-4 py-2 bg-gray-50 border-0 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                    />
                </div>
            </div>

            <Card className="p-0 overflow-hidden">
                {students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">F.I.Sh.</th>
                                    <th className="px-6 py-4 text-center">O‘qilgan</th>
                                    <th className="px-6 py-4 text-center">Progress</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Amallar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                                                    {student.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 leading-none">{student.fullName}</p>
                                                    <p className="text-[10px] text-gray-400 font-medium mt-1">{student.studentId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-sm font-bold text-gray-700">12 ta</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-green-500 h-full" style={{ width: '75%' }}></div>
                                                </div>
                                                <span className="text-[10px] font-bold text-gray-400 w-8">75%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={student.status === 'ACTIVE' ? 'green' : 'red'}>
                                                {student.status === 'ACTIVE' ? 'Faol' : 'Faol emas'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/tutor/students/${student.id}`}>
                                                <Button variant="secondary" className="px-3 py-1.5 text-xs">
                                                    Batafsil
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <Users size={40} className="text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400 font-medium">Bu guruhda talabalar topilmadi.</p>
                    </div>
                )}
            </Card>
        </div>
      </div>
    </div>
  );
}
