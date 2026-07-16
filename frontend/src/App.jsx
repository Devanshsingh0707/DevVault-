import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import GlobalCards from './pages/GlobalCards';
import Login from './pages/Login';
import Register from './pages/Register';
import NewCard from './pages/NewCard';
import EditCard from './pages/EditCard';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import './App.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <div className="app-container">
            <Header />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/global"
                element={
                  <ProtectedRoute>
                    <GlobalCards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cards/new"
                element={
                  <ProtectedRoute>
                    <NewCard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/cards/edit/:id"
                element={
                  <ProtectedRoute>
                    <EditCard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
