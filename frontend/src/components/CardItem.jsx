import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, MessageSquare, Pencil, Trash, Calendar, Pin, Star, User } from 'lucide-react';
import API from '../api/client';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const CardItem = ({ card, onView, onExplain, onMentor, onDelete, onUpdate }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { showToast } = useToast();
  const { user } = useAuth();

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return '#22C55E';
      case 'Hard': return '#EF4444';
      default: return '#F59E0B'; // Medium
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="knowledge-card" 
      onClick={() => onView(card)}
      style={{ cursor: 'pointer', height: '330px', padding: '1.25rem 1.25rem 1rem 1.25rem' }}
    >
      {/* Top Header line */}
      <div className="knowledge-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className="knowledge-card-category">{card.category}</span>
          {card.language && (
            <span style={{
              fontSize: '0.72rem',
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

        {/* Pin & Favourite Quick Toggles */}
        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
          {isOwner && (
            <button 
              onClick={handleTogglePin}
              style={{
                background: 'none',
                border: 'none',
                color: card.isPinned ? 'var(--accent-primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                transition: 'color 0.15s ease'
              }}
              title={card.isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              <Pin size={15} style={{ fill: card.isPinned ? 'var(--accent-primary)' : 'none' }} />
            </button>
          )}
          <button 
            onClick={handleToggleFavourite}
            style={{
              background: 'none',
              border: 'none',
              color: activeFavourite ? '#eab308' : 'var(--text-muted)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.15s ease'
            }}
            title={activeFavourite ? 'Remove from Favourites' : 'Add to Favourites'}
          >
            <Star size={15} style={{ fill: activeFavourite ? '#eab308' : 'none' }} />
          </button>
        </div>
      </div>

      {/* Card Title */}
      <h4 
        className="knowledge-card-title" 
        style={{ 
          fontSize: '1.25rem', 
          fontWeight: 600, 
          color: 'var(--text-primary)', 
          marginTop: '0.75rem',
          marginBottom: '0.5rem',
          lineHeight: '1.3',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {card.title}
      </h4>
      
      {/* Description */}
      <p className="knowledge-card-desc" style={{ 
        fontSize: '0.95rem', 
        color: 'var(--text-secondary)', 
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 4,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.4'
      }}>
        {card.description}
      </p>

      {/* Tags */}
      {card.tags && card.tags.length > 0 && (
        <div className="knowledge-card-tags" style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem', height: '1.75rem', overflow: 'hidden' }}>
          {card.tags.map((tag, idx) => (
            <span key={idx} className="tag-badge" style={{ fontSize: '0.75rem', padding: '0.15rem 0.4rem' }}>
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Info Row (Metadata) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        fontSize: '0.8rem',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
        marginTop: 'auto'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Calendar size={13} />
          <span>Updated {formatDate(card.updatedAt)}</span>
        </div>

        {!isOwner && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
            <User size={13} />
            <span style={{ fontWeight: 500 }}>{card.createdBy || (card.userId && typeof card.userId === 'object' ? card.userId.name : '') || 'Anonymous'}</span>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="knowledge-card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="card-actions-left" style={{ display: 'flex', gap: '0.4rem' }}>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', height: '32px' }}
            onClick={(e) => {
              e.stopPropagation();
              onExplain(card);
            }}
          >
            <Sparkles size={13} />
            Explain
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', height: '32px' }}
            onClick={(e) => {
              e.stopPropagation();
              onMentor(card);
            }}
          >
            <MessageSquare size={13} />
            Ask AI
          </motion.button>
        </div>

        {isOwner && (
          <div className="card-actions-right" onClick={(e) => e.stopPropagation()} style={{ display: 'flex', gap: '0.35rem' }}>
            {showConfirmDelete ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--danger)', marginRight: '0.2rem' }}>Sure?</span>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: '26px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(card._id);
                    setShowConfirmDelete(false);
                  }}
                >
                  Yes
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-secondary"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', height: '26px' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(false);
                  }}
                >
                  No
                </motion.button>
              </div>
            ) : (
              <>
                <Link
                  to={`/cards/edit/${card._id}`}
                  className="btn btn-secondary"
                  title="Edit Note"
                  style={{ display: 'inline-flex', padding: '0.35rem', height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--border-color)' }}
                >
                  <Pencil size={14} style={{ color: 'var(--text-secondary)' }} />
                </Link>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-secondary"
                  title="Delete Note"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowConfirmDelete(true);
                  }}
                  style={{ display: 'inline-flex', padding: '0.35rem', height: '32px', width: '32px', alignItems: 'center', justifyContent: 'center', borderColor: 'var(--border-color)' }}
                >
                  <Trash size={14} style={{ color: 'var(--danger)' }} />
                </motion.button>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CardItem;
