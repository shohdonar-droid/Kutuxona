import {useState} from 'react';
import {auth} from '../firebase';
import {signInWithEmailAndPassword} from 'firebase/auth';
import {getUserProfile} from '../services/userService';
import {useNavigate} from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {user} = await signInWithEmailAndPassword(auth, email, password);
      const profile = await getUserProfile(user.uid);
      if (profile?.role === 'student') navigate('/student');
      else if (profile?.role === 'librarian') navigate('/librarian');
      else if (profile?.role === 'tutor') navigate('/tutor');
      else if (profile?.role === 'admin') navigate('/admin');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}
