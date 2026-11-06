import {doc, getDoc, setDoc, collection, getCountFromServer, query, where} from 'firebase/firestore';
import {db} from '../firebase';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'student' | 'librarian' | 'tutor' | 'admin';
  fullName: string;
  phone?: string;
  photoURL?: string;
  studentId?: string;
  facultyId?: string;
  directionId?: string;
  course?: number;
  groupId?: string;
  isActive: boolean;
  groupIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getUserProfile = async (uid: string) => {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
};

export const createUserProfile = async (profile: UserProfile) => {
  await setDoc(doc(db, 'users', profile.uid), profile);
};

export const getUsersCount = async () => {
  const snapshot = await getCountFromServer(collection(db, 'users'));
  return snapshot.data().count;
};
export const getStudentsCount = async () => {
  const q = query(collection(db, 'users'), where('role', '==', 'student'));
  const snapshot = await getCountFromServer(q);
  return snapshot.data().count;
};

export const getRoleCounts = async () => {
  const roles = ['student', 'librarian', 'tutor', 'admin'];
  const counts: Record<string, number> = {};
  for (const role of roles) {
      const q = query(collection(db, 'users'), where('role', '==', role));
      const snapshot = await getCountFromServer(q);
      counts[role] = snapshot.data().count;
  }
  return counts;
};
