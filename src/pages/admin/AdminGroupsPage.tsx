import {useEffect, useState} from 'react';
import {getGroups, Group} from '../../services/groupService';

export default function AdminGroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    getGroups().then(setGroups);
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Guruhlar</h1>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th>Nomi</th>
            <th>Kodi</th>
            <th>Tutorlar</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {groups.map(g => (
            <tr key={g.id}>
              <td>{g.name}</td>
              <td>{g.code}</td>
              <td>{g.tutorIds?.join(', ')}</td>
              <td>{g.isActive ? 'Active' : 'Inactive'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
