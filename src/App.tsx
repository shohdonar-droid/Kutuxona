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
import SidebarLayout from './components/SidebarLayout';

function ProtectedRoute({children, allowedRoles}: {children: React.ReactNode, allowedRoles: string[]}) {
  const {user, profile, loading} = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-900 font-bold">Yuklanmoqda...</div>;
  if (!user) return <Navigate to="/login" />;
  
  if (!profile || !allowedRoles.includes(profile.role)) {
    const dashboardPath = profile ? `/${profile.role}` : '/';
    return <Navigate to={dashboardPath} replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/books" element={<BooksPage />} />
        <Route path="/books/:id" element={<BookDetailPage />} />
        
        {/* Authenticated Routes with Sidebar */}
        <Route element={<SidebarLayout />}>
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/favorites" element={<ProtectedRoute allowedRoles={['student']}><FavoritesPage /></ProtectedRoute>} />
            <Route path="/student/reading-history" element={<ProtectedRoute allowedRoles={['student']}><ReadingHistoryPage /></ProtectedRoute>} />
            <Route path="/student/my-books" element={<ProtectedRoute allowedRoles={['student']}><MyBooksPage /></ProtectedRoute>} />
            <Route path="/student/notifications" element={<ProtectedRoute allowedRoles={['student', 'admin', 'librarian', 'tutor']}><NotificationsPage /></ProtectedRoute>} />
            <Route path="/student/statistics" element={<ProtectedRoute allowedRoles={['student']}><StudentStatisticsPage /></ProtectedRoute>} />
            <Route path="/student/reservations" element={<ProtectedRoute allowedRoles={['student']}><div className="p-8">Bronlarim sahifasi (Tez orada...)</div></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><div className="p-8">Talaba Profili</div></ProtectedRoute>} />
            <Route path="/student/settings" element={<ProtectedRoute allowedRoles={['student']}><div className="p-8">Talaba Sozlamalari</div></ProtectedRoute>} />
            <Route path="/student/read/:bookId" element={<ProtectedRoute allowedRoles={['student', 'admin', 'librarian', 'tutor']}><PDFReader /></ProtectedRoute>} />

            {/* Librarian Routes */}
            <Route path="/librarian" element={<ProtectedRoute allowedRoles={['librarian']}><LibrarianDashboard /></ProtectedRoute>} />
            <Route path="/librarian/loans/issue" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianIssuePage /></ProtectedRoute>} />
            <Route path="/librarian/loans/return" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianReturnPage /></ProtectedRoute>} />
            <Route path="/librarian/scanner" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianScannerPage /></ProtectedRoute>} />
            <Route path="/librarian/books" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><LibrarianBookFondPage /></ProtectedRoute>} />
            <Route path="/librarian/copies" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><div className="p-8">Kitob nusxalari (Tez orada...)</div></ProtectedRoute>} />
            <Route path="/librarian/reservations" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><div className="p-8">Bronlar nazorati (Tez orada...)</div></ProtectedRoute>} />
            <Route path="/librarian/overdue" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><div className="p-8">Muddati o'tgan kitoblar</div></ProtectedRoute>} />
            <Route path="/librarian/reports" element={<ProtectedRoute allowedRoles={['librarian', 'admin']}><div className="p-8">Kutubxonachi Hisobotlari</div></ProtectedRoute>} />
            <Route path="/librarian/profile" element={<ProtectedRoute allowedRoles={['librarian']}><div className="p-8">Kutubxonachi Profili</div></ProtectedRoute>} />
            <Route path="/librarian/settings" element={<ProtectedRoute allowedRoles={['librarian']}><div className="p-8">Kutubxonachi Sozlamalari</div></ProtectedRoute>} />

            {/* Tutor Routes */}
            <Route path="/tutor" element={<ProtectedRoute allowedRoles={['tutor']}><TutorDashboard /></ProtectedRoute>} />
            <Route path="/tutor/groups" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><AdminGroupsPage /></ProtectedRoute>} />
            <Route path="/tutor/students" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/tutor/students/:studentId" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><StudentDetailPage /></ProtectedRoute>} />
            <Route path="/tutor/activity" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><div className="p-8">Kitob faolligi monitoringi</div></ProtectedRoute>} />
            <Route path="/tutor/statistics" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><div className="p-8">Tyutor statistikasi</div></ProtectedRoute>} />
            <Route path="/tutor/low-activity" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><div className="p-8">Faolligi past talabalar</div></ProtectedRoute>} />
            <Route path="/tutor/reports" element={<ProtectedRoute allowedRoles={['tutor', 'admin']}><div className="p-8">Tyutor Hisobotlari</div></ProtectedRoute>} />
            <Route path="/tutor/profile" element={<ProtectedRoute allowedRoles={['tutor']}><div className="p-8">Tyutor Profili</div></ProtectedRoute>} />
            <Route path="/tutor/settings" element={<ProtectedRoute allowedRoles={['tutor']}><div className="p-8">Tyutor Sozlamalari</div></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/students" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/tutors" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/librarians" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/admin/groups" element={<ProtectedRoute allowedRoles={['admin']}><AdminGroupsPage /></ProtectedRoute>} />
            <Route path="/admin/books" element={<ProtectedRoute allowedRoles={['admin']}><BookManagementPage /></ProtectedRoute>} />
            <Route path="/admin/copies" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8">Admin Nusxalar boshqaruvi</div></ProtectedRoute>} />
            <Route path="/admin/loans" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8">Barcha kreditlar (Berilgan kitoblar)</div></ProtectedRoute>} />
            <Route path="/admin/reservations" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8">Barcha bronlar</div></ProtectedRoute>} />
            <Route path="/admin/analitika" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8">Tizim Hisobotlari</div></ProtectedRoute>} />
            <Route path="/admin/audit" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8">Audit loglari</div></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettingsPage /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute allowedRoles={['admin']}><div className="p-8">Admin Profili</div></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
