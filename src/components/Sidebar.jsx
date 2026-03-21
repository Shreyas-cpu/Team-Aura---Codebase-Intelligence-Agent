import React from 'react'
import { TYPE_CONFIG } from '../data/typeConfig'
import { FILE_META } from '../data/mockData'

function Tag({ type }) {
  const c = TYPE_CONFIG[type] || TYPE_CONFIG.config
  return (
    <span style={{
      fontSize: '10px',
      fontWeight: 600,
      letterSpacing: '.06em',
      textTransform: 'uppercase',
      color: c.label,
      background: c.bg,
      border: `1px solid ${c.color}44`,
      padding: '2px 8px',
      borderRadius: '4px',
    }}>{type}</span>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '10px',
        fontWeight: 600,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
        marginBottom: '8px',
      }}>{title}</div>
      {children}
    </div>
  )
}

export default function Sidebar({ selected, nodes, links, onFilterChange }) {
  const imports = selected
    ? links.filter(l => (l.target?.id || l.target) === selected.id).map(l => l.source?.id || l.source)
    : []
  const deps = selected
    ? links.filter(l => (l.source?.id || l.source) === selected.id).map(l => l.target?.id || l.target)
    : []

  const meta = selected ? FILE_META[selected.id] : null

  return (
    <aside style={{
      width: '240px',
      flexShrink: 0,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Panel header */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid var(--border)',
        fontFamily: 'var(--font-display)',
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-muted)',
        letterSpacing: '.08em',
        textTransform: 'uppercase',
      }}>
        Inspector
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {!selected ? (
          <div style={{
            color: 'var(--text-muted)',
            fontSize: '12px',
            lineHeight: 1.7,
            marginTop: '8px',
          }}>
            Click any node in the graph to inspect its dependencies.
          </div>
        ) : (
          <>
            {/* File name */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--text-primary)',
                marginBottom: '6px',
                wordBreak: 'break-all',
              }}>
                {selected.id}
              </div>
              <Tag type={selected.type} />
              {meta && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-base)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--border)',
                  }}>
                    {meta.lines} lines
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-base)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--border)',
                  }}>
                    {meta.size}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-base)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--border)',
                  }}>
                    Complexity: {meta.complexity}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-base)',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    border: '1px solid var(--border)',
                  }}>
                    Maintainability: {meta.maintainability}%
                  </span>
                </div>
              )}
              <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => navigator.clipboard.writeText(selected.id)}
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent)',
                    borderRadius: '4px',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                  }}
                >
                  📋 Copy Path
                </button>
                <button
                  onClick={() => {
                    // Mock VS Code open - in real app, use vscode API
                    console.log('Open in VS Code:', selected.id)
                  }}
                  style={{
                    fontSize: '10px',
                    padding: '4px 8px',
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  🖥️ Open in VS Code
                </button>
              </div>
            </div>

            {/* Description */}
            {meta && (
              <Section title="About">
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                  {meta.desc}
                </p>
              </Section>
            )}

            {/* Code Preview */}
            {meta && meta.codeSnippet && (
              <Section title="Code Preview">
                <pre style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--code-bg)',
                  padding: '8px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '150px',
                  lineHeight: 1.4,
                  color: 'var(--text-primary)',
                }}>
                  {meta.codeSnippet}
                </pre>
              </Section>
            )}

            {/* Imported by */}
            {imports.length > 0 && (
              <Section title={`Imported by (${imports.length})`}>
                {imports.map(f => (
                  <div key={f} style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--accent)',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>↑ {f}</div>
                ))}
              </Section>
            )}

            {/* Depends on */}
            {deps.length > 0 && (
              <Section title={`Depends on (${deps.length})`}>
                {deps.map(f => (
                  <div key={f} style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-secondary)',
                    padding: '4px 0',
                    borderBottom: '1px solid var(--border)',
                  }}>↓ {f}</div>
                ))}
              </Section>
            )}
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{
        borderTop: '1px solid var(--border)',
        padding: '12px 16px',
      }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 600,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '8px',
        }}>Legend</div>
        {Object.entries(TYPE_CONFIG).map(([type, c]) => (
          <div
            key={type}
            onClick={() => onFilterChange?.(type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '5px',
              cursor: 'pointer',
              padding: '2px 4px',
              borderRadius: '4px',
            }}
            onMouseOver={(e) => e.target.closest('div').style.background = 'var(--bg-hover)'}
            onMouseOut={(e) => e.target.closest('div').style.background = 'transparent'}
          >
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: c.color, flexShrink: 0,
            }} />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{type}</span>
          </div>
        ))}
      </div>
    </aside>
  )
}
