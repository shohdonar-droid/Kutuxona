import {useState} from 'react';
import {auth} from '../firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {getUserProfile} from '../services/userService';
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
      else setError('Login xatosi: ' + err.message);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <input type="text" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email yoki admin" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}
