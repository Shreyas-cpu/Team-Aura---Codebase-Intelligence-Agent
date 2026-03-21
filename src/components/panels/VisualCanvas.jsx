import React from 'react'
import { useAppStore } from '../../store/appStore'
import DependencyGraph from '../DependencyGraph'

export default function VisualCanvas() {
  const { selectedView, setSelectedView, executionFlow, dependencyGraph } = useAppStore()

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-base)',
        borderRight: '1px solid var(--border)',
      }}
    >
      {/* View Toggle */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          padding: '12px 16px',
          borderBottom: '1px solid var(--border)',
          background: 'var(--bg-surface)',
          flexShrink: 0,
        }}
      >
        <button
          onClick={() => setSelectedView('timeline')}
          style={{
            padding: '6px 12px',
            background: selectedView === 'timeline' ? 'var(--accent-dim)' : 'transparent',
            border: `1px solid ${selectedView === 'timeline' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '6px',
            color: selectedView === 'timeline' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          ⏱️ Execution Timeline (M2)
        </button>
        <button
          onClick={() => setSelectedView('dependency')}
          style={{
            padding: '6px 12px',
            background: selectedView === 'dependency' ? 'var(--accent-dim)' : 'transparent',
            border: `1px solid ${selectedView === 'dependency' ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '6px',
            color: selectedView === 'dependency' ? 'var(--accent)' : 'var(--text-secondary)',
            cursor: 'pointer',
            fontSize: '11px',
            fontWeight: 600,
            transition: 'all 0.2s',
          }}
        >
          📊 Dependency Graph (M3)
        </button>
      </div>

      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {selectedView === 'timeline' ? (
          <ExecutionTimeline executionFlow={executionFlow} />
        ) : (
          <DependencyGraph nodes={dependencyGraph.nodes} links={dependencyGraph.links} />
        )}
      </div>
    </div>
  )
}

function ExecutionTimeline({ executionFlow }) {
  if (!executionFlow || executionFlow.length === 0) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⏱️</div>
          <div>No execution flow data available</div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        padding: '32px',
        overflowY: 'auto',
        height: '100%',
        background: `radial-gradient(circle at 2px 50%, rgba(147, 112, 219, 0.1) 1px, transparent 1px) 0 0 / 12px 40px repeat-y`,
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
          Execution Flow
        </h3>

        {executionFlow.map((step, idx) => {
          const isLast = idx === executionFlow.length - 1
          return (
            <div key={idx} style={{ marginBottom: '32px', position: 'relative' }}>
              {/* Timeline node */}
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  top: '0',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  border: '2px solid var(--bg-base)',
                  boxShadow: '0 0 0 4px rgba(147, 112, 219, 0.1)',
                }}
              />

              {/* Content */}
              <div style={{ marginLeft: '32px' }}>
                <div
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                      {step.from}
                    </span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>→</span>
                    <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                      {step.to}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {step.type}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    left: '5px',
                    top: '12px',
                    width: '2px',
                    height: '32px',
                    background: 'linear-gradient(to bottom, var(--accent), transparent)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
