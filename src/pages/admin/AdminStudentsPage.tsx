import {useEffect, useState} from 'react';
import {getUsersByRole, adminCreateUser, UserProfile} from '../../services/userService';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Plus, UserPlus, Mail, Phone, GraduationCap, Upload, FileSpreadsheet, AlertCircle} from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({email: '', password: '', fullName: '', studentId: '', groupId: ''});
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await getUsersByRole('student');
      setStudents(data);
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
      await adminCreateUser({...formData, role: 'student'});
      setShowForm(false);
      setFormData({email: '', password: '', fullName: '', studentId: '', groupId: ''});
      fetchStudents();
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
                        groupId: item['Guruh'] || item['Group'],
                        role: 'student'
                    });
                    success++;
                } catch (err) {
                    console.error("Failed to import student:", item, err);
                    failed++;
                }
            }
            alert(`Import yakunlandi! Muvaffaqiyatli: ${success}, Xato: ${failed}`);
            fetchStudents();
        } catch (err) {
            console.error("Excel processing error:", err);
            alert("Excel faylni o'qishda xatolik yuz berdi.");
        } finally {
            setImporting(false);
        }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Talabalar" 
        subtitle="Barcha talabalar ro'yxati va Excel orqali ommaviy import."
        actions={
            <div className="flex gap-2">
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
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus size={18} /> {showForm ? 'Bekor qilish' : 'Yangi talaba'}
                </Button>
            </div>
        }
      />

      {showForm && (
        <Card className="max-w-3xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><UserPlus className="text-blue-600" /> Yangi talaba hisobi</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">F.I.Sh.</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.fullName}
                        onChange={e => setFormData({...formData, fullName: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Student ID</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.studentId}
                        onChange={e => setFormData({...formData, studentId: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email</label>
                    <input 
                        type="email" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Parol</label>
                    <input 
                        type="password" required minLength={6}
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
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
                <div className="md:col-span-2 pt-4">
                    <Button type="submit" className="w-full justify-center py-4 text-lg" disabled={submitting}>
                        {submitting ? 'Yaratilmoqda...' : 'Talabani yaratish'}
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
                          <th className="px-6 py-4">Talaba</th>
                          <th className="px-6 py-4">Guruh</th>
                          <th className="px-6 py-4">ID</th>
                          <th className="px-6 py-4 text-center">Holat</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Yuklanmoqda...</td></tr>
                      ) : students.length === 0 ? (
                          <tr><td colSpan={5} className="p-10 text-center text-gray-400 italic">Talabalar topilmadi.</td></tr>
                      ) : students.map(student => (
                          <tr key={student.uid} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                                          {student.fullName.charAt(0)}
                                      </div>
                                      <div>
                                          <p className="text-sm font-bold text-gray-900">{student.fullName}</p>
                                          <p className="text-[10px] text-gray-400 font-medium">{student.email}</p>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4">
                                  <Badge variant="blue">{student.groupId}</Badge>
                              </td>
                              <td className="px-6 py-4 text-sm font-mono text-gray-500">
                                  {student.studentId}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={student.isActive ? 'green' : 'red'}>{student.isActive ? 'Aktiv' : 'Nofaol'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right">
                                  <button className="text-xs font-bold text-blue-600 hover:underline">Tafsilotlar</button>
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
