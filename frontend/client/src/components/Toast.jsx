import React from 'react';
import { X, CheckCircle, AlertCircle, Info } from './Icons';

export const Toast = ({ message, type = 'info', onClose }) => {
  if (!message) return null;

  const cls = {
    success: 'toast-success',
    error:   'toast-error',
    info:    'toast-info',
  }[type] || 'toast-info';

  const Icon = { success: CheckCircle, error: AlertCircle, info: Info }[type] || Info;

  return (
    <div className={`toast ${cls}`} role="alert" aria-live="polite">
      <Icon size={18} />
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="btn btn-ghost btn-icon"
          style={{ padding: 4, minWidth: 'unset', opacity: 0.6 }}
          aria-label="Dismiss"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
