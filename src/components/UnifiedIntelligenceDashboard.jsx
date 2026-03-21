import React from 'react'
import StructuralNavigator from './panels/StructuralNavigator'
import { useAppStore } from '../store/appStore'

export default function UnifiedIntelligenceDashboard() {
  const {
    folderTree,
    fileMetadata,
    dependencyGraph,
    keyFunctions,
    selectedFile,
    setSelectedFile,
    insights,
  } = useAppStore()

  const totalFiles = Object.keys(folderTree).length
  const totalLines = Object.values(fileMetadata).reduce((sum, file) => sum + (file?.lines || 0), 0)
  const totalDeps = dependencyGraph?.nodes?.length || 0
  const importantDeps = (dependencyGraph?.nodes || []).slice(0, 6)

  const selectedSummary = selectedFile
    ? fileMetadata[selectedFile] || {
        lines: 0,
        imports: 0,
        exports: 0,
        complexity: 0,
        description: 'No metadata available for this file yet.',
      }
    : null

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(140deg, #03171b 0%, #06292f 30%, #0d4f5c 58%, #00e6aa 100%)',
      }}
    >
      {/* Search + Breadcrumb + Metric Badge Row */}
      <div
        style={{
          background: 'rgba(6, 10, 24, 0.88)',
          borderBottom: '1px solid rgba(0,230,170,0.2)',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div style={{ flex: 1, minWidth: 300 }}>
          <input
            placeholder="Search repository, file or symbol..."
            style={{
              width: '100%',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(7, 13, 25, 0.75)',
              color: '#e2e8f0',
              padding: '10px 12px',
              fontSize: '13px',
            }}
          />
        </div>

        <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span>📁 <strong>team-aura</strong> / <strong>codeaura-dashboard</strong></span>
          <span style={{ display: 'inline-flex', gap: '6px' }}>
            <span style={{ background: 'rgba(0,230,170,0.15)', border: '1px solid rgba(0,230,170,0.35)', borderRadius: '12px', padding: '4px 8px', color: '#8aedc3', fontWeight: 600 }}>Complexity: High</span>
            <span style={{ background: 'rgba(0,230,170,0.15)', border: '1px solid rgba(0,230,170,0.35)', borderRadius: '12px', padding: '4px 8px', color: '#8aedc3', fontWeight: 600 }}>Main Language: TypeScript</span>
            <span style={{ background: 'rgba(0,230,170,0.15)', border: '1px solid rgba(0,230,170,0.35)', borderRadius: '12px', padding: '4px 8px', color: '#8aedc3', fontWeight: 600 }}>Health: 94%</span>
          </span>
        </div>
      </div>

      {/* Main 3-column area */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '20% 55% 25%',
          gridTemplateRows: '1fr',
          gap: '14px',
          alignItems: 'start',
          padding: '16px',
          height: '100%',
          overflow: 'hidden',
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)',
          backgroundSize: '42px 42px',
        }}
      >
        {/* Left Column: File Tree */}
        <div
          style={{
            borderRadius: '0.5rem',
            border: '1px solid rgba(255,255,255,0.11)',
            background: 'rgba(5, 8, 16, 0.85)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,230,170,0.2)' }}>
            <div style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600, marginBottom: '6px' }}>File Tree</div>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#86efac' }}>Total files:</span>
              <span style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: 700 }}>{totalFiles}</span>
            </p>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <StructuralNavigator />
          </div>
        </div>

        {/* Center Column: Intelligence Report */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto', height: '100%' }}>
          <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(20, 30, 41, 0.8)', boxShadow: '0 8px 22px rgba(0,0,0,0.25)', minHeight: '240px' }}>
            <div style={{ borderBottom: '1px solid rgba(0,230,170,0.2)', padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
              <h2 style={{ margin: 0, fontSize: '16px', color: '#d1fae5' }}>Intelligence Report</h2>
              <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '12px' }}>Summary of the repository structure, complexity hotspots and actionable insights.</p>
            </div>
            <div style={{ padding: '14px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '12px' }}>
                {selectedFile
                  ? `Selected file: ${selectedFile}. ${selectedSummary?.description || 'Deep code-path insight for this module.'}`
                  : 'Select a file from the left panel to view enriched intelligence output. The panel indicates top risk areas, dependency centrality and complexity scores.'}
              </p>
              <ul style={{ marginTop: 0, paddingLeft: '20px' }}>
                <li>Folder scope analysis: critical path detection + code coupling matrix.</li>
                <li>M2 execution flow: selected entry points highlighted with risk scores.</li>
                <li>M3 dependency model: node centrality + cycle warning colored badges.</li>
                <li style={{ color: '#86efac' }}>Current system health: <strong>94%</strong> (no major security policy violations detected)</li>
              </ul>

              <div style={{ marginTop: '18px', background: 'rgba(0, 230, 170, 0.08)', border: '1px solid rgba(0, 230, 170, 0.3)', borderRadius: '0.5rem', padding: '12px' }}>
                <div style={{ color: '#00e6aa', fontWeight: 700, marginBottom: '6px' }}>Suggested Next Step</div>
                <div style={{ color: '#cffafe', fontSize: '13px' }}>
                  We detected a complex logic chain in <strong>auth.js</strong>. Click to inspect the <strong>Sequence Diagram</strong> and isolate authentication path impacts.
                </div>
                <button
                  type="button"
                  style={{
                    marginTop: '10px',
                    borderRadius: '0.5rem',
                    border: 'none',
                    padding: '8px 12px',
                    background: '#00e6aa',
                    color: '#0b0f11',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  View Sequence Diagram
                </button>
              </div>
            </div>
          </div>

          {/* Code Cards: Key Functions */}
          <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(16, 24, 35, 0.85)', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', padding: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '14px', color: '#d1fae5' }}>Key Functions</h3>
            <div style={{ marginTop: '12px', display: 'grid', gap: '10px' }}>
              {(keyFunctions || []).map((fn, idx) => (
                <div key={idx} style={{ background: 'rgba(7, 10, 21, 0.95)', border: '1px solid rgba(0,230,170,0.25)', borderRadius: '0.5rem', padding: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>🔧 {fn.name}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{fn.file}</div>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${fn.name} - ${fn.file}`)
                      }}
                      style={{
                        border: '1px solid rgba(0,230,170,0.3)',
                        background: 'rgba(0,230,170,0.15)',
                        color: '#bdf4e5',
                        borderRadius: '0.5rem',
                        padding: '4px 8px',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      Copy Reference
                    </button>
                  </div>
                  <p style={{ margin: '0 0 6px', fontSize: '12px', color: '#c9d8e3' }}>{fn.description}</p>
                  <code style={{ display: 'block', background: 'rgba(0,0,0,0.25)', color: '#a7f3d0', padding: '6px', borderRadius: '4px', fontSize: '11px' }}>
                    {fn.snippet}
                  </code>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Project Summary */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(11, 17, 29, 0.9)', padding: '14px', boxShadow: '0 8px 20px rgba(0,0,0,0.22)' }}>
            <h3 style={{ margin: '0 0 10px', color: '#d1fae5', fontSize: '14px' }}>Project Summary</h3>
            <p style={{ margin: '0', fontSize: '12px', color: '#94a3b8' }}>An overview of codebase health and size metrics.</p>
            <ul style={{ marginTop: '10px', paddingLeft: '16px', color: '#cbd5e1', fontSize: '12px' }}>
              <li>Total files: <strong style={{ color: '#a7f3d0' }}>{totalFiles}</strong></li>
              <li>Lines of code: <strong style={{ color: '#a7f3d0' }}>{totalLines}</strong></li>
              <li>Dependency nodes: <strong style={{ color: '#a7f3d0' }}>{totalDeps}</strong></li>
              <li>Selected file complexity: <strong style={{ color: '#a7f3d0' }}>{selectedSummary?.complexity ?? 'N/A'}</strong></li>
            </ul>
          </div>

          <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(11, 17, 29, 0.9)', padding: '14px' }}>
            <h3 style={{ margin: '0 0 10px', color: '#d1fae5', fontSize: '14px' }}>Key Dependencies</h3>
            <ul style={{ margin: 0, paddingLeft: '16px', color: '#cbd5e1', fontSize: '12px' }}>
              {importantDeps.length === 0 ? (
                <li style={{ color: 'var(--text-muted)' }}>None yet</li>
              ) : (
                importantDeps.map((node, idx) => (
                  <li key={idx}>{node.id || node.name || node}</li>
                ))
              )}
            </ul>
          </div>

          <div style={{ borderRadius: '0.5rem', border: '1px solid rgba(0,230,170,0.35)', background: 'rgba(0, 34, 34, 0.35)', padding: '12px', color: '#cdf9ea' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>Success Indicator</div>
            <div style={{ fontSize: '11px' }}>🟢 Analysis status: <strong style={{ color: '#00e6aa' }}>Clean</strong></div>
            <div style={{ fontSize: '11px' }}>🟢 Code churn risk low. Ready for refactor sprint.</div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            style={{
              borderRadius: '0.5rem',
              border: 'none',
              background: '#00e6aa',
              color: '#0b0f11',
              padding: '10px 14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 10px rgba(0,230,170,0.3)',
            }}
          >
            Clear selection
          </button>
        </aside>
      </div>
    </div>
  )
}
