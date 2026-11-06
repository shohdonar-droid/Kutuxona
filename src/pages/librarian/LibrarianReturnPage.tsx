import {useState} from 'react';
import {returnBook} from '../../services/loanService';

export default function LibrarianReturnPage() {
  const [loanId, setLoanId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [bookId, setBookId] = useState('');

  const handleReturn = async () => {
    await returnBook(loanId, copyId, 'RETURNED', bookId);
    alert('Kitob qaytarildi!');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Kitob qaytarish</h1>
      <input className="border p-2" placeholder="Loan ID" value={loanId} onChange={e => setLoanId(e.target.value)} />
      <input className="border p-2" placeholder="Copy ID" value={copyId} onChange={e => setCopyId(e.target.value)} />
      <input className="border p-2" placeholder="Book ID" value={bookId} onChange={e => setBookId(e.target.value)} />
      <button className="bg-green-600 text-white p-2" onClick={handleReturn}>Qaytarish</button>
    </div>
  );
}
