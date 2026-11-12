import {collection, getDocs, getDoc, doc, addDoc, updateDoc, query, where, deleteDoc, orderBy} from 'firebase/firestore';
import {db} from '../firebase';
import {handleFirestoreError, OperationType} from '../utils/firestoreError';

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  bookCount: number;
  isActive: boolean;
  createdAt: string;
}

export const DEFAULT_INITIAL_CATEGORIES = [
  { name: 'Darsliklar', icon: '📚', description: 'Oliy o‘quv yurti darsliklari' },
  { name: 'O‘quv qo‘llanmalar', icon: '📝', description: 'Amaliy va nazariy qo‘llanmalar' },
  { name: 'Ilmiy adabiyotlar', icon: '🔬', description: 'Monografiyalar, dissertatsiyalar va tadqiqotlar' },
  { name: 'Jadvallar', icon: '📊', description: 'Tibbiy va ilmiy jadvallar, atlaslar' },
  { name: 'Jurnallar', icon: '📰', description: 'Ilmiy va davriy nashrlar' },
  { name: 'Badiiy', icon: '🎭', description: 'Klassik va zamonaviy badiiy adabiyotlar' }
];

export const seedDefaultCategoriesIfEmpty = async () => {
  try {
    const existing = await getCategories(false);
    if (existing.length === 0) {
      for (const item of DEFAULT_INITIAL_CATEGORIES) {
        await addDoc(collection(db, 'categories'), {
          ...item,
          bookCount: 0,
          isActive: true,
          createdAt: new Date().toISOString()
        });
      }
      return await getCategories(false);
    }
    return existing;
  } catch (err) {
    console.error('Error seeding initial categories:', err);
    return [];
  }
};

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
