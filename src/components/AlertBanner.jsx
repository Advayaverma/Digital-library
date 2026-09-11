import React from 'react';

export default function AlertBanner({ type = 'info', message, onClose }) {
  if (!message) return null;

  const iconMap = {
    success: 'fas fa-check-circle',
    danger: 'fas fa-exclamation-triangle',
    warning: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
  };

  const iconClass = iconMap[type] || iconMap.info;

  return (
    <div
      className={`alert alert-${type} d-flex justify-content-between align-items-center mb-3`}
      role="alert"
      style={{ borderRadius: '8px', animation: 'fadeIn 0.3s ease-in-out' }}
    >
      <div>
        <i className={`${iconClass} mr-2`}></i>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          className="close"
          aria-label="Close"
          onClick={onClose}
          style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
      )}
    </div>
  );
}
