import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="d-flex justify-content-center align-items-center py-3">
      <div
        className="spinner-border text-light"
        role="status"
        style={{ width: '1.5rem', height: '1.5rem' }}
      >
        <span className="sr-only">Loading...</span>
      </div>
      {message && <span className="ml-2 text-light">{message}</span>}
    </div>
  );
}
