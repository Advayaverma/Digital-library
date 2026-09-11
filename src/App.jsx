import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const navigate = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicPage = ['home', 'login', 'signup', 'about', 'contact'].includes(currentPage);

  return (
    <div className="app-root">
      {/* Reusable Navbar for Public Pages */}
      {isPublicPage && (
        <Navbar currentPage={currentPage} onNavigate={navigate} />
      )}

      {/* Main Pages */}
      <main>
        {currentPage === 'home' && <Home onNavigate={navigate} />}
        {currentPage === 'login' && <Login onNavigate={navigate} />}
        {currentPage === 'signup' && <Signup onNavigate={navigate} />}
        {currentPage === 'about' && <About onNavigate={navigate} />}
        {currentPage === 'contact' && <Contact onNavigate={navigate} />}
        {currentPage === 'userDashboard' && <UserDashboard onNavigate={navigate} />}
        {currentPage === 'adminDashboard' && <AdminDashboard onNavigate={navigate} />}
      </main>
    </div>
  );
}
