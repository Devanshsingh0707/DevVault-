import React, { useState, useEffect } from 'react';
import API from '../api/client';
import { parseMarkdown } from '../utils/markdown';
import { useToast } from '../context/ToastContext';

const ExplanationModal = ({ isOpen, onClose, card }) => {
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !card) return;

    const fetchExplanation = async () => {
      setIsLoading(true);
      setExplanation('');
      try {
        const response = await API.post('/api/ai/explain', { cardId: card._id });
        setExplanation(response.data.explanation);
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to fetch AI explanation', 'error');
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    fetchExplanation();
  }, [isOpen, card, onClose, showToast]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '90%' }}>
        <div className="modal-header">
          <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>✨ AI Explanation</span>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 400 }}>
              — {card?.title}
            </span>
          </h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-body" style={{ minHeight: '200px' }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 0',
              gap: '1rem'
            }}>
              <div className="spinner" style={{
                border: '4px solid rgba(255,255,255,0.1)',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                borderLeftColor: '#0ea5e9',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Gemini is analyzing your note...</p>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div 
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(explanation) }} 
            />
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ExplanationModal;
