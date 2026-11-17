import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Components
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import BrowsePage from './pages/public/BrowsePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import AdminLoginPage from './pages/public/AdminLoginPage';
import AdminRegisterPage from './pages/public/AdminRegisterPage';
import NotFoundPage from './pages/public/NotFoundPage';

// User Pages
import UserDashboard from './pages/user/UserDashboard';
import ReportItemPage from './pages/user/ReportItemPage';
import ItemDetailPage from './pages/user/ItemDetailPage';
import MyItemsPage from './pages/user/MyItemsPage';
import MyClaimsPage from './pages/user/MyClaimsPage';
import NotificationsPage from './pages/user/NotificationsPage';
import UserProfilePage from './pages/user/UserProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ClaimsQueuePage from './pages/admin/ClaimsQueuePage';
import ManageItemsPage from './pages/admin/ManageItemsPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import ManageCategoriesLocationsPage from './pages/admin/ManageCategoriesLocationsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import AdminProfilePage from './pages/admin/AdminProfilePage';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: '16px',
            background: '#1e293b',
            color: '#f8fafc',
            fontSize: '13px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowsePage />} />
          <Route path="/items/:id" element={<ItemDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
        </Route>

        {/* User Routes (Guarded for ROLE_USER) */}
        <Route
          path="/user"
          element={
            <ProtectedRoute requiredRole="ROLE_USER">
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/user/dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="browse" element={<BrowsePage isUserView={true} />} />
          <Route path="report" element={<ReportItemPage />} />
          <Route path="items/:id" element={<ItemDetailPage />} />
          <Route path="my-items" element={<MyItemsPage />} />
          <Route path="my-claims" element={<MyClaimsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<UserProfilePage />} />
        </Route>

        {/* Admin Routes (Guarded for ROLE_ADMIN) */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ROLE_ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="claims" element={<ClaimsQueuePage />} />
          <Route path="items" element={<ManageItemsPage />} />
          <Route path="users" element={<ManageUsersPage />} />
          <Route path="categories-locations" element={<ManageCategoriesLocationsPage />} />
          <Route path="audit-logs" element={<AuditLogsPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;
