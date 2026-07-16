import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    
    // Clear toast after 3 seconds
    setTimeout(() => {
      setToast(prev => {
        if (prev && prev.message === message) {
          return null;
        }
        return prev;
      });
    }, 3000);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <span>{toast.message}</span>
            <button className="modal-close" style={{ fontSize: '1rem', marginLeft: '0.5rem' }} onClick={closeToast}>
              &times;
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
