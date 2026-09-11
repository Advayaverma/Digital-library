import React, { useState } from 'react';

export default function Navbar({ currentPage, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (page) => {
    onNavigate(page);
    setMobileMenuOpen(false);
  };

  return (
    <div id="nav" className={currentPage !== 'home' ? 'fixed-nav' : ''}>
      <div id="nav-part1">
        <h1
          onClick={() => handleLinkClick('home')}
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
              handleLinkClick('home');
            }}
          >
            Home
          </a>
          <a
            href="#login"
            className={currentPage === 'login' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('login');
            }}
          >
            Login
          </a>
          <a
            href="#signup"
            className={currentPage === 'signup' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('signup');
            }}
          >
            Sign Up
          </a>
          <a
            href="#about"
            className={currentPage === 'about' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('about');
            }}
          >
            About
          </a>
          <a
            href="#contact"
            className={currentPage === 'contact' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('contact');
            }}
          >
            Contact
          </a>
        </div>
        <div
          id="icons"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          role="button"
          aria-label="Toggle Navigation"
        >
          <i className="fas fa-bars"></i>
        </div>
      </div>
    </div>
  );
}
