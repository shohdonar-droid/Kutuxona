import {useState} from 'react';
import {auth} from '../firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {getUserProfile} from '../services/userService';
import {useNavigate} from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let authEmail = email.trim();
      let authPassword = password;

      // 1. Admin login shortcut (from previous logic)
      if (email === 'admin1' && password === '12345a') {
        authEmail = 'admin@tdtu.uz';
        authPassword = 'admin123';
      } 
      // 2. ID to Email mapping (Student ID login)
      else if (!authEmail.includes('@')) {
        authEmail = `${authEmail}@tdtu.uz`;
      }

      const {user} = await signInWithEmailAndPassword(auth, authEmail, authPassword);
      const profile = await getUserProfile(user.uid);
      
      if (!profile) {
        await auth.signOut();
        setError('Profil topilmadi. Iltimos, admin bilan bog\'laning.');
        return;
      }

      // 3. Activation check
      if (!profile.isActive) {
          await auth.signOut();
          setError('Sizning hisobingiz faol emas. Iltimos, faollashtirish uchun admin bilan bog\'laning.');
          return;
      }

      if (profile.role === 'student') navigate('/student');
      else if (profile.role === 'librarian') navigate('/librarian');
      else if (profile.role === 'tutor') navigate('/tutor');
      else if (profile.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-email') setError('Yaroqsiz email manzili yoki ID.');
      else if (err.code === 'auth/user-not-found') setError('Foydalanuvchi topilmadi.');
      else if (err.code === 'auth/wrong-password') setError('Parol noto\'g\'ri.');
      else if (err.code === 'auth/invalid-credential') setError('Email/ID yoki parol noto\'g\'ri.');
      else setError('Login xatosi: ' + err.message);
    } finally {
        setLoading(false);
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
      </div>
    </div>
  );
}
