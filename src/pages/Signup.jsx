import React, { useState } from 'react';

export default function Signup({ onNavigate }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some((user) => user.username === username)) {
      setErrorMessage('Username already exists!');
      return;
    }

    users.push({ username, email, password });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Signup successful! You can now login.');
    if (onNavigate) {
      onNavigate('login');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <div className="signup-header">
          <h2>Create Your Account</h2>
          <p>Join the Digital Library and start exploring.</p>
        </div>

        {/* Signup Form */}
        <form id="signupForm" onSubmit={handleSubmit}>
          <div className="input-group">
            <i className="fas fa-user"></i>
            <input
              type="text"
              id="signupUsername"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <i className="fas fa-envelope"></i>
            <input
              type="email"
              id="signupEmail"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              id="signupPassword"
              placeholder="Create password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              id="confirmPassword"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-signup">
            Sign Up
          </button>
        </form>

        {errorMessage && <p id="errorMessage" className="error">{errorMessage}</p>}

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <a
              href="#login"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('login');
              }}
            >
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
