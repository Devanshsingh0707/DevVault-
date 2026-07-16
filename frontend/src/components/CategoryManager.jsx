import React, { useState } from 'react';
import API from '../api/client';
import { useToast } from '../context/ToastContext';

const CategoryManager = ({ categories, onCategoryAdded, onCategoryDeleted }) => {
  const [newCategory, setNewCategory] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const { showToast } = useToast();

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setIsAdding(true);
    try {
      const response = await API.post('/api/categories', { name: newCategory.trim() });
      showToast('Category created successfully', 'success');
      setNewCategory('');
      if (onCategoryAdded) {
        onCategoryAdded(response.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create category', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    try {
      await API.delete(`/api/categories/${catId}`);
      showToast('Category deleted successfully', 'success');
      if (onCategoryDeleted) {
        onCategoryDeleted(catId);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete category', 'error');
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem',
      marginBottom: '2rem'
    }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
        Manage Categories
      </h3>
      
      <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          className="form-control"
          placeholder="e.g. Docker, Rust, Swift"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ flex: 1, padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
          disabled={isAdding}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
          disabled={isAdding || !newCategory.trim()}
        >
          {isAdding ? 'Adding...' : 'Add'}
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
        {categories.map((cat) => (
          <span
            key={cat._id}
            style={{
              fontSize: '0.8rem',
              backgroundColor: cat.userId ? 'rgba(9, 105, 218, 0.08)' : 'rgba(99, 102, 241, 0.08)',
              color: cat.userId ? 'var(--accent-primary)' : '#6366f1',
              border: cat.userId ? '1px solid rgba(9, 105, 218, 0.2)' : '1px solid rgba(99, 102, 241, 0.2)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {cat.name}
            {cat.userId && (
              <button
                type="button"
                onClick={() => handleDeleteCategory(cat._id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  marginLeft: '0.35rem',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem',
                  lineHeight: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 2px',
                  transition: 'color 0.2s'
                }}
                onMouseOver={e => e.target.style.color = '#f87171'}
                onMouseOut={e => e.target.style.color = 'var(--danger)'}
                title="Delete custom category"
              >
                &times;
              </button>
            )}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
