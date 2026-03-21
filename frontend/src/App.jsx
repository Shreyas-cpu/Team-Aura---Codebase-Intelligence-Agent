import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Terminal, FolderTree, Code2, Cpu, Zap, Search, AlertCircle, MessageSquare, CornerDownRight, ShieldAlert, BookOpen, Layers } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loadingStep, setLoadingStep] = useState(null);
  const [error, setError] = useState(null);

  // Analysis Data
  const [session, setSession] = useState(null);
  const [structure, setStructure] = useState(null);
  const [entryPoint, setEntryPoint] = useState(null);
  const [dependencies, setDependencies] = useState(null);
  const [criticalFiles, setCriticalFiles] = useState(null);
  const [summary, setSummary] = useState(null);

  // Chat
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Ask me anything about this repository...' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => scrollToBottom(), [chatHistory]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!repoUrl) return;

    setError(null);
    setSession(null);
    setStructure(null);
    setEntryPoint(null);
    setDependencies(null);
    setCriticalFiles(null);
    setSummary(null);
    setChatHistory([{ role: 'ai', text: 'Codebase context loaded. Ask me anything.' }]);

    try {
      setLoadingStep('Cloning repository...');
      const cloneRes = await axios.post(`${API_BASE}/clone`, { repoUrl });
      const { sessionId, localPath } = cloneRes.data;
      setSession({ sessionId, localPath });

      // Parallelize analysis requests
      setLoadingStep('Analyzing folder structure & entry points...');
      const [structRes, entryRes, depRes, critRes, sumRes] = await Promise.all([
        axios.post(`${API_BASE}/analyze/structure`, { localPath }),
        axios.post(`${API_BASE}/analyze/entrypoint`, { localPath }),
        axios.post(`${API_BASE}/analyze/dependencies`, { localPath }),
        axios.post(`${API_BASE}/analyze/critical`, { localPath }),
        axios.post(`${API_BASE}/analyze/summary`, { localPath })
      ]);

      setStructure(structRes.data.data);
      setEntryPoint(entryRes.data.data);
      setDependencies(depRes.data.data);
      setCriticalFiles(critRes.data.data);
      setSummary(sumRes.data.data);

      setLoadingStep(null);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'An error occurred during analysis');
      setLoadingStep(null);
    }
  };

  const handleChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !session) return;

    const userMsg = chatInput.trim();
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const chatRes = await axios.post(`${API_BASE}/chat`, {
        sessionId: session.sessionId,
        localPath: session.localPath,
        message: userMsg
      });

      setChatHistory(prev => [...prev, { 
        role: 'ai', 
        text: chatRes.data.data.answer,
        sources: chatRes.data.data.sources 
      }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'Error connecting to RAG service.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{ padding: '60px 0 40px', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,230,170,0.08)', border: '1px solid rgba(0,230,170,0.25)', borderRadius: 4, padding: '4px 10px', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--teal)', letterSpacing: '0.08em', marginBottom: 20 }}>
          ▶ CODEAURA · SYSTEM READY
        </div>
        <h1 style={{ fontSize: 'clamp(36px, 6vw, 60px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 12 }}>
          Codebase<span style={{ color: 'var(--teal)' }}>Intelligence</span>
        </h1>
        <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: 16, marginTop: 32, maxWidth: 600 }}>
          <input
            className="input-text"
            placeholder="https://github.com/your-repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            disabled={!!loadingStep}
          />
          <button type="submit" className="btn-primary" disabled={!!loadingStep || !repoUrl}>
            {loadingStep ? 'ANALYSING...' : 'ANALYSE →'}
          </button>
        </form>
        {error && <div style={{ color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: 12, marginTop: 12 }}>{error}</div>}
      </header>

      {/* Loading State */}
      {loadingStep && (
        <div className="card-base card-blue" style={{ textAlign: 'center', padding: '60px 20px', margin: '40px 0' }}>
          <div style={{ position: 'relative', width: '100%', height: 2, background: 'rgba(79,163,255,0.2)', overflow: 'hidden', borderRadius: 2, marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '50%', background: 'var(--blue)', animation: 'shimmer 1s infinite linear' }} />
          </div>
          <p className="mono" style={{ color: 'var(--blue)', letterSpacing: '0.1em' }}>{loadingStep.toUpperCase()}</p>
        </div>
      )}

      {/* Dashboard Matrix */}
      {!loadingStep && summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '24px' }}>

          {/* LEFT COLUMN: Files & Structure */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Critical Files */}
            <div className="card-base card-amber">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <ShieldAlert size={16} color="var(--amber)" />
                <h3 style={{ color: 'var(--amber)' }}>B1 Critical Files</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {criticalFiles?.map((file, i) => (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text)', wordBreak: 'break-all' }}>{file.path}</span>
                      <span className="mono" style={{ fontSize: 9, color: 'var(--amber)' }}>{file.score}pts</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <span className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', border: '1px solid var(--border-soft)', padding: '2px 6px', borderRadius: 4 }}>{file.category}</span>
                      <span className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', border: '1px solid var(--border-soft)', padding: '2px 6px', borderRadius: 4 }}>x{file.importedByCount} imports</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Folder Structure */}
            <div className="card-base card-teal">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <FolderTree size={16} color="var(--teal)" />
                <h3 style={{ color: 'var(--teal)' }}>M1 Architecture</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: 4 }}>
                {structure?.folders.map((folder, i) => (
                  <div key={i} style={{ position: 'relative', paddingLeft: 12, borderLeft: '1px solid var(--border-soft)', paddingBottom: 16 }}>
                    <div style={{ position: 'absolute', left: 0, top: 8, width: 8, height: 1, background: 'var(--border-soft)' }} />
                    <div className="mono" style={{ fontSize: 12, color: 'var(--teal)' }}>/{folder.path || 'root'} <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>({folder.fileCount} files)</span></div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>{folder.classification}</div>
                    <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4, lineHeight: 1.4 }}>{folder.description}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI & Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Repository Summary (B3) */}
            <div className="card-base" style={{ background: '#0a0d12' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Zap size={16} color="var(--purple)" />
                <h3 style={{ color: 'var(--text)' }}>B3 Intelligence Brief</h3>
              </div>
              <p style={{ fontSize: 16, color: '#e2e8f0', marginBottom: 20, borderLeft: '2px solid var(--purple)', paddingLeft: 16, lineHeight: 1.5 }}>
                {summary?.oneLineSummary}
              </p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Tech Stack</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {summary?.techStack?.map((t, i) => (
                      <span key={i} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, padding: '3px 10px', fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text)' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Architecture</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--teal)' }}>{summary?.architectureStyle}</div>
                </div>
              </div>
            </div>

            {/* Entry Point (M2) */}
            <div className="card-base card-blue" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <CornerDownRight size={16} color="var(--blue)" />
                  <h3 style={{ color: 'var(--blue)' }}>M2 Entry Point</h3>
                </div>
                <div className="mono" style={{ color: 'var(--text)', fontSize: 13, padding: '8px 12px', background: 'rgba(79,163,255,0.1)', borderRadius: 6, border: '1px solid rgba(79,163,255,0.3)', display: 'inline-block' }}>
                  {entryPoint?.entryFile}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 12, lineHeight: 1.5 }}>
                  {entryPoint?.description}
                </p>
              </div>
              <div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--blue)', letterSpacing: '0.1em', marginBottom: 8 }}>M2 EXECUTION CHAIN</div>
                <div style={{ background: '#050709', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                  {(!entryPoint?.executionChain || entryPoint.executionChain.length === 0) ? (
                    <div className="mono" style={{ color: 'var(--text-dim)', fontSize: 11, textAlign: 'center', padding: '10px 0' }}>
                      No execution chain mapped.
                    </div>
                  ) : (
                    <>
                      {entryPoint.executionChain.slice(0, 5).map((chain, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 8 }}>
                          <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</span>
                          <span className="mono" style={{ color: '#8ba8c8', fontSize: 11 }}>{chain.file}</span>
                        </div>
                      ))}
                      {entryPoint.executionChain.length > 5 && (
                        <div className="mono" style={{ padding: '0 8px 8px', color: 'var(--text-dim)', fontSize: 10 }}>+ {entryPoint.executionChain.length - 5} more files</div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* M3 Stats */}
            <div style={{ display: 'flex', gap: 24 }}>
              <div className="card-base" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>M3 NODES PARSED</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--display)' }}>{dependencies?.nodes?.length || 0}</div>
                </div>
                <Cpu size={24} color="var(--text-dim)" opacity={0.5} />
              </div>
              <div className="card-base" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', letterSpacing: '0.1em' }}>M3 GRAPH EDGES</div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--display)' }}>{dependencies?.edges?.length || 0}</div>
                </div>
                <Layers size={24} color="var(--text-dim)" opacity={0.5} />
              </div>
            </div>

            {/* RAG Chat Component */}
            <div className="card-base" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '400px', background: '#080b10', border: '1px solid rgba(79,163,255,0.2)' }}>
              <div style={{ background: '#0d1829', borderBottom: '1px solid rgba(79,163,255,0.15)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)', animation: 'pulse 2s infinite' }}></div>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text)' }}>RAG EXPERT CHAT</span>
              </div>
              
              <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {chatHistory.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <div style={{
                      background: msg.role === 'user' ? 'rgba(0,230,170,0.07)' : 'rgba(79,163,255,0.07)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(0,230,170,0.14)' : 'rgba(79,163,255,0.14)'}`,
                      borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                      padding: '12px 16px',
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                      color: msg.role === 'user' ? 'var(--teal)' : '#e2e8f0',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap'
                    }}>
                      {msg.text}
                    </div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6, marginLeft: 4 }}>
                        {msg.sources.map((src, idx) => (
                          <span key={idx} style={{ background: 'rgba(79,163,255,0.12)', border: '1px solid rgba(79,163,255,0.2)', borderRadius: 3, padding: '2px 6px', fontSize: 9, fontFamily: 'var(--mono)', color: 'var(--blue)' }}>
                            {src.split('/').pop()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {chatLoading && (
                  <div style={{ alignSelf: 'flex-start', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text-dim)', animation: 'blink 1.5s infinite running' }}>
                    AI is analyzing codebase...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div style={{ padding: 16, borderTop: '1px solid var(--border-soft)' }}>
                <form onSubmit={handleChat} style={{ display: 'flex', gap: 12 }}>
                  <input
                    className="input-text"
                    style={{ background: '#050709', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="Ask about authentication, specific components, or code flow..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={chatLoading}
                  />
                  <button type="submit" className="btn-primary" disabled={!chatInput.trim() || chatLoading} style={{ background: 'var(--blue)', color: '#000' }}>
                    SEND
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <div className="divider"></div>
      <footer>
        <div className="footer-brand">Code<span className="accent" style={{ color: 'var(--teal)' }}>Aura</span></div>
        <div className="footer-meta">v1.2.0-beta | Intelligent Repo Analyser</div>
      </footer>
    </div>
  );
}
