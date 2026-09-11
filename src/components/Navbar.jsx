import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <div id="nav" className={pathname !== '/' ? 'fixed-nav' : ''}>
      <div id="nav-part1">
        <Link to="/" onClick={closeMenu} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1 style={{ margin: 0, cursor: 'pointer' }}>Digital Library</h1>
        </Link>
      </div>
      <div id="nav-part2">
        <div id="links" className={mobileMenuOpen ? 'show' : ''}>
          <Link
            to="/"
            className={pathname === '/' ? 'active' : ''}
            onClick={closeMenu}
          >
            Home
          </Link>
          <Link
            to="/login"
            className={pathname === '/login' ? 'active' : ''}
            onClick={closeMenu}
          >
            Login
          </Link>
          <Link
            to="/signup"
            className={pathname === '/signup' ? 'active' : ''}
            onClick={closeMenu}
          >
            Sign Up
          </Link>
          <Link
            to="/about"
            className={pathname === '/about' ? 'active' : ''}
            onClick={closeMenu}
          >
            About
          </Link>
          <Link
            to="/contact"
            className={pathname === '/contact' ? 'active' : ''}
            onClick={closeMenu}
          >
            Contact
          </Link>
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
