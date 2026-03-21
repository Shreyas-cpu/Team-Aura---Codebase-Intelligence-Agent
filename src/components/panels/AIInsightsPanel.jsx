import React, { useState, useRef, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'

export default function AIInsightsPanel() {
  const { selectedFile, fileMetadata, insights, chatMessages, addChatMessage } = useAppStore()
  const [inputValue, setInputValue] = useState('')
  const [activeTab, setActiveTab] = useState('summary') // 'summary' | 'inspector' | 'bugs'
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    addChatMessage('user', inputValue)
    setInputValue('')
    
    // Simulate AI response
    setTimeout(() => {
      addChatMessage(
        'assistant',
        `I'm analyzing "${inputValue}" in your codebase. This is a mock response - in production, I'd use Gemini API to provide real insights.`
      )
    }, 800)
  }

  return (
    <div
      style={{
        width: '320px',
        height: '100%',
        background: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border)',
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
          }}
        >
          🤖 AI Insights & Chat
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}
      >
        {[
          { id: 'summary', label: '📊 Summary', show: !selectedFile },
          { id: 'inspector', label: '🔍 Inspector', show: !!selectedFile },
          { id: 'bugs', label: '🐛 Bugs' },
          { id: 'chat', label: '💬 Chat' },
        ].map(
          (tab) =>
            tab.show !== false && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: activeTab === tab.id ? 'rgba(147, 112, 219, 0.1)' : 'transparent',
                  border: 'none',
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: '10px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : 'none',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = 'var(--text-primary)'
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {tab.label}
              </button>
            )
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: activeTab === 'chat' ? 'flex' : 'block', flexDirection: activeTab === 'chat' ? 'column' : 'row' }}>
        {activeTab === 'summary' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Project Insight Summary
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '16px' }}>
              {insights?.summary || 'No insights available'}
            </p>

            {insights?.recommendations && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  💡 Recommendations:
                </div>
                <ul style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
                  {insights.recommendations.map((rec, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'inspector' && selectedFile && (
          <div>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: '12px', wordBreak: 'break-all' }}>
              {selectedFile}
            </div>

            {fileMetadata[selectedFile] && (
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.8' }}>
                <div>
                  <strong>Lines:</strong> {fileMetadata[selectedFile].lines}
                </div>
                <div>
                  <strong>Imports:</strong> {fileMetadata[selectedFile].imports}
                </div>
                <div>
                  <strong>Exports:</strong> {fileMetadata[selectedFile].exports}
                </div>
                <div>
                  <strong>Complexity:</strong> {fileMetadata[selectedFile].complexity}/10
                </div>
              </div>
            )}

            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)', marginTop: '16px', marginBottom: '8px' }}>
              📝 AI Generated Summary:
            </div>
            <p style={{ fontSize: '10px', color: 'var(--text-secondary)', lineHeight: '1.6', fontStyle: 'italic' }}>
              This file contains the {selectedFile} logic and exposes key functionality to dependent modules.
            </p>
          </div>
        )}

        {activeTab === 'bugs' && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              🐛 Potential Issues
            </div>
            {insights?.riskFactors && insights.riskFactors.length > 0 ? (
              <ul style={{ fontSize: '10px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '16px', lineHeight: '1.6' }}>
                {insights.riskFactors.map((risk, idx) => (
                  <li key={idx} style={{ marginBottom: '8px', color: '#ff6b6b' }}>
                    ⚠️ {risk}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No critical issues detected</p>
            )}
          </div>
        )}

        {activeTab === 'chat' && (
          <>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column' }}>
              {chatMessages.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', margin: 'auto' }}>
                  Ask me anything about your code...
                </div>
              ) : (
                chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: '12px',
                      display: 'flex',
                      justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        background: msg.role === 'user' ? 'var(--accent-dim)' : 'rgba(255, 255, 255, 0.05)',
                        color: msg.role === 'user' ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '11px',
                        lineHeight: '1.4',
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask Gemini..."
                style={{
                  flex: 1,
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSendMessage}
                style={{
                  padding: '6px 10px',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent)',
                  borderRadius: '6px',
                  color: 'var(--accent)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
