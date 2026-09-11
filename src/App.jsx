import React, { useState } from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import UserDashboard from './pages/UserDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isPublicPage = ['home', 'login', 'signup', 'about', 'contact'].includes(currentPage);

  return (
    <div className="app-root">
      {/* Top Navigation Bar for Public Pages */}
      {isPublicPage && (
        <div id="nav" className={currentPage !== 'home' ? 'fixed-nav' : ''}>
          <div id="nav-part1">
            <h1
              onClick={() => navigate('home')}
              style={{ cursor: 'pointer', margin: 0 }}
            >
              Digital Library
            </h1>
          </div>
          <div id="nav-part2">
            <div id="links" className={mobileMenuOpen ? 'show' : ''}>
              <a
                href="#home"
                className={currentPage === 'home' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('home');
                }}
              >
                Home
              </a>
              <a
                href="#login"
                className={currentPage === 'login' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('login');
                }}
              >
                Login
              </a>
              <a
                href="#signup"
                className={currentPage === 'signup' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('signup');
                }}
              >
                Sign Up
              </a>
              <a
                href="#about"
                className={currentPage === 'about' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('about');
                }}
              >
                About
              </a>
              <a
                href="#contact"
                className={currentPage === 'contact' ? 'active' : ''}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('contact');
                }}
              >
                Contact
              </a>
            </div>
            <div id="icons" onClick={() => setMobileMenuOpen((prev) => !prev)}>
              <i className="fas fa-bars"></i>
            </div>
          </div>
        </div>
      )}

      {/* Page Routing / Rendering */}
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
