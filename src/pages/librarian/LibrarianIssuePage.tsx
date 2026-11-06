import {useState} from 'react';
import {issueBook} from '../../services/loanService';
import {getUserProfile} from '../../services/userService';

export default function LibrarianIssuePage() {
  const [studentId, setStudentId] = useState('');
  const [bookId, setBookId] = useState('');
  const [copyId, setCopyId] = useState('');
  const [inventoryId, setInventoryId] = useState('');

  const handleIssue = async () => {
    const student = await getUserProfile(studentId);
    if (!student || !student.groupId) {
        alert('Talaba topilmadi yoki guruhga biriktirilmagan');
        return;
    }
    await issueBook({studentId, studentGroupId: student.groupId, bookId, copyId, inventoryId});
    alert('Kitob berildi!');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Kitob berish</h1>
      <input className="border p-2" placeholder="Student ID" value={studentId} onChange={e => setStudentId(e.target.value)} />
      <input className="border p-2" placeholder="Book ID" value={bookId} onChange={e => setBookId(e.target.value)} />
      <input className="border p-2" placeholder="Copy ID" value={copyId} onChange={e => setCopyId(e.target.value)} />
      <input className="border p-2" placeholder="Inventory ID" value={inventoryId} onChange={e => setInventoryId(e.target.value)} />
      <button className="bg-blue-600 text-white p-2" onClick={handleIssue}>Berish</button>
    </div>
  );
}
