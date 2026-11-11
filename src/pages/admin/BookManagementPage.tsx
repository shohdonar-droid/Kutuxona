import {useEffect, useState} from 'react';
import {getBooks, Book, updateBook, createBook} from '../../services/bookService';
import {createBookCopies, getBookAvailability} from '../../services/bookCopyService';
import {storage} from '../../firebase';
import {ref, uploadBytes, getDownloadURL} from 'firebase/storage';
import PageHeader from '../../components/PageHeader';
import {Card, Badge, Button} from '../../components/UIComponents';
import {Plus, BookPlus, Upload, FileText, CheckCircle, XCircle} from 'lucide-react';

export default function BookManagementPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', author: '', isbn: '', subject: '', language: 'O‘zbek', 
    annotation: '', year: '2024', pages: '', copiesCount: 50
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  useEffect(() => {
    fetchBooks();
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
        // 1. Upload files
        let pdfUrl = '';
        let pdfPath = '';
        let coverUrl = '';

        if (pdfFile) {
            const path = `books/pdfs/${Date.now()}_${pdfFile.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, pdfFile);
            pdfUrl = await getDownloadURL(storageRef);
            pdfPath = path;
        }

        if (coverFile) {
            const path = `books/covers/${Date.now()}_${coverFile.name}`;
            const storageRef = ref(storage, path);
            await uploadBytes(storageRef, coverFile);
            coverUrl = await getDownloadURL(storageRef);
        }

        // 2. Create Book doc
        const newBook = {
            title: formData.title,
            author: formData.author,
            isbn: formData.isbn,
            subject: formData.subject,
            language: formData.language,
            annotation: formData.annotation,
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
        
        // 3. Create initial copies
        if (formData.copiesCount > 0) {
            const prefix = formData.title.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'B');
            await createBookCopies(docRef.id, formData.copiesCount, prefix);
        }

        alert('Kitob va nusxalar muvaffaqiyatli yaratildi!');
        setShowForm(false);
        setFormData({
            title: '', author: '', isbn: '', subject: '', language: 'O‘zbek', 
            annotation: '', year: '2024', pages: '', copiesCount: 50
        });
        setPdfFile(null);
        setCoverFile(null);
        fetchBooks();
    } catch (err: any) {
        console.error("Creation error:", err);
        alert("Xatolik: " + err.message);
    } finally {
        setSubmitting(false);
    }
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
                        {submitting ? 'Saqlanmoqda...' : 'Kitobni fondga qo‘shish'}
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
