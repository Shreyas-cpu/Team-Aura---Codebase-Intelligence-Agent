import React, { useState, useEffect } from 'react'

export default function TopBar({ nodeCount, linkCount, onRefetch, onSearchSelect }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault()
        document.getElementById('search-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header style={{
      height: '52px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '16px',
      flexShrink: 0,
    }}>
      {/* Badge */}
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '.1em',
        color: 'var(--accent)',
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-glow)',
        padding: '3px 10px',
        borderRadius: '4px',
        textTransform: 'uppercase',
      }}>M3</div>

      {/* Title */}
      <span style={{
        fontFamily: 'var(--font-display)',
        fontSize: '15px',
        fontWeight: 600,
        color: 'var(--text-primary)',
        letterSpacing: '-.01em',
      }}>
        Dependency Mapping
      </span>

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

      {/* Search */}
      <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
        <input
          id="search-input"
          type="text"
          placeholder="Search files... (Ctrl+K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
          style={{
            width: '100%',
            padding: '6px 12px',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            background: 'var(--bg-base)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            outline: 'none',
          }}
        />
        {isSearchFocused && searchQuery && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderTop: 'none',
            borderRadius: '0 0 6px 6px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 1000,
          }}>
            {/* Mock search results - in real app, filter nodes */}
            {['app.js', 'auth.controller.js', 'user.service.js'].filter(f => f.toLowerCase().includes(searchQuery.toLowerCase())).map(file => (
              <div
                key={file}
                onClick={() => {
                  onSearchSelect(file)
                  setSearchQuery('')
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)',
                }}
                onMouseOver={(e) => e.target.style.background = 'var(--bg-hover)'}
                onMouseOut={(e) => e.target.style.background = 'transparent'}
              >
                {file}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '12px' }}>
        <span><span style={{ color: 'var(--text-primary)' }}>{nodeCount}</span> files</span>
        <span><span style={{ color: 'var(--text-primary)' }}>{linkCount}</span> dependencies</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Refetch button */}
      <button
        onClick={onRefetch}
        style={{
          fontSize: '11px',
          padding: '5px 14px',
          background: 'transparent',
          border: '1px solid var(--border-bright)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--text-secondary)',
          transition: 'all .15s',
        }}
        onMouseOver={e => { e.target.style.color='var(--text-primary)'; e.target.style.borderColor='var(--accent)'; }}
        onMouseOut={e  => { e.target.style.color='var(--text-secondary)'; e.target.style.borderColor='var(--border-bright)'; }}
      >
        ↺ Refetch
      </button>
    </header>
  )
}
