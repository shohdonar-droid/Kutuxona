import {useState} from 'react';
import {auth} from '../firebase';
import {createUserWithEmailAndPassword} from 'firebase/auth';
import {createUserProfile} from '../services/userService';
import {useNavigate} from 'react-router-dom';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const {user} = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile({
        uid: user.uid,
        email: email,
        role: 'student',
        fullName: fullName,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      navigate('/student');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl mb-4">Ro‘yxatdan o‘tish</h2>
        <input className="w-full p-2 mb-4 border" type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Full Name" required />
        <input className="w-full p-2 mb-4 border" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input className="w-full p-2 mb-4 border" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button className="w-full bg-blue-600 text-white p-2" type="submit">Register</button>
      </form>
    </div>
  );
}
