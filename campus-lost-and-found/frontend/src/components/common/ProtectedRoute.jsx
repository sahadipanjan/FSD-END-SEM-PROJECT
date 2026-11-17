import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isUserAuthenticated, admin, isAdminAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating session..." />;
  }

  if (requiredRole === 'ROLE_USER') {
    if (!isUserAuthenticated || !user) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  if (requiredRole === 'ROLE_ADMIN') {
    if (!isAdminAuthenticated || !admin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
