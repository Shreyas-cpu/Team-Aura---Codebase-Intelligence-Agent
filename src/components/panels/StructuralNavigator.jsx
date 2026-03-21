import React, { useState } from 'react'
import { useAppStore } from '../../store/appStore'

// Mock criticality scores - in production, calculated by AI
const getFileImportance = (filename) => {
  const criticalPatterns = ['app', 'index', 'main', 'core', 'config']
  const isCritical = criticalPatterns.some((p) => filename.toLowerCase().includes(p))
  const importance = isCritical ? 0.8 : Math.random()
  return importance
}

const getCriticalityColor = (importance) => {
  if (importance > 0.7) return '#ff6b6b' // Red - Core logic
  if (importance > 0.4) return '#ffd93d' // Yellow - Important
  return '#888888' // Grey - Boilerplate
}

export default function StructuralNavigator() {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['src/']))
  const [searchTerm, setSearchTerm] = useState('')
  const { folderTree, selectedFile, setSelectedFile } = useAppStore()

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const renderTreeItem = (item, path = '', level = 0) => {
    const isFolder = item.includes('/')
    const fullPath = path + item
    const isExpanded = expandedFolders.has(fullPath)
    const importance = getFileImportance(item)
    const color = getCriticalityColor(importance)

    return (
      <div key={fullPath}>
        {isFolder ? (
          <>
            <div
              onClick={() => toggleFolder(fullPath)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 0',
                paddingLeft: `${level * 12}px`,
                cursor: 'pointer',
                color: '#b0b8d4',
                fontSize: '12px',
                transition: 'all 0.2s',
                userSelect: 'none',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#b0b8d4'
              }}
            >
              <span style={{ marginRight: '4px', minWidth: '16px' }}>
                {isExpanded ? '📂' : '📁'}
              </span>
              <span style={{ fontWeight: 500 }}>{item}</span>
            </div>

            {isExpanded && folderTree[fullPath] && (
              <div>
                {folderTree[fullPath].map((subitem) =>
                  renderTreeItem(subitem, fullPath, level + 1)
                )}
              </div>
            )}
          </>
        ) : (
          <div
            onClick={() => setSelectedFile(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 8px',
              paddingLeft: `${level * 12}px`,
              cursor: 'pointer',
              background: selectedFile === item ? 'rgba(147, 112, 219, 0.2)' : 'transparent',
              color: selectedFile === item ? '#ffffff' : '#b0b8d4',
              fontSize: '12px',
              fontFamily: 'var(--font-mono)',
              borderRadius: '4px',
              transition: 'all 0.2s',
              marginBottom: '2px',
              borderLeft: `2px solid ${color}`,
              position: 'relative',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              // Show criticality tooltip
            }}
            onMouseOut={(e) => {
              if (selectedFile !== item) {
                e.currentTarget.style.background = 'transparent'
              }
            }}
            title={
              importance > 0.7
                ? 'Core Logic - Critical'
                : importance > 0.4
                  ? 'Important Module'
                  : 'Boilerplate'
            }
          >
            <span style={{ marginRight: '6px' }}>📄</span>
            <span style={{ flex: 1 }}>{item}</span>
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: color,
                marginLeft: '4px',
              }}
            />
          </div>
        )}
      </div>
    )
  }

  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredRoots = Object.keys(folderTree).filter((root) => {
    if (normalizedSearch === '') return true
    const items = [root, ...(folderTree[root] || [])].join(' ').toLowerCase()
    return items.includes(normalizedSearch)
  })

  return (
    <div
      style={{
        width: '240px',
        height: '100%',
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: 'var(--text-muted)',
            marginBottom: '12px',
          }}
        >
          📁 Structure Navigator (M1)
        </div>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search files..."
          style={{
            width: '100%',
            marginBottom: '12px',
            padding: '8px 10px',
            fontSize: '11px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            background: 'rgba(255,255,255,0.04)',
            color: 'var(--text-primary)',
            outline: 'none',
          }}
        />

        {/* Legend */}
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ff6b6b' }} />
            <span>Core Logic</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffd93d' }} />
            <span>Important</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#888888' }} />
            <span>Boilerplate</span>
          </div>
        </div>
      </div>

      {/* Tree Viewer */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
          fontSize: '12px',
        }}
      >
        {Object.keys(folderTree).length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
            No files loaded
          </div>
        ) : (
          filteredRoots.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '20px' }}>
              No matching files
            </div>
          ) : (
            filteredRoots.map((item) => renderTreeItem(item))
          )
        )}
      </div>

      {/* Stats Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          flexShrink: 0,
          background: 'rgba(0, 0, 0, 0.2)',
        }}
      >
        <div style={{ marginBottom: '4px' }}>
          📊 <strong>Files:</strong> {Object.keys(folderTree).length}
        </div>
        <div>
          📁 <strong>Folders:</strong> {Object.values(folderTree).flat().filter((f) => f.includes('/')).length}
        </div>
      </div>
    </div>
  )
}
