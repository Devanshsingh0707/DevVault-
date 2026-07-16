import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/client';
import CardItem from '../components/CardItem';
import CategoryManager from '../components/CategoryManager';
import ExplanationModal from '../components/ExplanationModal';
import MentorPanel from '../components/MentorPanel';
import CardDetailModal from '../components/CardDetailModal';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Folder, Info, Command, Settings, LayoutGrid, Database, Server, Leaf, Binary, Bug, Cpu, Atom, GitFork, Terminal, MessageSquare, Network } from 'lucide-react';

const CardSkeleton = () => (
  <div className="knowledge-card" style={{ cursor: 'default', height: '240px', justifyContent: 'space-between', animation: 'pulse 1.5s infinite' }}>
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '80px', height: '18px', backgroundColor: '#e4e4e7', borderRadius: '4px' }}></div>
        <div style={{ width: '40px', height: '18px', backgroundColor: '#e4e4e7', borderRadius: '4px' }}></div>
      </div>
      <div style={{ width: '60%', height: '22px', backgroundColor: '#e4e4e7', borderRadius: '4px', marginTop: '1rem' }}></div>
      <div style={{ width: '90%', height: '14px', backgroundColor: '#f4f4f5', borderRadius: '4px', marginTop: '0.75rem' }}></div>
      <div style={{ width: '75%', height: '14px', backgroundColor: '#f4f4f5', borderRadius: '4px', marginTop: '0.5rem' }}></div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e4e4e7', paddingTop: '1rem' }}>
      <div style={{ width: '80px', height: '28px', backgroundColor: '#f4f4f5', borderRadius: '6px' }}></div>
      <div style={{ width: '80px', height: '28px', backgroundColor: '#f4f4f5', borderRadius: '6px' }}></div>
    </div>
  </div>
);

const EmptyState = ({ onCreateClick }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4.5rem 2rem',
    backgroundColor: '#FFFFFF',
    border: '1px solid var(--border-color)',
    borderRadius: '18px',
    textAlign: 'center',
    maxWidth: '540px',
    margin: '2rem auto'
  }}>
    <div style={{
      width: '64px',
      height: '64px',
      borderRadius: '50%',
      backgroundColor: 'var(--bg-tertiary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '1.25rem',
      color: 'var(--text-muted)'
    }}>
      <Folder size={32} />
    </div>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
      Your knowledge vault is empty
    </h3>
    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
      Create your first knowledge note and start building your personal AI-powered developer knowledge base.
    </p>
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="btn btn-primary"
      onClick={onCreateClick}
      style={{ padding: '0.55rem 1.25rem' }}
    >
      <Plus size={16} />
      Create First Note
    </motion.button>
  </div>
);

const getCategoryIcon = (catName) => {
  const name = catName.toLowerCase().trim();
  
  if (name === 'backend') {
    return <Server size={16} style={{ color: '#b45309' }} />;
  }
  if (name === 'mongodb') {
    return <Leaf size={16} style={{ color: '#16a34a' }} />;
  }
  if (name.includes('sql') || name.includes('database')) {
    return <Database size={16} style={{ color: '#0284c7' }} />;
  }
  if (name.includes('dsa') || name.includes('algo') || name.includes('datastructure')) {
    return <Binary size={16} style={{ color: '#7c3aed' }} />;
  }
  if (name.includes('debug') || name.includes('bug')) {
    return <Bug size={16} style={{ color: '#dc2626' }} />;
  }
  if (name.includes('express')) {
    return <Cpu size={16} style={{ color: '#4b5563' }} />;
  }
  if (name.includes('react') || name === 'frontend') {
    return <Atom size={16} style={{ color: '#06b6d4' }} />;
  }
  if (name === 'git') {
    return <GitFork size={16} style={{ color: '#ea580c' }} />;
  }
  if (name.includes('javascript') || name.includes('js') || name.includes('typescript') || name.includes('ts')) {
    return <Terminal size={16} style={{ color: '#eab308' }} />;
  }
  if (name.includes('interview')) {
    return <MessageSquare size={16} style={{ color: '#2563eb' }} />;
  }
  if (name.includes('system design') || name.includes('design') || name.includes('devops') || name.includes('network') || name.includes('cloud')) {
    return <Network size={16} style={{ color: '#0d9488' }} />;
  }
  if (name.includes('node')) {
    return <Terminal size={16} style={{ color: '#16a34a' }} />;
  }
  
  return <Folder size={16} style={{ color: '#71717a' }} />;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [activeQuickFilter, setActiveQuickFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);

  // Modal/Panel states
  const [explainCard, setExplainCard] = useState(null);
  const [mentorCard, setMentorCard] = useState(null);
  const [selectedViewCard, setSelectedViewCard] = useState(null);
  const [showCatManager, setShowCatManager] = useState(false);

  const { showToast } = useToast();

  const fetchCategories = useCallback(async () => {
    try {
      const response = await API.get('/api/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLanguage) params.language = selectedLanguage;

      const response = await API.get('/api/cards', { params });
      setCards(response.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch cards', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedLanguage, showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCards();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCards]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      const isInput = activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT' || activeEl.isContentEditable;

      if (e.key === '/' && !isInput) {
        e.preventDefault();
        const searchInput = document.getElementById('search-notes-input');
        if (searchInput) searchInput.focus();
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-notes-input');
        if (searchInput) searchInput.focus();
      }

      if (e.key.toLowerCase() === 'n' && !isInput) {
        e.preventDefault();
        navigate('/cards/new');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleCardDeleted = async (cardId) => {
    try {
      await API.delete(`/api/cards/${cardId}`);
      showToast('Knowledge note deleted', 'success');
      setCards(prev => prev.filter(c => c._id !== cardId));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete note', 'error');
    }
  };

  const handleCategoryCreated = (newCat) => {
    setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const handleCategoryDeleted = (catId) => {
    const deletedCat = categories.find(c => c._id === catId);
    if (deletedCat && selectedCategory === deletedCat.name) {
      setSelectedCategory('');
    }
    setCategories(prev => prev.filter(c => c._id !== catId));
  };

  const getCategoryCount = (catName) => {
    return cards.filter(c => c.category === catName).length;
  };

  // Compile list of languages present in cards dynamically
  const languagesInCards = Array.from(
    new Set([
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'HTML', 'CSS', 'SQL',
      ...cards.map(c => c.language).filter(l => l && l.trim() !== '')
    ])
  ).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

  // Local client filters engine (Quick Filters)
  const getFilteredCards = () => {
    let filtered = [...cards];

    // Quick filters
    if (activeQuickFilter === 'Recent') {
      filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      filtered = filtered.slice(0, 2); // only show the 2 most recent cards!
    } else if (activeQuickFilter === 'Favourite') {
      filtered = filtered.filter(c => {
        const isOwner = user && (c.userId === user._id || (typeof c.userId === 'object' && c.userId?._id === user._id));
        return isOwner ? c.isFavourite : (user && c.favouritedBy && c.favouritedBy.includes(user._id));
      });
    } else if (activeQuickFilter === 'Pinned') {
      filtered = filtered.filter(c => c.isPinned);
    }

    // Sort pinned cards to the top by default (except when specifically viewing Pinned or Recent tabs)
    if (activeQuickFilter !== 'Pinned' && activeQuickFilter !== 'Recent') {
      filtered.sort((a, b) => {
        const aPinned = a.isPinned ? 1 : 0;
        const bPinned = b.isPinned ? 1 : 0;
        return bPinned - aPinned;
      });
    }

    return filtered;
  };

  const filteredCards = getFilteredCards();

  const handleCategoryClick = (catName) => {
    setSelectedCategory(prev => prev === catName ? '' : catName);
  };

  return (
    <div className="main-content" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2.5rem', alignItems: 'start' }}>
      
      {/* LEFT SIDEBAR - SINGLE CLEAN SaaS SIDEBAR PANEL */}
      <aside style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        minHeight: 'calc(100vh - 120px)',
        position: 'sticky',
        top: '90px'
      }}>
        {/* Categories Section */}
        <div>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem' }}>
            Categories
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {/* All Categories Item */}
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.45rem 0.6rem',
                border: 'none',
                borderRadius: '6px',
                backgroundColor: !selectedCategory ? 'var(--bg-tertiary)' : 'transparent',
                color: !selectedCategory ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: !selectedCategory ? 600 : 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                if (selectedCategory) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
              }}
              onMouseOut={(e) => {
                if (selectedCategory) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LayoutGrid size={16} style={{ color: '#2563eb' }} />
              <span>All Categories</span>
            </button>

            {categories.map((cat) => {
              const count = getCategoryCount(cat.name);
              const isActive = selectedCategory === cat.name;
              return (
                <button
                  key={cat._id}
                  onClick={() => handleCategoryClick(cat.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.6rem',
                    border: 'none',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    {getCategoryIcon(cat.name)}
                    <span>{cat.name}</span>
                  </div>
                  {count > 0 && (
                    <span style={{
                      fontSize: '0.75rem',
                      backgroundColor: isActive ? '#FFFFFF' : 'var(--bg-tertiary)',
                      color: 'var(--text-secondary)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '10px',
                      border: '1px solid var(--border-color)'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setShowCatManager(prev => !prev)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '0.75rem',
              padding: '0 0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            {showCatManager ? 'Close Customizer' : 'Manage Categories →'}
          </button>
        </div>

        {/* Dynamic Category Manager toggle block */}
        {showCatManager && (
          <CategoryManager
            categories={categories}
            onCategoryAdded={handleCategoryCreated}
            onCategoryDeleted={handleCategoryDeleted}
          />
        )}

        {/* Filters Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={12} /> Filters
          </h4>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              className="form-control"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Language</label>
            <select
              className="form-control"
              value={selectedLanguage}
              onChange={e => setSelectedLanguage(e.target.value)}
              style={{ fontSize: '0.85rem', padding: '0.45rem 0.6rem' }}
            >
              <option value="">All Languages</option>
              {languagesInCards.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Compact statistics chips */}
        <div style={{
          marginTop: 'auto',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            padding: '0.25rem 0.5rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            <span>Total Notes:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{cards.length}</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            padding: '0.25rem 0.5rem',
            borderRadius: '20px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}>
            <span>Active Categories:</span>
            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
              {new Set(cards.map(c => c.category)).size}
            </span>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Top search & Button row */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
              <Search size={18} />
            </span>
            <input
              id="search-notes-input"
              type="text"
              className="form-control"
              placeholder="Search by title, category, tag or language..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem', paddingRight: '1rem', height: '48px', borderRadius: '10px' }}
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            onClick={() => navigate('/cards/new')}
            style={{ height: '48px', padding: '0 1.25rem', borderRadius: '10px', fontWeight: 600 }}
          >
            <Plus size={16} />
            New Note
          </motion.button>
        </div>

        {/* Quick Filters row */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {['All', 'Recent', 'Favourite', 'Pinned'].map((f) => {
            const isActive = activeQuickFilter === f;
            return (
              <button
                key={f}
                onClick={() => setActiveQuickFilter(f)}
                style={{
                  padding: '0.4rem 0.85rem',
                  fontSize: '0.85rem',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--accent-primary)' : 'var(--border-color)',
                  backgroundColor: isActive ? 'var(--accent-primary)' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all 0.15s ease'
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Cards Grid / Skeletons / Empty State */}
        {isLoading ? (
          <div className="cards-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : filteredCards.length === 0 ? (
          <EmptyState onCreateClick={() => navigate('/cards/new')} />
        ) : (
          <motion.div layout className="cards-grid">
            <AnimatePresence>
              {filteredCards.map(card => (
                <CardItem
                  key={card._id}
                  card={card}
                  onView={setSelectedViewCard}
                  onExplain={setExplainCard}
                  onMentor={setMentorCard}
                  onDelete={handleCardDeleted}
                  onUpdate={(updatedCard) => {
                    setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
                  }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      {/* AI Explanation Modal */}
      <ExplanationModal
        isOpen={!!explainCard}
        onClose={() => setExplainCard(null)}
        card={explainCard}
      />

      {/* AI Mentor Drawer Panel */}
      <MentorPanel
        isOpen={!!mentorCard}
        onClose={() => setMentorCard(null)}
        card={mentorCard}
      />

      {/* Card viewing Detail Modal */}
      <CardDetailModal
        isOpen={!!selectedViewCard}
        onClose={() => setSelectedViewCard(null)}
        card={selectedViewCard}
        onExplain={setExplainCard}
        onMentor={setMentorCard}
        onEdit={(id) => navigate(`/cards/edit/${id}`)}
        onDelete={handleCardDeleted}
        onUpdate={(updatedCard) => {
          setCards(prev => prev.map(c => c._id === updatedCard._id ? updatedCard : c));
          setSelectedViewCard(updatedCard);
        }}
      />
    </div>
  );
};

export default Dashboard;
