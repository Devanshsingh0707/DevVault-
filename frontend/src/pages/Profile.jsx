import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Pencil, Calendar, Clock, Camera, X } from 'lucide-react';
import API from '../api/client';
import { useToast } from '../context/ToastContext';

const Profile = () => {
  const { user, updateUserContext } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editTitle, setEditTitle] = useState(user?.title || '');
  const [editDescription, setEditDescription] = useState(user?.description || '');
  const [isSaving, setIsSaving] = useState(false);

  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const photoMenuRef = useRef(null);

  useEffect(() => {
    const handlePhotoOutsideClick = (e) => {
      if (photoMenuRef.current && !photoMenuRef.current.contains(e.target)) {
        setIsPhotoMenuOpen(false);
      }
    };
    if (isPhotoMenuOpen) {
      document.addEventListener('mousedown', handlePhotoOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handlePhotoOutsideClick);
    };
  }, [isPhotoMenuOpen]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const response = await API.post('/api/auth/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updateUserContext(response.data);
      showToast('Profile photo updated successfully', 'success');
      setIsPhotoMenuOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile photo', 'error');
    }
  };

  const handleRemovePhoto = async () => {
    try {
      const response = await API.put('/api/auth/profile', {
        profilePhoto: ''
      });
      updateUserContext(response.data);
      showToast('Profile photo removed successfully', 'success');
      setIsPhotoMenuOpen(false);
    } catch (err) {
      showToast('Failed to remove profile photo', 'error');
    }
  };

  const getWordCount = (text) => {
    if (!text || text.trim() === '') return 0;
    return text.trim().split(/\s+/).filter(w => w !== '').length;
  };

  const getMemberSince = () => {
    if (!user?.createdAt) return 'Jul 2026';
    return new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const handleOpenEdit = () => {
    setEditName(user?.name || '');
    setEditTitle(user?.title || '');
    setEditDescription(user?.description || '');
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!editName.trim()) {
      showToast('Name is required', 'warning');
      return;
    }

    const titleWords = getWordCount(editTitle);
    if (titleWords > 50) {
      showToast(`Title exceeds 50 words limit (${titleWords} words)`, 'warning');
      return;
    }

    const descWords = getWordCount(editDescription);
    if (descWords > 150) {
      showToast(`Description exceeds 150 words limit (${descWords} words)`, 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const response = await API.put('/api/auth/profile', {
        name: editName.trim(),
        title: editTitle.trim(),
        description: editDescription.trim()
      });

      updateUserContext(response.data);
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '3rem auto', padding: '0 2rem' }}>
      
      {/* Title Header with Edit Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            User Profile
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
            Manage your account information and preferences
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenEdit}
          style={{
            border: '1px solid var(--accent-primary)',
            color: 'var(--accent-primary)',
            backgroundColor: 'transparent',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            transition: 'all 0.15s ease'
          }}
          onMouseOver={e => {
            e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.04)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Pencil size={15} />
          Edit Profile
        </motion.button>
      </div>

      {/* Profile Overview Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 240px',
        gap: '2rem',
        marginBottom: '2rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left Side: Avatar and bio */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
          {/* Avatar frame */}
          <div ref={photoMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent-primary)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2.25rem',
              fontWeight: 600,
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)',
              overflow: 'hidden'
            }}>
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
              ) : (
                user?.name ? user.name[0].toUpperCase() : 'U'
              )}
            </div>
            
            <button 
              onClick={() => setIsPhotoMenuOpen(prev => !prev)}
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                boxShadow: '0 2px 5px rgba(0,0,0,0.08)'
              }} 
              title="Change profile photo"
            >
              <Camera size={13} />
            </button>

            {/* Hidden File Picker Input */}
            <input 
              type="file" 
              id="profile-photo-picker"
              accept="image/png, image/jpeg, image/jpg, image/gif, image/webp, image/svg+xml, image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoChange}
            />

            {/* Photo Menu Popover */}
            {isPhotoMenuOpen && (
              <div style={{
                position: 'absolute',
                left: '100px',
                top: '20px',
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                padding: '0.4rem',
                minWidth: '140px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                zIndex: 50
              }}>
                <button
                  onClick={() => document.getElementById('profile-photo-picker').click()}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.4rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.82rem',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                  onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                    {user?.profilePhoto ? 'Update Photo' : 'Upload Photo'}
                  </span>
                </button>
                {user?.profilePhoto && (
                  <button
                    onClick={handleRemovePhoto}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '4px',
                      fontSize: '0.82rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#fef2f2'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <span style={{ color: '#EF4444', fontWeight: 500 }}>Remove Photo</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Details */}
          <div>
            <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {user?.name || 'Developer'}
            </h3>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
              {user?.title || 'No title set'}
            </p>
            <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {user?.description || 'No bio added yet. Click Edit Profile to write one.'}
            </p>
          </div>
        </div>

        {/* Right Side: Account metadata chips */}
        <div style={{
          borderLeft: '1px solid var(--border-color)',
          paddingLeft: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Calendar size={15} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1px' }}>Member since</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{getMemberSince()}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)'
            }}>
              <Clock size={15} />
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1px' }}>Last active</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                Today <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block' }}></span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information Section */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Account Information
        </h3>
        
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
        }}>
          {/* Name Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <User size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Name</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your full name</p>
              </div>
            </div>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {user?.name || 'Developer'}
            </span>
          </div>

          {/* Email Row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1.25rem 1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}>
                <Mail size={18} />
              </div>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>Email</p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Your email address</p>
              </div>
            </div>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>
              {user?.email || 'developer@devvault.com'}
            </span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal Dialog */}
      <AnimatePresence>
        {isEditing && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(9, 9, 11, 0.40)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              backdropFilter: 'blur(4px)'
            }} 
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={e => e.stopPropagation()}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                width: '90%',
                maxWidth: '500px',
                padding: '2rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSave}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="form-label">Professional Title</label>
                    <span style={{ fontSize: '0.72rem', color: getWordCount(editTitle) > 50 ? 'var(--danger-color)' : 'var(--text-muted)' }}>
                      {getWordCount(editTitle)} / 50 words
                    </span>
                  </div>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Full Stack Developer"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    disabled={isSaving}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <label className="form-label">Description / Bio</label>
                    <span style={{ fontSize: '0.72rem', color: getWordCount(editDescription) > 150 ? 'var(--danger-color)' : 'var(--text-muted)' }}>
                      {getWordCount(editDescription)} / 150 words
                    </span>
                  </div>
                  <textarea
                    className="form-control"
                    placeholder="Describe your developer journey..."
                    rows={4}
                    value={editDescription}
                    onChange={e => setEditDescription(e.target.value)}
                    disabled={isSaving}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSaving}
                    style={{ padding: '0.5rem 1rem' }}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;
