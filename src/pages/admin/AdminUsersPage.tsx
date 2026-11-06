import {useEffect, useState} from 'react';
import {collection, getDocs, updateDoc, doc} from 'firebase/firestore';
import {db} from '../../firebase';
import {UserProfile} from '../../services/userService';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    getDocs(collection(db, 'users')).then(snapshot => {
      setUsers(snapshot.docs.map(doc => ({uid: doc.id, ...doc.data()} as UserProfile)));
    });
  }, []);

  const toggleStatus = async (user: UserProfile) => {
    await updateDoc(doc(db, 'users', user.uid), {isActive: !user.isActive});
    setUsers(users.map(u => u.uid === user.uid ? {...u, isActive: !u.isActive} : u));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Foydalanuvchilarni boshqarish</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Ism</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.uid}>
              <td>{user.fullName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button onClick={() => toggleStatus(user)} className="text-blue-500">
                  {user.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
