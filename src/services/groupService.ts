import {collection, getDocs, query, where, addDoc, updateDoc, doc, arrayUnion} from 'firebase/firestore';
import {db} from '../firebase';

export interface Group {
  id: string;
  name: string;
  code: string;
  facultyId?: string;
  directionId?: string;
  course?: number;
  tutorIds?: string[];
  isActive: boolean;
  createdAt?: any;
}

export const getGroups = async () => {
  const snapshot = await getDocs(collection(db, 'groups'));
  return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Group));
};

export const createGroup = async (group: Omit<Group, 'id'>) => {
  return await addDoc(collection(db, 'groups'), group);
};

export const assignTutorToGroup = async (groupId: string, tutorId: string) => {
  await updateDoc(doc(db, 'groups', groupId), {tutorIds: arrayUnion(tutorId)});
  await updateDoc(doc(db, 'users', tutorId), {groupIds: arrayUnion(groupId)});
};
