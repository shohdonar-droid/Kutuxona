import {collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, deleteDoc, orderBy} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

export interface Category {
  id: string;
  name: string;
  description?: string;
  bookCount: number;
  isActive: boolean;
  createdAt: string;
}

export const getCategories = async (activeOnly: boolean = false) => {
  const path = 'categories';
  try {
    const categoriesRef = collection(db, 'categories');
    let q = query(categoriesRef, orderBy('name', 'asc'));
    if (activeOnly) {
      q = query(categoriesRef, where('isActive', '==', true), orderBy('name', 'asc'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Category));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
};

export const createCategory = async (category: Omit<Category, 'id'>) => {
  const path = 'categories';
  try {
    return await addDoc(collection(db, 'categories'), category);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    throw error;
  }
};

export const updateCategory = async (id: string, data: Partial<Category>) => {
  const path = `categories/${id}`;
  try {
    await updateDoc(doc(db, 'categories', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const deleteCategory = async (id: string) => {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const incrementCategoryBookCount = async (categoryId: string, amount: number = 1) => {
    const {increment} = await import('firebase/firestore');
    await updateCategory(categoryId, { bookCount: increment(amount) as any });
};
