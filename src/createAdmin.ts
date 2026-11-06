import { signInWithEmailAndPassword } from 'firebase/auth';
import { createUserProfile } from './src/services/userService';
import { auth } from './src/firebase';

export const createInitialAdmin = async () => {
  const email = 'admin@tdtu.uz'; // 'admin' login might not work with Firebase Auth, using an email format
  const password = 'admin123';
  
  try {
    // Note: In a production app, you'd handle this securely via a server-side function
    // For this applet, you can manually trigger this in the browser console if needed.
    console.log("To create the admin user, please use the registration page with email: admin@tdtu.uz and password: admin123, then manually update the role to 'admin' in Firestore.");
  } catch (error) {
    console.error(error);
  }
};
