import {useEffect, useState} from 'react';
import {getCategories, createCategory, updateCategory, deleteCategory, Category} from '../../services/categoryService';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Plus, Tag, Trash2, Edit2, Check, X, BookOpen} from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    isActive: true
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  const availableIcons = ['📚', '📝', '🔬', '📊', '📰', '🎭', '💊', '🩺', '🧬', '💻', '🌍', '📐', '🧠', '⚖️'];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { seedDefaultCategoriesIfEmpty, getCategories } = await import('../../services/categoryService');
      const data = await seedDefaultCategoriesIfEmpty();
      setCategories(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        await createCategory({
            ...formData,
            bookCount: 0,
            createdAt: new Date().toISOString()
        });
        setShowForm(false);
        setFormData({ name: '', description: '', icon: '📚', isActive: true });
        fetchCategories();
    } catch (err: any) {
        alert("Xatolik: " + err.message);
    } finally {
        setSubmitting(false);
    }
  };

  const handleToggleStatus = async (category: Category) => {
    await updateCategory(category.id, { isActive: !category.isActive });
    fetchCategories();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Haqiqatan ham ushbu kategoriyani o'chirmoqchimisiz?")) {
        await deleteCategory(id);
        fetchCategories();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Kategoriyalar boshqaruvi" 
        subtitle="Kitoblarni saralash uchun yangi kategoriyalar qo'shing va tahrirlang."
        actions={
            <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={18} /> {showForm ? 'Bekor qilish' : 'Yangi kategoriya'}
            </Button>
        }
      />

      {showForm && (
        <Card className="max-w-2xl border-2 border-blue-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Tag className="text-blue-600" /> Yangi kategoriya yaratish
            </h2>
            <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Kategoriya nomi</label>
                    <input 
                        type="text" required
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="Masalan: Darsliklar yoki Tibbiyot adabiyotlari"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Ikonka (Belgi)</label>
                    <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-100 rounded-xl">
                        {availableIcons.map(ic => (
                            <button
                                key={ic}
                                type="button"
                                onClick={() => setFormData({...formData, icon: ic})}
                                className={`w-10 h-10 rounded-lg text-lg flex items-center justify-center transition-all ${
                                    formData.icon === ic ? 'bg-blue-600 shadow-md scale-110' : 'hover:bg-white'
                                }`}
                            >
                                {ic}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Tavsif (Ixtiyoriy)</label>
                    <textarea 
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-24 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        placeholder="Kategoriya haqida qisqacha..."
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="isActive"
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.isActive}
                        onChange={e => setFormData({...formData, isActive: e.target.checked})}
                    />
                    <label htmlFor="isActive" className="text-sm font-bold text-gray-700">Faol holatda</label>
                </div>

                <Button type="submit" className="w-full justify-center py-4" disabled={submitting}>
                    {submitting ? 'Saqlanmoqda...' : 'Kategoriyani saqlash'}
                </Button>
            </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
              <p className="col-span-full text-center py-12 text-gray-400 italic">Yuklanmoqda...</p>
          ) : categories.length === 0 ? (
              <p className="col-span-full text-center py-12 text-gray-400 italic">Kategoriyalar mavjud emas.</p>
          ) : categories.map(category => (
              <Card key={category.id} className="relative group">
                  <div className="flex justify-between items-start mb-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${category.isActive ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-400'}`}>
                          {category.icon || <Tag size={24} />}
                      </div>
                      <Badge variant={category.isActive ? 'green' : 'gray'}>
                          {category.isActive ? 'Faol' : 'Nofaol'}
                      </Badge>
                  </div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">
                      {category.description || 'Tavsif berilmagan.'}
                  </p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                          <BookOpen size={14} />
                          <span>{category.bookCount} ta kitob</span>
                      </div>
                      <div className="flex gap-2">
                          <button 
                            onClick={() => handleToggleStatus(category)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                            title="Holatni o'zgartirish"
                          >
                              {category.isActive ? <X size={18} /> : <Check size={18} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(category.id)}
                            className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg text-gray-400 transition-colors"
                            title="O'chirish"
                          >
                              <Trash2 size={18} />
                          </button>
                      </div>
                  </div>
              </Card>
          ))}
      </div>
    </div>
  );
}
