import React, { useState } from 'react'

export default function LandingPage({ onAnalyze }) {
  const [urlInput, setUrlInput] = useState('')
  const [depth, setDepth] = useState('intermediate')
  const [error, setError] = useState('')

  const handleAnalyze = () => {
    if (!urlInput.trim()) {
      setError('Please enter a GitHub URL or local repository path')
      return
    }
    setError('')
    onAnalyze(urlInput, depth)
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #1a1f3a 0%, #2d1b4e 50%, #1a1f3a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflow: 'auto',
      }}
    >
      {/* Hero Section */}
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h1
          style={{
            fontSize: '48px',
            color: '#ffffff',
            marginBottom: '12px',
            fontWeight: 700,
            letterSpacing: '-1px',
          }}
        >
          🧠 Codebase Intelligence
        </h1>
        <p
          style={{
            fontSize: '18px',
            color: '#b0b8d4',
            marginBottom: '8px',
            fontWeight: 400,
          }}
        >
          Analyze your repository with AI-powered insights
        </p>
        <p
          style={{
            fontSize: '14px',
            color: '#8a92a8',
            fontWeight: 300,
          }}
        >
          Understand dependencies, execution flows, and code structure at a glance
        </p>
      </div>

      {/* Input Card */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.02)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '40px',
          width: '100%',
          maxWidth: '500px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* URL Input */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#8a92a8',
              marginBottom: '8px',
            }}
          >
            Repository Location
          </label>
          <input
            type="text"
            placeholder="https://github.com/user/repo or /local/path"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              fontFamily: 'var(--font-mono)',
              outline: 'none',
              transition: 'all 0.2s',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.1)'
              e.target.style.borderColor = 'rgba(147, 112, 219, 0.4)'
            }}
            onBlur={(e) => {
              e.target.style.background = 'rgba(255, 255, 255, 0.06)'
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'
            }}
          />
        </div>

        {/* Analysis Depth */}
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#8a92a8',
              marginBottom: '8px',
            }}
          >
            Analysis Depth
          </label>
          <select
            value={depth}
            onChange={(e) => setDepth(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              cursor: 'pointer',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          >
            <option value="surface" style={{ background: '#1a1f3a' }}>
              Surface Level (Fast)
            </option>
            <option value="intermediate" style={{ background: '#1a1f3a' }}>
              Intermediate (Balanced)
            </option>
            <option value="deep" style={{ background: '#1a1f3a' }}>
              Deep Gemini Dive (Thorough)
            </option>
          </select>
          <p
            style={{
              fontSize: '12px',
              color: '#6a7288',
              marginTop: '6px',
              fontStyle: 'italic',
            }}
          >
            {depth === 'surface' &&
              'Quick AST scan and dependency extraction.'}
            {depth === 'intermediate' &&
              'Full graph analysis with Gemini file summaries.'}
            {depth === 'deep' &&
              'Comprehensive analysis including bug detection and architecture review.'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            style={{
              background: 'rgba(255, 107, 107, 0.1)',
              border: '1px solid rgba(255, 107, 107, 0.3)',
              color: '#ff6b6b',
              padding: '10px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        {/* Launch Button */}
        <button
          onClick={handleAnalyze}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #9370db 0%, #6a5acd 100%)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 16px rgba(147, 112, 219, 0.3)',
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)'
            e.target.style.boxShadow = '0 6px 20px rgba(147, 112, 219, 0.4)'
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)'
            e.target.style.boxShadow = '0 4px 16px rgba(147, 112, 219, 0.3)'
          }}
        >
          🚀 Launch Intelligence
        </button>
      </div>

      {/* Features Preview */}
      <div
        style={{
          marginTop: '60px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '1000px',
        }}
      >
        {[
          { icon: '📊', title: 'Dependency Graph', desc: 'Interactive visualization of code relationships' },
          { icon: '⏱️', title: 'Execution Flow', desc: 'Trace execution paths and data flow' },
          { icon: '🤖', title: 'AI Insights', desc: 'Gemini-powered code analysis and recommendations' },
          { icon: '🐛', title: 'Bug Detection', desc: 'Identify potential issues and vulnerabilities' },
        ].map((feature, idx) => (
          <div
            key={idx}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'
              e.currentTarget.style.borderColor = 'rgba(147, 112, 219, 0.3)'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'
            }}
          >
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>{feature.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff', marginBottom: '4px' }}>
              {feature.title}
            </div>
            <div style={{ fontSize: '12px', color: '#8a92a8', lineHeight: 1.4 }}>
              {feature.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
