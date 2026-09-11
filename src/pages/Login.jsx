import React, { useState } from 'react';

export default function Login({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('user'); // 'user' | 'admin'
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleUserLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const users = JSON.parse(localStorage.getItem('users')) || [
      { username: 'user123', password: 'userpass' },
    ];
    const user = users.find(
      (u) => u.username === userUsername && u.password === userPassword
    );

    if (user) {
      localStorage.setItem('role', 'user');
      localStorage.setItem('currentUser', JSON.stringify(user));
      alert('User login successful!');
      if (onNavigate) {
        onNavigate('userDashboard');
      }
    } else {
      setErrorMessage('Invalid User credentials!');
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const admins = JSON.parse(localStorage.getItem('admins')) || [
      { username: 'admin123', password: 'adminpass' },
    ];
    const admin = admins.find(
      (a) => a.username === adminUsername && a.password === adminPassword
    );

    if (admin) {
      localStorage.setItem('role', 'admin');
      localStorage.setItem('currentUser', JSON.stringify(admin));
      alert('Admin login successful!');
      if (onNavigate) {
        onNavigate('adminDashboard');
      }
    } else {
      setErrorMessage('Invalid Admin credentials!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h2>Welcome Back!</h2>
          <p>Select an option to login.</p>
        </div>

        {/* Login Type Selection Tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('user');
              setErrorMessage('');
            }}
          >
            Login as User
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
          >
            Login as Admin
          </button>
        </div>

        {/* User Login Form */}
        {activeTab === 'user' && (
          <form id="userLoginForm" className="login-form" onSubmit={handleUserLogin}>
            <div className="input-group">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="userUsername"
                placeholder="Enter username"
                value={userUsername}
                onChange={(e) => setUserUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="userPassword"
                placeholder="Enter password"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-user">
              Login as User
            </button>
          </form>
        )}

        {/* Admin Login Form */}
        {activeTab === 'admin' && (
          <form id="adminLoginForm" className="login-form" onSubmit={handleAdminLogin}>
            <div className="input-group">
              <i className="fas fa-user-shield"></i>
              <input
                type="text"
                id="adminUsername"
                placeholder="Enter admin username"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="adminPassword"
                placeholder="Enter admin password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn-admin">
              Login as Admin
            </button>
          </form>
        )}

        {errorMessage && <p id="errorMessage" className="error">{errorMessage}</p>}

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <a
              href="#signup"
              id="signupLink"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('signup');
              }}
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
