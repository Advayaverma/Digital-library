import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, role, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          background: "url('/pexels-repuding-12064.jpg') no-repeat center center fixed",
          backgroundSize: 'cover',
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: 'rgba(0,0,0,0.8)',
            padding: '30px 40px',
            borderRadius: '10px',
          }}
        >
          <LoadingSpinner message="Verifying session..." />
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to /login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If roles are specified and user's role is not included
  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    alert('Access Denied: You do not have permission to view this page.');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
