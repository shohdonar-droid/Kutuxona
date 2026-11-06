import {createContext, useContext, useEffect, useState} from 'react';
import {auth} from '../firebase';
import {onAuthStateChanged, User} from 'firebase/auth';
import {getUserProfile, UserProfile} from '../services/userService';

const AuthContext = createContext<{user: User | null; profile: UserProfile | null; loading: boolean}>({user: null, profile: null, loading: true});

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const profile = await getUserProfile(user.uid);
        setProfile(profile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return <AuthContext.Provider value={{user, profile, loading}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
