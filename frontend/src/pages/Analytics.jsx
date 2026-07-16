import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/client';
import { useToast } from '../context/ToastContext';
import { 
  BarChart3, 
  Calendar, 
  Code2, 
  Star, 
  Pin, 
  Folder, 
  ArrowLeft, 
  Clock, 
  Activity, 
  Cpu, 
  CheckCircle,
  Database
} from 'lucide-react';

const Analytics = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [cards, setCards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cardsRes, catsRes] = await Promise.all([
          API.get('/api/cards'),
          API.get('/api/categories')
        ]);
        setCards(cardsRes.data || []);
        setCategories(catsRes.data || []);
      } catch (err) {
        showToast('Failed to fetch analytics datasets', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Time helper
  const formatTimeAgo = (dateStr) => {
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Computations
  const totalSnippets = cards.length;
  const totalCategories = categories.length;

  // Created this week
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const createdThisWeek = cards.filter(c => new Date(c.createdAt) >= sevenDaysAgo).length;

  // Get days of the current week (Monday to Sunday)
  const getDaysOfCurrentWeek = () => {
    const current = new Date();
    const distance = current.getDay() - 1; // distance to Monday
    const monday = new Date(current);
    monday.setDate(current.getDate() - (distance < 0 ? 6 : distance));
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      week.push(nextDay);
    }
    return week;
  };

  const currentWeekDays = getDaysOfCurrentWeek();
  const weekDaysLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const weekDaysData = currentWeekDays.map((date, idx) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    const count = cards.filter(c => {
      const d = new Date(c.createdAt);
      return d >= dayStart && d <= dayEnd;
    }).length;
    
    return {
      label: weekDaysLabels[idx],
      date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count
    };
  });

  // Most used language
  const languageCounts = {};
  cards.forEach(c => {
    const lang = c.language || 'Unknown';
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  });
  let mostUsedLanguage = 'N/A';
  let maxLangCount = 0;
  Object.entries(languageCounts).forEach(([lang, count]) => {
    if (count > maxLangCount) {
      maxLangCount = count;
      mostUsedLanguage = lang;
    }
  });

  // Favourite technology (Category with most starred/favourite cards, fallback to category with most cards)
  const categoryFavCounts = {};
  const categoryTotalCounts = {};
  cards.forEach(c => {
    const cat = c.category || 'Uncategorized';
    categoryTotalCounts[cat] = (categoryTotalCounts[cat] || 0) + 1;
    if (c.isFavourite) {
      categoryFavCounts[cat] = (categoryFavCounts[cat] || 0) + 1;
    }
  });

  let favouriteTech = 'N/A';
  let maxFavCount = 0;
  Object.entries(categoryFavCounts).forEach(([cat, count]) => {
    if (count > maxFavCount) {
      maxFavCount = count;
      favouriteTech = cat;
    }
  });

  if (favouriteTech === 'N/A') {
    let maxTotalCount = 0;
    Object.entries(categoryTotalCounts).forEach(([cat, count]) => {
      if (count > maxTotalCount) {
        maxTotalCount = count;
        favouriteTech = cat;
      }
    });
  }

  // Pinned & Starred
  const totalPinned = cards.filter(c => c.isPinned).length;
  const totalStarred = cards.filter(c => c.isFavourite).length;

  // Recent activity
  const recentActivities = [...cards]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5)
    .map(c => {
      const isNew = new Date(c.createdAt).getTime() === new Date(c.updatedAt).getTime();
      return {
        id: c._id,
        type: isNew ? 'created' : 'updated',
        title: c.title,
        time: c.updatedAt,
        category: c.category,
        language: c.language
      };
    });

  // Language Breakdown percentages
  const languageBreakdown = Object.entries(languageCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalSnippets > 0 ? Math.round((count / totalSnippets) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  // Category Distribution
  const categoryBreakdown = Object.entries(categoryTotalCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalSnippets > 0 ? Math.round((count / totalSnippets) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--text-muted)' }}>Calculating analytics metrics...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '2.5rem 2rem', width: '100%' }}>
      
      {/* Hero Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
        <div>
          <button 
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 600,
              padding: 0,
              transition: 'color 0.2s ease'
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.025em', margin: 0 }}>
              Workspace Analytics
            </h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
              Insights, language distributions, and activity statistics
            </p>
          </div>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#EEF2F6',
            border: '1px solid #E2E8F0',
            color: 'var(--accent-primary)',
            padding: '0.5rem 1rem',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: 600,
            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }}></span>
            Real-Time Stats
          </div>
        </div>
      </div>

      {/* Row 1: Weekly Activity (Large focus chart) */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} style={{ color: 'var(--accent-primary)' }} /> Weekly Activity
          </h4>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-primary)', backgroundColor: '#EEF2F6', padding: '0.3rem 0.75rem', borderRadius: '12px' }}>
            {createdThisWeek} snippet{createdThisWeek !== 1 ? 's' : ''} created this week
          </span>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end', 
          height: '320px', 
          padding: '0 2rem', 
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '1rem',
          marginBottom: '1rem'
        }}>
          {weekDaysData.map((day, idx) => {
            const maxCount = Math.max(...weekDaysData.map(d => d.count), 1);
            const barHeight = day.count > 0 ? `${(day.count / maxCount) * 260}px` : '8px';
            
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '0.75rem' }}>
                {day.count > 0 && (
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                    {day.count}
                  </span>
                )}
                <div 
                  style={{
                    width: '32px',
                    height: barHeight,
                    borderRadius: '6px',
                    backgroundColor: day.count > 0 ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer'
                  }} 
                  title={`${day.count} snippets created on ${day.date}`}
                  onMouseOver={e => {
                    if (day.count > 0) e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
                  }}
                  onMouseOut={e => {
                    if (day.count > 0) e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                  }}
                />
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          <span>Daily snippet creations for the current week (Monday to Sunday)</span>
        </div>
      </div>

      {/* Row 2: Statistics Row (4 columns) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Snippets */}
        <div 
          style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)';
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Code2 size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Snippets</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{totalSnippets}</h3>
          </div>
        </div>

        {/* Categories */}
        <div 
          style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)';
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Folder size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Categories</p>
            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{totalCategories}</h3>
          </div>
        </div>

        {/* Languages */}
        <div 
          style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)';
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Languages</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }} title={mostUsedLanguage}>
              {mostUsedLanguage}
            </h3>
          </div>
        </div>

        {/* Favourite Technology */}
        <div 
          style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.01)', transition: 'transform 0.2s ease, box-shadow 0.2s ease', cursor: 'default' }}
          onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)';
          }}
          onMouseOut={e => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.01)';
          }}
        >
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Star size={24} />
          </div>
          <div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.025em' }}>Favourite Technology</p>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px' }} title={favouriteTech}>
              {favouriteTech}
            </h3>
          </div>
        </div>
      </div>

      {/* Row 3: Breakdowns Grid (3 columns of equal height) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem'
      }}>
        {/* Language Breakdown */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={18} style={{ color: 'var(--accent-primary)' }} /> Language Breakdown
          </h4>

          {languageBreakdown.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>No notes created yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1, justifyContent: 'center' }}>
              {languageBreakdown.slice(0, 4).map(lang => (
                <div key={lang.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lang.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{lang.count} ({lang.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${lang.percentage}%`, 
                      height: '100%', 
                      backgroundColor: '#6366F1', 
                      borderRadius: '4px' 
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Category Distribution */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={18} style={{ color: '#059669' }} /> Category Distribution
          </h4>

          {categoryBreakdown.length === 0 ? (
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>No categorised notes yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', flex: 1, justifyContent: 'center' }}>
              {categoryBreakdown.slice(0, 4).map(cat => (
                <div key={cat.name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{cat.count} ({cat.percentage}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${cat.percentage}%`, 
                      height: '100%', 
                      backgroundColor: '#10B981', 
                      borderRadius: '4px' 
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bookmarks & Pins */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star size={18} style={{ color: '#d97706' }} /> Bookmarks & Pins
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Star size={14} fill="#eab308" color="#eab308" /> Favourites
                </span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{totalStarred} note{totalStarred !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${totalSnippets > 0 ? (totalStarred / totalSnippets) * 100 : 0}%`, 
                  height: '100%', 
                  backgroundColor: '#eab308', 
                  borderRadius: '4px' 
                }} />
              </div>
            </div>
            
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Pin size={14} fill="var(--accent-primary)" color="var(--accent-primary)" /> Pinned Notes
                </span>
                <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{totalPinned} note{totalPinned !== 1 ? 's' : ''}</span>
              </div>
              <div style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)', overflow: 'hidden' }}>
                <div style={{ 
                  width: `${totalSnippets > 0 ? (totalPinned / totalSnippets) * 100 : 0}%`, 
                  height: '100%', 
                  backgroundColor: 'var(--accent-primary)', 
                  borderRadius: '4px' 
                }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem', fontWeight: 500 }}>
            Bookmarked items in your workspace
          </div>
        </div>
      </div>

      {/* Row 4: Recent Activity Timeline (spanning 100% width) */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity size={18} style={{ color: '#ef4444' }} /> Recent Activity Timeline
        </h4>

        {recentActivities.length === 0 ? (
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: 0 }}>No recent activity to log.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', position: 'relative' }}>
            {recentActivities.map((act) => (
              <div 
                key={act.id} 
                style={{ 
                  backgroundColor: 'var(--bg-tertiary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  cursor: 'default'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    width: '8px', 
                    height: '8px', 
                    borderRadius: '50%', 
                    backgroundColor: act.type === 'created' ? '#10B981' : 'var(--accent-primary)'
                  }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: act.type === 'created' ? '#10B981' : 'var(--accent-primary)' }}>
                    {act.type === 'created' ? 'Created' : 'Updated'}
                  </span>
                </div>
                
                <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={act.title}>
                  {act.title}
                </h5>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.3rem' }}>
                    {act.category && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#FFFFFF', color: 'var(--text-secondary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                        {act.category}
                      </span>
                    )}
                    {act.language && (
                      <span style={{ fontSize: '0.65rem', backgroundColor: '#e0e7ff', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px' }}>
                        {act.language}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <Clock size={12} /> {formatTimeAgo(act.time)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;
