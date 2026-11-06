import {useEffect, useState} from 'react';
import {getUserNotifications, Notification, markAsRead} from '../../services/notificationService';
import {useAuth} from '../../context/AuthContext';

export default function NotificationsPage() {
  const {user} = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      getUserNotifications(user.uid).then(setNotifications);
    }
  }, [user]);

  const [filter, setFilter] = useState('ALL');

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Bildirishnomalar</h1>
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilter('ALL')}>Barchasi</button>
        <button onClick={() => setFilter('DUE_5_DAYS')}>Muddat</button>
      </div>
      {notifications.filter(n => filter === 'ALL' || n.type === filter).map(n => (
        <div key={n.id} className={`border p-4 rounded mb-2 ${n.isRead ? 'bg-gray-100' : 'bg-white'}`}>
            <h3 className="font-bold">{n.title}</h3>
            <p>{n.message}</p>
            {!n.isRead && <button onClick={() => markAsRead(n.id)} className="text-blue-500">O‘qildi deb belgilash</button>}
        </div>
      ))}
    </div>
  );
}
