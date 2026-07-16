import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { Pencil, Trash, Copy, X, Sparkles, MessageSquare, Pin, Star, User } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../api/client';
import { useAuth } from '../context/AuthContext';

const CardDetailModal = ({ isOpen, onClose, card, onExplain, onMentor, onEdit, onDelete, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

  if (!isOpen || !card) return null;

  const isOwner = user && (card.userId === user._id || (typeof card.userId === 'object' && card.userId?._id === user._id));
  const isFavouritedByMe = user && card.favouritedBy && card.favouritedBy.includes(user._id);
  const activeFavourite = isOwner ? card.isFavourite : isFavouritedByMe;

  const handleTogglePin = async (e) => {
    e.stopPropagation();
    if (!isOwner || isUpdating) return;
    setIsUpdating(true);
    try {
      const response = await API.put(`/api/cards/${card._id}`, { isPinned: !card.isPinned });
      if (onUpdate) onUpdate(response.data);
      showToast(response.data.isPinned ? 'Card pinned' : 'Card unpinned', 'success');
    } catch (err) {
      showToast('Failed to update card pin state', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleFavourite = async (e) => {
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const response = await API.put(`/api/cards/${card._id}`, { isFavourite: !activeFavourite });
      if (onUpdate) onUpdate(response.data);
      showToast(response.data.isFavourite || (response.data.favouritedBy && response.data.favouritedBy.includes(user?._id)) ? 'Added to Favourites' : 'Removed from Favourites', 'success');
    } catch (err) {
      showToast('Failed to update card favourite state', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopyCode = async () => {
    if (!card.codeSnippet) return;
    try {
      await navigator.clipboard.writeText(card.codeSnippet);
      setCopied(true);
      showToast('Code snippet copied to clipboard', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showToast('Failed to copy code', 'error');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15 }}
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '800px', width: '90%' }}
      >
        {/* Header */}
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
            <span className="knowledge-card-category">
              {card.category}
            </span>
            {card.language && (
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)'
              }}>
                {card.language}
              </span>
            )}
            {isOwner && (
              <span style={{
                fontSize: '0.72rem',
                color: 'var(--text-secondary)',
                backgroundColor: 'var(--bg-tertiary)',
                padding: '0.15rem 0.45rem',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem'
              }}>
                {card.visibility === 'global' ? '🌍 Community' : '🔒 Local'}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isOwner && (
              <button 
                onClick={handleTogglePin}
                disabled={isUpdating}
                style={{
                  background: 'none',
                  border: 'none',
                  color: card.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  transition: 'background-color 0.15s'
                }}
                onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
                title={card.isPinned ? 'Unpin Note' : 'Pin Note'}
              >
                <Pin size={18} style={{ fill: card.isPinned ? 'var(--accent-primary)' : 'none' }} />
              </button>
            )}

            <button 
              onClick={handleToggleFavourite}
              disabled={isUpdating}
              style={{
                background: 'none',
                border: 'none',
                color: activeFavourite ? '#eab308' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '4px',
                transition: 'background-color 0.15s'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title={activeFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
            >
              <Star size={18} style={{ fill: activeFavourite ? '#eab308' : 'none' }} />
            </button>

            <button 
              className="modal-close" 
              onClick={onClose}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '4px', transition: 'background-color 0.15s', border: 'none', background: 'none', color: 'var(--text-secondary)' }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
              {card.title}
            </h2>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <User size={13} style={{ color: 'var(--text-muted)' }} />
              <span>creator: {card.createdBy || (card.userId && typeof card.userId === 'object' ? card.userId.name : '') || 'Anonymous'}</span>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Description
            </h4>
            <p style={{ 
              fontSize: '0.95rem', 
              color: 'var(--text-secondary)', 
              lineHeight: '1.6', 
              whiteSpace: 'pre-wrap',
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1rem'
            }}>
              {card.description}
            </p>
          </div>

          {card.codeSnippet && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', margin: 0 }}>
                  Code Snippet
                </h4>
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-secondary" 
                  onClick={handleCopyCode}
                  style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem', height: '28px', gap: '0.25rem' }}
                >
                  <Copy size={13} />
                  {copied ? 'Copied' : 'Copy Code'}
                </motion.button>
              </div>
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                overflowX: 'auto',
                color: 'var(--text-primary)',
                maxHeight: '400px',
                whiteSpace: 'pre'
              }}>
                <code>{card.codeSnippet}</code>
              </pre>
            </div>
          )}

          {card.tags && card.tags.length > 0 && (
            <div style={{ marginBottom: '0.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                Tags
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {card.tags.map((tag, idx) => (
                  <span key={idx} className="tag-badge" style={{ fontSize: '0.8rem', padding: '0.2rem 0.5rem' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps in last */}
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.15rem', borderTop: '1px dashed var(--border-color)', paddingTop: '0.75rem' }}>
            <div>created: {formatDate(card.createdAt)}</div>
            {card.updatedAt !== card.createdAt && <div>updated: {formatDate(card.updatedAt)}</div>}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}
              onClick={() => {
                onExplain(card);
                onClose();
              }}
            >
              <Sparkles size={14} />
              Explain
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              className="btn btn-primary"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}
              onClick={() => {
                onMentor(card);
                onClose();
              }}
            >
              <MessageSquare size={14} />
              Ask AI
            </motion.button>
          </div>

          {isOwner && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}
                onClick={() => {
                  onEdit(card._id);
                  onClose();
                }}
              >
                <Pencil size={14} />
                Edit
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                className="btn btn-danger"
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '0.35rem' }}
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this card?')) {
                    onDelete(card._id);
                    onClose();
                  }
                }}
              >
                <Trash size={14} />
                Delete
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CardDetailModal;
