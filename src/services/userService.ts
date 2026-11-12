import {doc, getDoc, setDoc, collection, getCountFromServer, query, where, getDocs} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

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
  initialPassword?: string;
  groupIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getUserProfile = async (uid: string) => {
  const path = `users/${uid}`;
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as UserProfile) : null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const createUserProfile = async (profile: UserProfile) => {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getUsersCount = async () => {
  try {
    const res = await fetch('/api/public-stats');
    if (res.ok) {
      const data = await res.json();
      if (typeof data.totalUsers === 'number') {
        return data.totalUsers;
      }
    }
  } catch (e) {
    // Fallback to firestore query if signed in
  }

  const path = 'users';
  try {
    const snapshot = await getCountFromServer(collection(db, 'users'));
    return snapshot.data().count;
  } catch (error) {
    // If unauthenticated or no permission, return 0 gracefully without alert spam
    console.warn("Could not get users count directly from client:", error);
    return 0;
  }
};
export const getStudentsCount = async () => {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return 0;
  }
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

export const getUsersByRole = async (role: string) => {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'), where('role', '==', role));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({uid: docSnap.id, ...docSnap.data()} as UserProfile));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const adminCreateUser = async (data: any) => {
    try {
        const response = await fetch('/api/admin/users/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'TDTU_ADMIN_SECRET'
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get('content-type');
        if (!response.ok) {
            if (contentType && contentType.includes('application/json')) {
                const err = await response.json();
                throw new Error(err.error || 'Foydalanuvchi yaratishda xatolik yuz berdi.');
            } else {
                const text = await response.text();
                console.error("Non-JSON error response:", text);
                throw new Error(`Server xatosi: ${response.status}. Iltimos, sahifani yangilang va qayta urinib ko'ring.`);
            }
        }
        return await response.json();
    } catch (error: any) {
        console.error("adminCreateUser error:", error);
        throw error;
    }
};

export const adminResetPassword = async (uid: string, password: string) => {
    const response = await fetch('/api/admin/users/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'TDTU_ADMIN_SECRET'
        },
        body: JSON.stringify({ uid, password })
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to reset password');
    }
    return await response.json();
};
