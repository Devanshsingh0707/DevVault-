import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Star, Pin } from 'lucide-react';
import API from '../api/client';
import { useToast } from '../context/ToastContext';

const EditCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [language, setLanguage] = useState('');
  const [category, setCategory] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavourite, setIsFavourite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [visibility, setVisibility] = useState('local');
  
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load categories
        const catRes = await API.get('/api/categories');
        setCategories(catRes.data);

        // Load card details
        const cardRes = await API.get(`/api/cards/${id}`);
        const card = cardRes.data;

        setTitle(card.title);
        setDescription(card.description);
        setCodeSnippet(card.codeSnippet || '');
        setLanguage(card.language || '');
        setCategory(card.category);
        setTagsInput(card.tags ? card.tags.join(', ') : '');
        setIsFavourite(card.isFavourite || false);
        setIsPinned(card.isPinned || false);
        setVisibility(card.visibility || 'local');
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to fetch card details', 'error');
        navigate('/');
      } finally {
        setIsFetching(false);
      }
    };
    fetchData();
  }, [id, navigate, showToast]);

  const handleSuggest = async () => {
    if (!title.trim() || !description.trim()) {
      showToast('Please provide both Title and Description before suggesting category', 'warning');
      return;
    }

    setIsSuggesting(true);
    try {
      const response = await API.post('/api/ai/suggest-category', {
        title: title.trim(),
        description: description.trim()
      });

      const { category: suggestedCategory, tags: suggestedTags } = response.data;
      
      if (suggestedCategory) {
        const exists = categories.some(cat => cat.name.toLowerCase() === suggestedCategory.toLowerCase());
        if (!exists) {
          const newCatOption = { _id: 'suggested-' + Date.now(), name: suggestedCategory, userId: 'temp' };
          setCategories(prev => [...prev, newCatOption]);
          
          try {
            await API.post('/api/categories', { name: suggestedCategory });
          } catch (createCatErr) {
            console.warn('Backend custom category registration failed/already exists:', createCatErr);
          }
        }
        setCategory(suggestedCategory);
      }

      if (suggestedTags && suggestedTags.length > 0) {
        setTagsInput(suggestedTags.join(', '));
      }

      showToast('Gemini suggested category and tags!', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'AI Categorization failed', 'error');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !category.trim()) {
      showToast('Title, Description, and Category are required', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');

      await API.put(`/api/cards/${id}`, {
        title: title.trim(),
        description: description.trim(),
        codeSnippet: codeSnippet.trim(),
        language: language.trim(),
        category: category.trim(),
        tags,
        isFavourite,
        isPinned,
        visibility
      });

      showToast('Knowledge note updated successfully!', 'success');
      navigate('/');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update note', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
        <div style={{
          border: '4px solid rgba(0,0,0,0.05)',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          borderLeftColor: 'var(--accent-primary)',
          animation: 'spin 1s linear infinite'
        }}></div>
      </div>
    );
  }

  return (
    <div className="main-content" style={{ maxWidth: '680px', padding: '2rem 1.5rem' }}>
      {/* Back to Dashboard Link */}
      <button 
        onClick={() => navigate('/')} 
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          fontWeight: 500,
          cursor: 'pointer',
          marginBottom: '1.25rem',
          padding: 0
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-color)',
          borderRadius: '18px',
          padding: '2.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.02)'
        }}
      >
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Edit Knowledge Note
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description (Theory / Explanation)</label>
            <textarea
              className="form-control"
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              disabled={isLoading}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* AI Suggest Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="button"
              className="btn btn-ai"
              style={{ fontSize: '0.85rem', padding: '0.45rem 1rem' }}
              onClick={handleSuggest}
              disabled={isSuggesting || isLoading}
            >
              <Sparkles size={14} />
              {isSuggesting ? 'Suggesting...' : 'Suggest Category & Tags'}
            </motion.button>
          </div>

          {/* Category & Tags Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-control"
                value={category}
                onChange={e => setCategory(e.target.value)}
                disabled={isLoading}
                style={{ fontSize: '0.9rem', padding: '0.55rem 0.75rem' }}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                className="form-control"
                value={tagsInput}
                onChange={e => setTagsInput(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Code Snippet & Language Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Code Snippet (optional)</label>
              <textarea
                className="form-control"
                rows={5}
                value={codeSnippet}
                onChange={e => setCodeSnippet(e.target.value)}
                disabled={isLoading}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Programming Language (optional)</label>
              <input
                type="text"
                className="form-control"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Favourite & Pinned Toggles */}
          <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem 0', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', pb: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={isPinned} 
                onChange={e => setIsPinned(e.target.checked)} 
                disabled={isLoading}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              Pin to top
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <input 
                type="checkbox" 
                checked={isFavourite} 
                onChange={e => setIsFavourite(e.target.checked)} 
                disabled={isLoading}
                style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
              />
              Mark as Favourite
            </label>
          </div>

          {/* Visibility Option */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label" style={{ fontWeight: 600 }}>Visibility</label>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <input 
                  type="radio" 
                  name="visibility"
                  value="local"
                  checked={visibility === 'local'} 
                  onChange={e => setVisibility(e.target.value)} 
                  disabled={isLoading}
                  style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                />
                🔒 Local (Private to vault)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <input 
                  type="radio" 
                  name="visibility"
                  value="global"
                  checked={visibility === 'global'} 
                  onChange={e => setVisibility(e.target.value)} 
                  disabled={isLoading}
                  style={{ accentColor: 'var(--accent-primary)', width: '16px', height: '16px' }}
                />
                🌍 Community (Shared with community)
              </label>
            </div>
          </div>

          {/* Submission buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.75rem',
            marginTop: '1.5rem'
          }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={isLoading}
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditCard;
