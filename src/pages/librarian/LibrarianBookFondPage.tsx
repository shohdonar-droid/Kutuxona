import {useEffect, useState} from 'react';
import {getBookCopies, BookCopy, createBookCopy} from '../../services/bookCopyService';
import {getBooks, Book} from '../../services/bookService';

export default function LibrarianBookFondPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [numCopies, setNumCopies] = useState<number>(1);

  useEffect(() => {
    getBooks(true).then(setBooks);
  }, []);

  const handleAddCopies = async () => {
    if (!selectedBookId || numCopies < 1) return;
    
    for (let i = 0; i < numCopies; i++) {
        await createBookCopy({
            bookId: selectedBookId,
            inventoryId: `INV-${Date.now()}-${i}`,
            barcode: `BC-${Date.now()}-${i}`,
            qrCode: `QR-${Date.now()}-${i}`,
            status: 'AVAILABLE',
            location: 'Kutubxona fondi',
            condition: 'Yaxshi'
        });
    }
    alert(`${numCopies} ta nusxa qo'shildi.`);
  };

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Fond boshqaruvi</h1>
        
        <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-xl mb-4">Nusxa qo'shish</h2>
            <select className="border p-2 mr-2" onChange={e => setSelectedBookId(e.target.value)}>
                <option value="">Kitobni tanlang</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
            </select>
            <input type="number" className="border p-2 mr-2" value={numCopies} onChange={e => setNumCopies(parseInt(e.target.value))} />
            <button className="bg-blue-600 text-white p-2" onClick={handleAddCopies}>Nusxa qo'shish</button>
        </div>
        
        <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl mb-4">Fizik nusxalar</h2>
            <p>Ushbu qismni to'liq implementatsiya qilish uchun kitoblarni tanlab, nusxalar ro'yxatini yuklash kerak.</p>
        </div>
    </div>
  );
}
