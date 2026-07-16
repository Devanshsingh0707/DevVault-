import React, { useState, useEffect, useRef } from 'react';
import API from '../api/client';
import { parseMarkdown } from '../utils/markdown';
import { useToast } from '../context/ToastContext';

const MentorPanel = ({ isOpen, onClose, card }) => {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isOpen || !card) return;

    // Reset messages and load welcome note
    setMessages([
      {
        sender: 'ai',
        text: `🧠 **AI Mentor Activated**\n\nI can help you understand this note: **${card.title}**.\nAsk me questions like:\n- *How can this code be optimized?*\n- *Explain this algorithm in simple terms.*\n- *Give me a real-world project example using this concept.*`
      }
    ]);
  }, [isOpen, card]);

  // Scroll to bottom whenever messages list change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !card) return null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userMsg = question.trim();
    setQuestion('');
    
    // Add user message to state
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await API.post('/api/ai/mentor', {
        cardId: card._id,
        question: userMsg
      });

      setMessages(prev => [...prev, { sender: 'ai', text: response.data.answer }]);
    } catch (error) {
      const errMsg = error.response?.data?.message || 'AI Mentor failed to answer';
      showToast(errMsg, 'error');
      setMessages(prev => [
        ...prev,
        { sender: 'ai', text: `❌ **Error:** ${errMsg}. Please try again.` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header" style={{ borderBottom: '1px solid #233358' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>AI Mentor</h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Context: {card.title.length > 30 ? card.title.substring(0, 30) + '...' : card.title}
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <div className="chat-history">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-bubble ${msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
            >
              {msg.sender === 'ai' ? (
                <div dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }} />
              ) : (
                <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{msg.text}</p>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="spinner" style={{
                border: '2px solid rgba(255,255,255,0.1)',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                borderLeftColor: '#0ea5e9',
                animation: 'spin 1s linear infinite'
              }}></div>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mentor is thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-form">
          <input
            type="text"
            className="form-control"
            placeholder="Ask anything about this note..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
            style={{ fontSize: '0.875rem', padding: '0.6rem 0.85rem' }}
          />
          <button
            type="submit"
            className="btn btn-ai"
            disabled={isLoading || !question.trim()}
            style={{ padding: '0.6rem 1rem', fontSize: '0.875rem' }}
          >
            Send
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default MentorPanel;
