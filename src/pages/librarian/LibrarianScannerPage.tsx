import {useState} from 'react';
import {QrReader} from 'react-qr-reader';
import {collection, query, where, getDocs} from 'firebase/firestore';
import {db} from '../../firebase';
import {BookCopy, updateBookCopyStatus} from '../../services/bookCopyService';
import {issueBook, returnBook} from '../../services/loanService';
import {getBook} from '../../services/bookService';

export default function LibrarianScannerPage() {
  const [copy, setCopy] = useState<BookCopy & {bookTitle?: string} | null>(null);

  const handleScan = async (inventoryId: string) => {
    const q = query(collection(db, 'bookCopies'), where('inventoryId', '==', inventoryId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const copyData = {id: snapshot.docs[0].id, ...snapshot.docs[0].data()} as BookCopy;
      const book = await getBook(copyData.bookId);
      setCopy({...copyData, bookTitle: book?.title});
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">QR/Barcode Skaner</h1>
      <QrReader
        onResult={(result) => {
          if (!!result) handleScan(result.getText());
        }}
        constraints={{facingMode: 'environment'}}
        className="w-full max-w-md mx-auto"
      />
      {copy && (
        <div className="border p-4 mt-4 rounded">
            <h2 className="text-xl">{copy.bookTitle}</h2>
            <p>Inventar: {copy.inventoryId}</p>
            <p>Holat: {copy.status}</p>
            {copy.status === 'AVAILABLE' && <button onClick={() => alert('Talabani tanlang')} className="bg-blue-600 text-white p-2 mt-2">Kitob berish</button>}
            {copy.status === 'BORROWED' && <button onClick={() => returnBook(copy.id, copy.id, 'RETURNED', copy.bookId).then(() => alert('Qaytarildi!'))} className="bg-green-600 text-white p-2 mt-2">Kitobni qaytarish</button>}
        </div>
      )}
    </div>
  );
}
