import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {doc, getDoc} from 'firebase/firestore';
import {db} from '../../firebase';
import {Student} from '../../services/studentService';

export default function StudentDetailPage() {
  const {studentId} = useParams<{studentId: string}>();
  const [student, setStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (studentId) {
      getDoc(doc(db, 'students', studentId)).then(snapshot => {
        if (snapshot.exists()) {
          setStudent({id: snapshot.id, ...snapshot.data()} as Student);
        }
      });
    }
  }, [studentId]);

  if (!student) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">{student.fullName}</h1>
      <p>Student ID: {student.studentId}</p>
      <p>Guruh: {student.groupName}</p>
      <p>Status: {student.status}</p>
    </div>
  );
}
