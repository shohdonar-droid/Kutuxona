import {collection, getDocs, query, where, addDoc, updateDoc, doc, getCountFromServer} from 'firebase/firestore';
import {db} from '../firebase';

export interface Student {
  id: string;
  userId: string;
  fullName: string;
  studentId?: string;
  facultyId?: string;
  facultyName?: string;
  directionId?: string;
  directionName?: string;
  groupId?: string;
  groupName?: string;
  course?: number;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: any;
  updatedAt?: any;
}

export const getStudents = async () => {
  const snapshot = await getDocs(collection(db, 'students'));
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Student));
};

export const getStudentsByGroup = async (groupId: string) => {
  const q = query(collection(db, 'students'), where('groupId', '==', groupId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Student));
};

export const createStudent = async (student: Omit<Student, 'id'>) => {
  return await addDoc(collection(db, 'students'), student);
};

export const getStudentsCount = async () => {
  const snapshot = await getCountFromServer(collection(db, 'students'));
  return snapshot.data().count;
};
