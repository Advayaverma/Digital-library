import React from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const location = useLocation();
  const isPublicPage = ['/', '/login', '/signup', '/about', '/contact'].includes(location.pathname);

  return (
    <div className="app-root">
      {/* Top Navbar rendered on public pages */}
      {isPublicPage && <Navbar />}

      {/* Declarative Client-side Routes with Role Protection */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />

          {/* User Portal: Protected for authenticated users */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Portal: Protected strictly for administrators */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
