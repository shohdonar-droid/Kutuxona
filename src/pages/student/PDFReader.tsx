import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {Document, Page, pdfjs} from 'react-pdf';
import {useAuth} from '../../context/AuthContext';
import {updateReadingProgress, getReadingProgress} from '../../services/readingService';
import {getBook} from '../../services/bookService';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFReader() {
  const {bookId} = useParams<{bookId: string}>();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const {user, profile} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (bookId && user) {
        getBook(bookId).then(book => {
            if (book && book.pdfStoragePath) {
                setPdfUrl(book.pdfStoragePath); 
            }
        });
        getReadingProgress(user.uid, bookId).then(progress => {
            if (progress) setPageNumber(progress.currentPage);
        });
    }
  }, [bookId, user]);

  const onDocumentLoadSuccess = ({numPages}: {numPages: number}) => {
    setNumPages(numPages);
  };

  const handlePageChange = (newPage: number) => {
    setPageNumber(newPage);
    if (user && bookId) {
        updateReadingProgress(user.uid, bookId, {currentPage: newPage, progressPercent: Math.round((newPage/numPages)*100), status: 'IN_PROGRESS'});
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4">
        <button onClick={() => handlePageChange(Math.max(1, pageNumber - 1))}>Prev</button>
        <span className="mx-4">{pageNumber} / {numPages}</span>
        <button onClick={() => handlePageChange(Math.min(numPages, pageNumber + 1))}>Next</button>
      </div>
      {pdfUrl && (
        <Document file={pdfUrl} onLoadSuccess={onDocumentLoadSuccess}>
          <Page pageNumber={pageNumber} />
        </Document>
      )}
    </div>
  );
}
