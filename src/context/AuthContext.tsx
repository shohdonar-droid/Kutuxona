import {createContext, useContext, useEffect, useState} from 'react';
import {onAuthStateChanged, User} from 'firebase/auth';
import {doc, getDocFromServer} from 'firebase/firestore';
import {db, auth} from '../firebase';
import {getUserProfile, UserProfile} from '../services/userService';

const AuthContext = createContext<{user: User | null; profile: UserProfile | null; loading: boolean}>({user: null, profile: null, loading: true});

export function AuthProvider({children}: {children: React.ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // CRITICAL: Validate connection to Firestore on boot
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, '_connection_test_', 'ping'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    }
    testConnection();

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
