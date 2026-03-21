import React, { useEffect } from 'react'
import { useAppStore } from '../store/appStore'

export default function LoadingOrchestration() {
  const { loadingProgress, loadingLogs } = useAppStore()

  useEffect(() => {
    // Simulate orchestration workflow
    const simulateAnalysis = async () => {
      const steps = [
        { delay: 500, progress: 10, message: '📦 Initializing repository scanner...' },
        { delay: 1500, progress: 20, message: '🔍 Cloning repository...' },
        { delay: 2500, progress: 35, message: '🌳 Constructing Abstract Syntax Tree (AST)...' },
        { delay: 3500, progress: 50, message: '📊 Analyzing dependencies and relationships...' },
        { delay: 4500, progress: 65, message: '🤖 Gemini is reading your code...' },
        { delay: 5500, progress: 80, message: '🔬 Performing bug & security analysis...' },
        { delay: 6500, progress: 90, message: '✨ Generating AI insights...' },
        { delay: 7500, progress: 100, message: '✅ Analysis complete! Preparing dashboard...' },
      ]

      for (const step of steps) {
        await new Promise((resolve) => setTimeout(resolve, step.delay))
        useAppStore.setState((state) => ({
          loadingProgress: step.progress,
          loadingLogs: [...state.loadingLogs, { message: step.message, timestamp: new Date() }],
        }))
      }

      // Simulate completion with mock data
      setTimeout(() => {
        useAppStore.setState((state) => ({
          projectData: {
            name: 'Sample Project',
            description: 'Your analyzed repository',
          },
          folderTree: {
            'src/': ['app.js', 'index.js', 'utils/'],
            'src/utils/': ['helpers.js', 'constants.js'],
            'public/': ['index.html'],
          },
          fileMetadata: {
            'app.js': { lines: 250, imports: 5, exports: 2, complexity: 8 },
            'utils/helpers.js': { lines: 100, imports: 2, exports: 5, complexity: 3 },
          },
          executionFlow: [
            { from: 'app.js', to: 'index.js', type: 'import' },
            { from: 'index.js', to: 'utils/helpers.js', type: 'import' },
          ],
          dependencyGraph: {
            nodes: [
              { id: 'app.js', type: 'root' },
              { id: 'index.js', type: 'entry' },
              { id: 'utils/helpers.js', type: 'utility' },
            ],
            links: [
              { source: 'app.js', target: 'index.js' },
              { source: 'index.js', target: 'utils/helpers.js' },
            ],
          },
          insights: {
            summary:
              'This is a well-structured Node.js application with clear separation of concerns. The codebase follows modern JavaScript best practices.',
            riskFactors: ['High cyclomatic complexity in app.js', 'Missing error handling in utils/helpers.js'],
            recommendations: [
              'Refactor app.js into smaller modules',
              'Add comprehensive error handling',
              'Increase test coverage for critical paths',
            ],
          },
          isAnalyzing: false,
          appStage: 'dashboard',
        }))
      }, 8000)
    }

    simulateAnalysis()
  }, [])

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
        padding: '40px',
        overflow: 'hidden',
      }}
    >
      {/* Animated Logo */}
      <div
        style={{
          fontSize: '64px',
          marginBottom: '40px',
          animation: 'pulse 2s ease-in-out infinite',
        }}
      >
        🧠
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '32px',
          color: '#ffffff',
          marginBottom: '8px',
          fontWeight: 700,
        }}
      >
        Analyzing Your Repository
      </h1>

      <p
        style={{
          fontSize: '14px',
          color: '#8a92a8',
          marginBottom: '40px',
        }}
      >
        This may take a moment...
      </p>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          maxWidth: '400px',
          marginBottom: '40px',
        }}
      >
        <div
          style={{
            height: '4px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '8px',
          }}
        >
          <div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #9370db 0%, #6a5acd 100%)',
              width: `${loadingProgress}%`,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: '#8a92a8',
          }}
        >
          <span>Processing...</span>
          <span>{loadingProgress}%</span>
        </div>
      </div>

      {/* Status Logs */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          padding: '20px',
          maxHeight: '300px',
          overflowY: 'auto',
          marginBottom: '20px',
        }}
      >
        {loadingLogs.length === 0 ? (
          <div style={{ color: '#8a92a8', fontSize: '13px', textAlign: 'center' }}>
            Initializing...
          </div>
        ) : (
          loadingLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                fontSize: '12px',
                color: '#b0b8d4',
                marginBottom: '8px',
                padding: '6px 0',
                borderBottom: idx < loadingLogs.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                fontFamily: 'var(--font-mono)',
                animation: idx === loadingLogs.length - 1 ? 'fadeIn 0.3s ease' : 'none',
              }}
            >
              <span style={{ color: '#8a92a8' }}>{`>`}</span> {log.message}
            </div>
          ))
        )}
      </div>

      {/* Skeleton Placeholders */}
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          marginTop: '30px',
        }}
      >
        <p
          style={{
            fontSize: '11px',
            color: '#8a92a8',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontWeight: 600,
            marginBottom: '12px',
          }}
        >
          Preview (Loading...)
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 3fr',
            gap: '16px',
          }}
        >
          {/* Skeleton Folder Tree */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px',
              minHeight: '150px',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: '8px',
                  background: 'rgba(147, 112, 219, 0.2)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  animation: 'shimmer 2s infinite',
                }}
              />
            ))}
          </div>

          {/* Skeleton Graph */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '12px',
              minHeight: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(147, 112, 219, 0.2)',
                  animation: `pulse 2s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes shimmer {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}
