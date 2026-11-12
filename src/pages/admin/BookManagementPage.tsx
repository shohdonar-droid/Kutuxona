import {useEffect, useState} from 'react';
import {getBooks, Book, updateBook, createBook} from '../../services/bookService';
import {createBookCopies, getBookAvailability} from '../../services/bookCopyService';
import {getCategories, incrementCategoryBookCount, Category} from '../../services/categoryService';
import {storage} from '../../firebase';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Plus, BookPlus, Upload, FileText, CheckCircle, XCircle, Tag} from 'lucide-react';

export default function BookManagementPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', subject: '', language: 'O‘zbek', 
    annotation: '', year: '2024', pages: '', copiesCount: 50,
    categoryIds: [] as string[]
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBooks();
    getCategories(true).then(setCategories);
  }, []);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getBooks(false);
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [uploadStatus, setUploadStatus] = useState<string>('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.categoryIds.length === 0) {
        alert("Kamida bitta kategoriya tanlang!");
        return;
    }

    setSubmitting(true);
    setUploadStatus("Fayllar tayyorlanmoqda...");

    try {
        let pdfUrl = '';
        let pdfPath = '';
        let coverUrl = '';

        // 1. Upload files in parallel for maximum speed
        const uploadTasks = [];

        if (coverFile) {
            setUploadStatus("Muqova rasmi yuklanmoqda...");
            const cPath = `books/covers/${Date.now()}_${coverFile.name.replace(/\s+/g, '_')}`;
            const cRef = ref(storage, cPath);
            uploadTasks.push(
                uploadBytes(cRef, coverFile).then(async () => {
                    coverUrl = await getDownloadURL(cRef);
                })
            );
        }

        if (pdfFile) {
            setUploadStatus("PDF fayli yuklanmoqda...");
            const pPath = `books/pdfs/${Date.now()}_${pdfFile.name.replace(/\s+/g, '_')}`;
            const pRef = ref(storage, pPath);
            uploadTasks.push(
                uploadBytes(pRef, pdfFile).then(async () => {
                    pdfUrl = await getDownloadURL(pRef);
                    pdfPath = pPath;
                })
            );
        }

        if (uploadTasks.length > 0) {
            setUploadStatus("Fayllar bulutga yuklanmoqda...");
            await Promise.all(uploadTasks);
        }

        // 2. Create Book doc
        setUploadStatus("Kitob ma'lumotlari saqlanmoqda...");
        const newBook = {
            title: formData.title.trim(),
            author: formData.author.trim(),
            isbn: formData.isbn.trim(),
            subject: formData.subject.trim(),
            categoryIds: formData.categoryIds,
            language: formData.language,
            annotation: formData.annotation.trim(),
            year: formData.year,
            pages: formData.pages,
            isPublished: true,
            authorIds: [], 
            coverUrl: coverUrl,
            pdfStoragePath: pdfPath,
            pdfUrl: pdfUrl,
            views: 0,
            reads: 0,
            favorites: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await createBook(newBook);
        
        // 3. Update category counts in background
        formData.categoryIds.forEach(id => {
            incrementCategoryBookCount(id, 1).catch(err => console.warn('Cat count increment error:', err));
        });

        // 4. Create initial copies efficiently via batch
        if (formData.copiesCount > 0) {
            setUploadStatus("Kitob nusxalari generatsiya qilinmoqda...");
            const prefix = formData.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'B') || 'BK';
            await createBookCopies(docRef.id, formData.copiesCount, prefix);
        }

        alert('Kitob va nusxalar muvaffaqiyatli saqlandi!');
        setShowForm(false);
        setFormData({
            title: '', author: '', isbn: '', subject: '', language: 'O‘zbek', 
            annotation: '', year: '2024', pages: '', copiesCount: 50,
            categoryIds: []
        });
        setPdfFile(null);
        setCoverFile(null);
        setUploadStatus('');
        fetchBooks();
    } catch (err: any) {
        console.error("Creation error:", err);
        alert("Xatolik yuz berdi: " + (err.message || err));
    } finally {
        setSubmitting(false);
        setUploadStatus('');
    }
  };

  const toggleCategory = (id: string) => {
    setFormData(prev => ({
        ...prev,
        categoryIds: prev.categoryIds.includes(id) 
            ? prev.categoryIds.filter(cid => cid !== id)
            : [...prev.categoryIds, id]
    }));
  };

  const togglePublished = async (book: Book) => {
    await updateBook(book.id, {isPublished: !book.isPublished});
    setBooks(books.map(b => b.id === book.id ? {...b, isPublished: !b.isPublished} : b));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader 
        title="Kitoblarni boshqarish" 
        subtitle="Fonddagi kitoblarni tahrirlash va yangi adabiyotlar qo'shish."
        actions={
            <Button onClick={() => setShowForm(!showForm)}>
                <Plus size={18} /> {showForm ? 'Bekor qilish' : 'Yangi kitob'}
            </Button>
        }
      />

      {showForm && (
        <Card className="max-w-4xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2"><BookPlus className="text-blue-600" /> Yangi kitob ma'lumotlari</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Kitob nomi</label>
                    <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Muallif</label>
                    <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">ISBN</label>
                    <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.isbn} onChange={e => setFormData({...formData, isbn: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Fan / Yo'nalish</label>
                    <input type="text" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Til</label>
                    <select className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}>
                        <option>O‘zbek</option>
                        <option>Ruscha</option>
                        <option>Inglizcha</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nashr yili</label>
                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Sahifalar soni</label>
                    <input type="text" className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl"
                        value={formData.pages} onChange={e => setFormData({...formData, pages: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Nusxalar soni (Jismoniy)</label>
                    <input type="number" required className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-blue-600"
                        value={formData.copiesCount} onChange={e => setFormData({...formData, copiesCount: parseInt(e.target.value) || 0})} />
                </div>

                <div className="md:col-span-3 space-y-3">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                        <Tag size={16} className="text-blue-600" /> Kategoriyalar (Kamida bitta)
                    </label>
                    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                type="button"
                                onClick={() => toggleCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                                    formData.categoryIds.includes(cat.id)
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/20'
                                    : 'bg-white text-gray-500 border-gray-100 hover:border-blue-200'
                                }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                        {categories.length === 0 && <p className="text-xs text-gray-400 italic">Kategoriyalar yuklanmoqda...</p>}
                    </div>
                </div>
                
                <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-bold text-gray-700">Annotatsiya (Qisqacha mazmun)</label>
                    <textarea className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-32"
                        value={formData.annotation} onChange={e => setFormData({...formData, annotation: e.target.value})} />
                </div>

                <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Muqova rasmi (JPG/PNG)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-all cursor-pointer group relative">
                            <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                            <div className="flex flex-col items-center">
                                <Upload className="text-gray-300 group-hover:text-blue-500 mb-2" size={32} />
                                <p className="font-bold text-gray-500 text-xs truncate max-w-full px-4">{coverFile ? coverFile.name : 'Muqovani yuklash'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Elektron shakli (PDF)</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:bg-gray-50 transition-all cursor-pointer group relative">
                            <input type="file" accept="application/pdf" className="absolute inset-0 opacity-0 cursor-pointer" 
                                onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                            <div className="flex flex-col items-center">
                                <FileText className="text-gray-300 group-hover:text-blue-500 mb-2" size={32} />
                                <p className="font-bold text-gray-500 text-xs truncate max-w-full px-4">{pdfFile ? pdfFile.name : 'PDF faylni yuklash'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-3 pt-6">
                    <Button type="submit" className="w-full justify-center py-4 text-lg shadow-xl shadow-blue-900/20" disabled={submitting}>
                        {submitting ? (uploadStatus || 'Saqlanmoqda...') : 'Kitobni fondga qo‘shish'}
                    </Button>
                </div>
            </form>
        </Card>
      )}

      <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase font-bold text-gray-400 tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Kitob</th>
                          <th className="px-6 py-4 text-center">Nusxalar</th>
                          <th className="px-6 py-4 text-center">Elektron</th>
                          <th className="px-6 py-4 text-center">Holat</th>
                          <th className="px-6 py-4 text-right">Amallar</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      {loading ? (
                          <tr><td colSpan={5} className="p-10 text-center">Yuklanmoqda...</td></tr>
                      ) : books.map(book => (
                          <tr key={book.id} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-6 py-4">
                                  <p className="text-sm font-bold text-gray-900">{book.title}</p>
                                  <p className="text-xs text-gray-500 mt-1">{book.author}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <BookAvailability bookId={book.id} />
                              </td>
                              <td className="px-6 py-4 text-center">
                                  {book.pdfStoragePath ? <FileText size={18} className="mx-auto text-green-500" /> : <XCircle size={18} className="mx-auto text-gray-300" />}
                              </td>
                              <td className="px-6 py-4 text-center">
                                  <Badge variant={book.isPublished ? 'green' : 'yellow'}>{book.isPublished ? 'Published' : 'Draft'}</Badge>
                              </td>
                              <td className="px-6 py-4 text-right space-x-2">
                                  <button onClick={() => togglePublished(book)} className="text-xs font-bold text-blue-600 hover:underline">
                                      {book.isPublished ? 'Unpublish' : 'Publish'}
                                  </button>
                                  <button className="text-xs font-bold text-gray-400 hover:text-red-500 transition-colors">O'chirish</button>
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </Card>
    </div>
  );
}

function BookAvailability({ bookId }: { bookId: string }) {
    const [stats, setStats] = useState<{available: number, total: number} | null>(null);

    useEffect(() => {
        getBookAvailability(bookId).then(setStats);
    }, [bookId]);

    if (!stats) return <span className="text-xs text-gray-400 animate-pulse">...</span>;

    return (
        <Badge variant={stats.available > 0 ? 'blue' : 'red'}>
            {stats.available} / {stats.total}
        </Badge>
    );
}
