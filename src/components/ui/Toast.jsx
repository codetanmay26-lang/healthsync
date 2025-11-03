import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

let toastId = 0;
const toasts = [];
const listeners = [];

// Simple toast manager
export const showToast = (message, type = 'success') => {
  const id = ++toastId;
  const toast = {
    id,
    message,
    type,
    timestamp: Date.now()
  };
  
  toasts.push(toast);
  listeners.forEach(listener => listener([...toasts]));
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  }, 3000);
};

const Toast = () => {
  const [currentToasts, setCurrentToasts] = useState([]);

  useEffect(() => {
    listeners.push(setCurrentToasts);
    return () => {
      const index = listeners.indexOf(setCurrentToasts);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  const getToastIcon = (type) => {
    switch (type) {
      case 'success': return 'CheckCircle';
      case 'error': return 'XCircle';
      case 'warning': return 'AlertTriangle';
      default: return 'Info';
    }
  };

  const getToastColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-500 text-white';
      case 'error': return 'bg-red-500 text-white';
      case 'warning': return 'bg-yellow-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const removeToast = (id) => {
    const index = toasts.findIndex(t => t.id === id);
    if (index > -1) {
      toasts.splice(index, 1);
      listeners.forEach(listener => listener([...toasts]));
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {currentToasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg shadow-lg min-w-80 animate-in slide-in-from-right ${getToastColor(toast.type)}`}
        >
          <Icon name={getToastIcon(toast.type)} size={20} />
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="hover:opacity-70 transition-opacity"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Toast;
