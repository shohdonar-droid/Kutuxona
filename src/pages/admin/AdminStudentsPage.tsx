import {useEffect, useState} from 'react';
import {getStudents, Student} from '../../services/studentService';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    getStudents().then(setStudents);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Talabalar</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Ism</th>
            <th>Student ID</th>
            <th>Guruh</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.id}>
              <td>{s.fullName}</td>
              <td>{s.studentId}</td>
              <td>{s.groupName}</td>
              <td>{s.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
