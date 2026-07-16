import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Settings, LogOut, Plus, User, LayoutDashboard, BarChart3 } from 'lucide-react';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsSettingsOpen(false);
      }
    };
    if (isSettingsOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isSettingsOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isDashboardActive = location.pathname === '/';
  const isGlobalActive = location.pathname === '/global';
  const isNewCardActive = location.pathname === '/cards/new';

  return (
    <header style={{
      backgroundColor: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      height: '68px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
        <Link to="/" style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent-primary)',
            display: 'inline-block'
          }}></span>
          DevVault
        </Link>
        
        {isAuthenticated && (
          <nav style={{ display: 'flex', gap: '1.5rem', height: '68px', alignItems: 'center' }}>
            <Link to="/" style={{
              fontSize: '0.95rem',
              color: isDashboardActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isDashboardActive ? 600 : 500,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              borderBottom: isDashboardActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              padding: '0 0.25rem',
              transition: 'all 0.15s ease'
            }}>
              Dashboard
            </Link>
            <Link to="/global" style={{
              fontSize: '0.95rem',
              color: isGlobalActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isGlobalActive ? 600 : 500,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              borderBottom: isGlobalActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              padding: '0 0.25rem',
              transition: 'all 0.15s ease'
            }}>
              Explore
            </Link>
            <Link to="/cards/new" style={{
              fontSize: '0.95rem',
              color: isNewCardActive ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: isNewCardActive ? 600 : 500,
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              borderBottom: isNewCardActive ? '2px solid var(--accent-primary)' : '2px solid transparent',
              padding: '0 0.25rem',
              transition: 'all 0.15s ease'
            }}>
              New Note
            </Link>
          </nav>
        )}
      </div>

      <div>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Circular Avatar */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'default',
              overflow: 'hidden'
            }} title={`Logged in as ${user?.name}`}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>

            {/* Settings Dropdown Container */}
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button 
                onClick={() => setIsSettingsOpen(prev => !prev)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: isSettingsOpen ? 'var(--text-primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseOver={e => { if (!isSettingsOpen) e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseOut={e => { if (!isSettingsOpen) e.currentTarget.style.color = 'var(--text-secondary)' }}
                title="Settings"
              >
                <Settings size={18} />
              </button>

              {isSettingsOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  padding: '0.5rem',
                  minWidth: '180px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.2rem',
                  zIndex: 200
                }}>
                  <div style={{
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-color)',
                    marginBottom: '0.35rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {user?.name || 'Developer'}
                  </div>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate('/');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LayoutDashboard size={14} style={{ color: 'var(--text-secondary)' }} />
                    Dashboard
                  </button>
                  
                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate('/profile');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <User size={14} style={{ color: 'var(--text-secondary)' }} />
                    User Profile
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      navigate('/analytics');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <BarChart3 size={14} style={{ color: 'var(--text-secondary)' }} />
                    Analytics
                  </button>

                  <button
                    onClick={() => {
                      setIsSettingsOpen(false);
                      handleLogout();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.45rem 0.6rem',
                      borderRadius: '6px',
                      textAlign: 'left',
                      fontSize: '0.85rem',
                      color: '#EF4444',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.backgroundColor = '#fef2f2';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <LogOut size={14} style={{ color: '#EF4444' }} />
                    <span style={{ color: '#EF4444', fontWeight: 500 }}>Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Login
            </Link>
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}>
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
