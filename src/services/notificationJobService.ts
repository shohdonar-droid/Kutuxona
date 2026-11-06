import { getFirestore } from 'firebase-admin/firestore';

export const processLoanNotifications = async () => {
  const db = getFirestore();
  const now = new Date();
  
  // Use Tashkent time (UTC+5)
  const tashkentOffset = 5 * 60; 
  const nowTashkent = new Date(now.getTime() + (now.getTimezoneOffset() + tashkentOffset) * 60000);

  const activeLoans = await db.collection('loans')
    .where('status', '==', 'ACTIVE')
    .get();

  for (const doc of activeLoans.docs) {
    const loan = doc.data();
    const dueAt = new Date(loan.dueAt.toDate());
    const diffTime = dueAt.getTime() - nowTashkent.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    let type = '';
    let message = '';
    
    if (diffDays === 5) {
      type = 'DUE_5_DAYS';
      message = `«${loan.bookTitle || 'Kitob'}» kitobini qaytarish muddatiga 5 kun qoldi.`;
    } else if (diffDays === 1) {
      type = 'DUE_1_DAY';
      message = `«${loan.bookTitle || 'Kitob'}» kitobini qaytarish muddati ertaga.`;
    } else if (diffDays <= 0) {
      type = 'OVERDUE';
      message = `«${loan.bookTitle || 'Kitob'}» kitobini qaytarish muddati o‘tgan. Iltimos, kitobni kutubxonaga qaytaring.`;
    }
    
    if (type) {
        const dedupeKey = `${doc.id}_${type}`;
        const existing = await db.collection('notifications')
            .where('dedupeKey', '==', dedupeKey)
            .get();
            
        if (existing.empty) {
            await db.collection('notifications').add({
                userId: loan.studentId,
                loanId: doc.id,
                bookId: loan.bookId,
                title: type === 'OVERDUE' ? 'Muddati o‘tgan' : 'Eslatma',
                message,
                type,
                isRead: false,
                dedupeKey,
                createdAt: new Date().toISOString()
            });
        }
    }
  }
};
