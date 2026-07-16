import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)'
      }}>
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          textAlign: 'center',
          color: 'var(--text-primary)'
        }}>Create Account</h2>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-muted)',
          marginBottom: '2rem',
          textAlign: 'center'
        }}>Start organizing your developer knowledge</p>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            fontSize: '0.85rem',
            marginBottom: '1.5rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name" style={{ color: 'var(--text-secondary)' }}>Full Name</label>
            <input
              type="text"
              id="name"
              className="form-control"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
            <input
              type="email"
              id="email"
              className="form-control"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password" style={{ color: 'var(--text-secondary)' }}>Password</label>
            <input
              type="password"
              id="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword" style={{ color: 'var(--text-secondary)' }}>Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-control"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{
          marginTop: '1.5rem',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
