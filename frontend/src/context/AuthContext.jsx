import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/client';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = localStorage.getItem('devvault_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token against backend
          const response = await API.get('/api/auth/me', {
            headers: {
              Authorization: `Bearer ${parsedUser.token}`
            }
          });
          
          // Keep token from localStorage but update profile info
          setUser({ ...response.data, token: parsedUser.token });
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          localStorage.removeItem('devvault_user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await API.post('/api/auth/login', { email, password });
      setUser(response.data);
      localStorage.setItem('devvault_user', JSON.stringify(response.data));
      showToast(`Welcome back, ${response.data.name}!`, 'success');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Login failed';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await API.post('/api/auth/register', { name, email, password });
      setUser(response.data);
      localStorage.setItem('devvault_user', JSON.stringify(response.data));
      showToast(`Account created! Welcome, ${response.data.name}!`, 'success');
      return response.data;
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Registration failed';
      showToast(errMsg, 'error');
      throw new Error(errMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('devvault_user');
    setUser(null);
    showToast('Logged out successfully', 'info');
  };

  const updateUserContext = (newData) => {
    setUser(prev => {
      const updated = { ...prev, ...newData };
      localStorage.setItem('devvault_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUserContext,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
