import {useState} from 'react';
import {auth} from '../firebase';
import {signInWithEmailAndPassword, createUserWithEmailAndPassword} from 'firebase/auth';
import {getUserProfile, createUserProfile} from '../services/userService';
import {useNavigate} from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const authEmail = email === 'admin' ? 'admin@tdtu.uz' : email;
      const {user} = await signInWithEmailAndPassword(auth, authEmail, password);
      const profile = await getUserProfile(user.uid);
      if (profile?.role === 'student') navigate('/student');
      else if (profile?.role === 'librarian') navigate('/librarian');
      else if (profile?.role === 'tutor') navigate('/tutor');
      else if (profile?.role === 'admin') navigate('/admin');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-email') setError('Yaroqsiz email manzili.');
      else if (err.code === 'auth/user-not-found') setError('Foydalanuvchi topilmadi.');
      else if (err.code === 'auth/wrong-password') setError('Parol noto\'g\'ri.');
      else if (err.code === 'auth/invalid-credential') setError('Email yoki parol noto\'g\'ri.');
      else setError('Login xatosi: ' + err.message);
    }
  };

  const handleCreateAdmin = async () => {
    try {
      const {user} = await createUserWithEmailAndPassword(auth, 'admin@tdtu.uz', 'admin123');
      await createUserProfile({
        uid: user.uid,
        email: 'admin@tdtu.uz',
        role: 'admin',
        fullName: 'Admin',
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      alert('Admin yaratildi! Endi admin/admin123 bilan kiring.');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        alert('Admin allaqachon yaratilgan. Iltimos, admin/admin123 bilan kiring.');
      } else {
        console.error(err);
        setError('Admin yaratish xatosi: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-blue-900 mb-8">Tizimga kirish</h2>
        <form onSubmit={handleLogin} className="space-y-6">
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email yoki foydalanuvchi nomi</label>
            <input 
              type="text" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Email yoki admin" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Parol</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••" 
              required 
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition duration-200"
          >
            Kirish
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <button onClick={handleCreateAdmin} className="text-sm text-blue-600 hover:underline">
                Admin foydalanuvchisini yaratish (bir marta)
            </button>
        </div>
      </div>
    </div>
  );
}
