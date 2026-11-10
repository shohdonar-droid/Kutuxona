import {doc, getDoc, setDoc} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

export interface LibrarySettings {
  maxActiveLoans: number;
  defaultLoanDays: number;
  dueSoonReminderDays: number;
  reservationEnabled: boolean;
  electronicReadingEnabled: boolean;
  libraryOpenTime: string;
  libraryCloseTime: string;
}

const DEFAULT_SETTINGS: LibrarySettings = {
  maxActiveLoans: 5,
  defaultLoanDays: 14,
  dueSoonReminderDays: 5,
  reservationEnabled: true,
  electronicReadingEnabled: true,
  libraryOpenTime: "08:00",
  libraryCloseTime: "18:00"
};

export const getLibrarySettings = async () => {
  const path = 'settings/library';
  try {
    const docRef = doc(db, 'settings', 'library');
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? (docSnap.data() as LibrarySettings) : DEFAULT_SETTINGS;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return DEFAULT_SETTINGS;
  }
};

export const updateLibrarySettings = async (settings: LibrarySettings) => {
  const path = 'settings/library';
  try {
    await setDoc(doc(db, 'settings', 'library'), settings);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
