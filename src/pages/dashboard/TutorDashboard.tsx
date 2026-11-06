import {useEffect, useState, useMemo} from 'react';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase';
import {useAuth} from '../../context/AuthContext';
import {Group} from '../../services/groupService';
import {Student} from '../../services/studentService';

export default function TutorDashboard() {
  const {profile} = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (profile?.uid) {
      const q = query(collection(db, 'groups'), where('tutorIds', 'array-contains', profile.uid));
      getDocs(q).then(snapshot => {
        const groupsData = snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Group));
        setGroups(groupsData);
        if (groupsData.length > 0) setSelectedGroupId(groupsData[0].id);
      });
    }
  }, [profile]);

  useEffect(() => {
    if (selectedGroupId) {
      const q = query(collection(db, 'students'), where('groupId', '==', selectedGroupId));
      getDocs(q).then(snapshot => {
        setStudents(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Student)));
      });
    }
  }, [selectedGroupId]);

  const activeStudents = useMemo(() => students.filter(s => s.status === 'ACTIVE'), [students]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Tutor Dashboard</h1>
      <select onChange={(e) => setSelectedGroupId(e.target.value)} className="border p-2 mb-4 w-full">
        {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
      </select>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="border p-4 rounded shadow bg-blue-50"><h3>Jami talabalar</h3><p className="text-xl font-bold">{students.length}</p></div>
        <div className="border p-4 rounded shadow bg-green-50"><h3>Faol talabalar</h3><p className="text-xl font-bold">{activeStudents.length}</p></div>
      </div>

      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="p-2 border">Talaba</th>
            <th className="p-2 border">Student ID</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td className="p-2 border">{s.fullName}</td>
              <td className="p-2 border">{s.studentId}</td>
              <td className="p-2 border">{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
