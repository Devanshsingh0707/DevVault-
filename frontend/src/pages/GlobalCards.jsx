import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/client';
import CardItem from '../components/CardItem';
import ExplanationModal from '../components/ExplanationModal';
import MentorPanel from '../components/MentorPanel';
import CardDetailModal from '../components/CardDetailModal';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Folder, LayoutGrid, Server, Leaf, Database, Binary, Bug, Cpu, Atom, GitFork, Terminal, MessageSquare, Network } from 'lucide-react';

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

const EmptyState = () => (
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
      No shared community knowledge
    </h3>
    <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: 0 }}>
      No global cards match your active query. Check back later or create and share a card to start community knowledge!
    </p>
  </div>
);

const getCategoryIcon = (catName) => {
  const name = catName.toLowerCase().trim();
  if (name === 'backend') return <Server size={16} style={{ color: '#b45309' }} />;
  if (name === 'mongodb') return <Leaf size={16} style={{ color: '#16a34a' }} />;
  if (name.includes('sql') || name.includes('database')) return <Database size={16} style={{ color: '#0284c7' }} />;
  if (name.includes('dsa') || name.includes('algo') || name.includes('datastructure')) return <Binary size={16} style={{ color: '#7c3aed' }} />;
  if (name.includes('debug') || name.includes('bug')) return <Bug size={16} style={{ color: '#dc2626' }} />;
  if (name.includes('express')) return <Cpu size={16} style={{ color: '#4b5563' }} />;
  if (name.includes('react') || name === 'frontend') return <Atom size={16} style={{ color: '#06b6d4' }} />;
  if (name === 'git') return <GitFork size={16} style={{ color: '#ea580c' }} />;
  if (name.includes('javascript') || name.includes('js') || name.includes('typescript') || name.includes('ts')) return <Terminal size={16} style={{ color: '#eab308' }} />;
  if (name.includes('interview')) return <MessageSquare size={16} style={{ color: '#2563eb' }} />;
  if (name.includes('system design') || name.includes('design') || name.includes('devops') || name.includes('network') || name.includes('cloud')) return <Network size={16} style={{ color: '#0d9488' }} />;
  if (name.includes('node')) return <Terminal size={16} style={{ color: '#16a34a' }} />;
  return <Folder size={16} style={{ color: '#71717a' }} />;
};

const GlobalCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languagesInCards, setLanguagesInCards] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Modal/Panel states
  const [explainCard, setExplainCard] = useState(null);
  const [mentorCard, setMentorCard] = useState(null);
  const [selectedViewCard, setSelectedViewCard] = useState(null);

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
      if (sortBy) params.sort = sortBy;

      const response = await API.get('/api/cards/global', { params });
      setCards(response.data);

      // Extract unique languages
      const langs = new Set();
      response.data.forEach(c => {
        if (c.language && c.language.trim()) {
          langs.add(c.language.trim());
        }
      });
      setLanguagesInCards(Array.from(langs));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch global cards', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedCategory, selectedLanguage, sortBy, showToast]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCards();
    }, 250);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchCards]);

  const handleCardDeleted = (id) => {
    setCards(prev => prev.filter(c => c._id !== id));
    if (selectedViewCard && selectedViewCard._id === id) {
      setSelectedViewCard(null);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem', padding: '2rem' }}>
      
      {/* LEFT FILTER SIDEBAR */}
      <aside style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-color)',
        borderRadius: '18px',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        height: 'fit-content',
        position: 'sticky',
        top: '90px'
      }}>
        {/* Categories Header */}
        <div>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Folder size={12} /> Categories
          </h4>

          {/* Categories Button List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <button
              onClick={() => setSelectedCategory('')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: selectedCategory === '' ? 'var(--bg-tertiary)' : 'transparent',
                color: selectedCategory === '' ? 'var(--text-primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: selectedCategory === '' ? 600 : 500,
                fontSize: '0.85rem',
                textAlign: 'left',
                transition: 'all 0.15s ease'
              }}
            >
              <LayoutGrid size={16} style={{ color: 'var(--accent-primary)' }} />
              All Categories
            </button>
            {categories.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.name)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: isSelected ? 'var(--bg-tertiary)' : 'transparent',
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {getCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.5px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Filter size={12} /> Filters
          </h4>

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
      </aside>

      {/* RIGHT MAIN WORKSPACE */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Hero header */}
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.75px', marginBottom: '0.35rem' }}>
            Community Knowledge
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
            Explore developer knowledge shared by the community.
          </p>
        </div>

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
              placeholder="Search community knowledge..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '2.75rem', paddingRight: '1rem', height: '48px', borderRadius: '10px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, whiteSpace: 'nowrap' }}>Sort:</span>
            <select
              className="form-control"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ height: '48px', padding: '0 1rem', borderRadius: '10px', fontSize: '0.9rem', width: '160px', fontWeight: 500 }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="popular">Popular</option>
              <option value="recently_updated">Recently Updated</option>
            </select>
          </div>
        </div>

        {/* Cards Grid / Skeletons / Empty State */}
        {isLoading ? (
          <div className="cards-grid">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : cards.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div layout className="cards-grid">
            <AnimatePresence>
              {cards.map(card => (
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

export default GlobalCards;
