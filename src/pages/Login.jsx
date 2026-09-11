import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [activeTab, setActiveTab] = useState('user');
  const [userIdentifier, setUserIdentifier] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [adminIdentifier, setAdminIdentifier] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolveEmail = (identifier) => {
    if (identifier.includes('@')) return identifier;
    // Check if user previously registered with a matching username in local profiles
    const registered = JSON.parse(localStorage.getItem('users')) || [];
    const match = registered.find((u) => u.username?.toLowerCase() === identifier.toLowerCase());
    return match?.email || `${identifier}@digitallibrary.local`;
  };

  const handleUserLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const email = resolveEmail(userIdentifier);
    const { data, error } = await signIn(email, userPassword);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid User credentials!');
    } else {
      const currentRole = data?.user?.user_metadata?.role || 'user';
      localStorage.setItem('role', currentRole);
      navigate('/dashboard');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const email = resolveEmail(adminIdentifier);
    const { data, error } = await signIn(email, adminPassword);

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message || 'Invalid Admin credentials!');
    } else {
      // Check if user is an administrator
      const currentRole = data?.user?.user_metadata?.role || localStorage.getItem('role') || 'admin';
      localStorage.setItem('role', currentRole);

      if (currentRole === 'admin') {
        navigate('/admin');
      } else {
        alert('Notice: Your account has standard user privileges. Redirecting to User Dashboard.');
        navigate('/dashboard');
      }
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
                placeholder="Enter username or email"
                value={userIdentifier}
                onChange={(e) => setUserIdentifier(e.target.value)}
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="btn-user" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login as User'}
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
                placeholder="Enter admin username or email"
                value={adminIdentifier}
                onChange={(e) => setAdminIdentifier(e.target.value)}
                required
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
            </div>
            <button type="submit" className="btn-admin" disabled={isSubmitting}>
              {isSubmitting ? 'Logging in...' : 'Login as Admin'}
            </button>
          </form>
        )}

        {errorMessage && <p id="errorMessage" className="error">{errorMessage}</p>}

        <div className="login-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/signup" id="signupLink">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
