import React from 'react';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import HomePage from './pages/HomePage';
import {useAuth} from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import LibrarianDashboard from './pages/dashboard/LibrarianDashboard';
import TutorDashboard from './pages/dashboard/TutorDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import BooksPage from './pages/BooksPage';
import BookDetailPage from './pages/BookDetailPage';
import BookManagementPage from './pages/admin/BookManagementPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import AdminStudentsPage from './pages/admin/AdminStudentsPage';
import AdminGroupsPage from './pages/admin/AdminGroupsPage';
import StudentDetailPage from './pages/tutor/StudentDetailPage';
import PDFReader from './pages/student/PDFReader';
import FavoritesPage from './pages/student/FavoritesPage';
import ReadingHistoryPage from './pages/student/ReadingHistoryPage';
import MyBooksPage from './pages/student/MyBooksPage';
import NotificationsPage from './pages/student/NotificationsPage';
import StudentStatisticsPage from './pages/student/StudentStatisticsPage';
import LibrarianIssuePage from './pages/librarian/LibrarianIssuePage';
import LibrarianReturnPage from './pages/librarian/LibrarianReturnPage';
import LibrarianScannerPage from './pages/librarian/LibrarianScannerPage';
import LibrarianBookFondPage from './pages/librarian/LibrarianBookFondPage';

function ProtectedRoute({children, allowedRoles}: {children: React.ReactNode, allowedRoles: string[]}) {
  const {user, profile, loading} = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (!profile || !allowedRoles.includes(profile.role)) return <div>Access Denied</div>;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        <Route path="/student/read/:bookId" element={<ProtectedRoute allowedRoles={['student', 'admin', 'librarian', 'tutor']}><PDFReader /></ProtectedRoute>} />
        <Route path="/student/favorites" element={<ProtectedRoute allowedRoles={['student']}><FavoritesPage /></ProtectedRoute>} />
        <Route path="/student/reading-history" element={<ProtectedRoute allowedRoles={['student']}><ReadingHistoryPage /></ProtectedRoute>} />
        <Route path="/student/my-books" element={<ProtectedRoute allowedRoles={['student']}><MyBooksPage /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student']}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/student/statistics" element={<ProtectedRoute allowedRoles={['student']}><StudentStatisticsPage /></ProtectedRoute>} />
        <Route path="/librarian/loans/issue" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianIssuePage /></ProtectedRoute>} />
        <Route path="/librarian/loans/return" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianReturnPage /></ProtectedRoute>} />
        <Route path="/librarian/scanner" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianScannerPage /></ProtectedRoute>} />
        <Route path="/librarian/books" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianBookFondPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminStudentsPage /></ProtectedRoute>} />
        <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={['admin']}><AdminGroupsPage /></ProtectedRoute>} />
        <Route path="/tutor/students/:studentId" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><StudentDetailPage /></ProtectedRoute>} />
        <Route path="/admin/books" element={<ProtectedRoute allowedRoles={['admin']}><BookManagementPage /></ProtectedRoute>} />
        <Route path="/librarian/books" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><BookManagementPage /></ProtectedRoute>} />
        <Route path="/student/*" element={<ProtectedRoute allowedRoles={['student', 'admin']}><StudentDashboard /></ProtectedRoute>} />        <Route path="/librarian/*" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianDashboard /></ProtectedRoute>} />
        <Route path="/tutor/*" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><TutorDashboard /></ProtectedRoute>} />
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
