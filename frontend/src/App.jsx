import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Terminal, FolderGit2, Cpu, GitBranch, MessageSquare, AlertTriangle, CheckCircle2, ChevronRight, Hash, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

const API_BASE = 'http://localhost:3001/api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// recursive folder tree component wrapper
function FolderTree({ folders, topFiles }) {
  return (
    <div>
      <div className="ui-tree-folder" style={{ color: 'var(--text)' }}>/ repo_root</div>
      <div className="ui-tree-indent">
        {folders?.map(f => (
          <div key={f.path} className="ui-tree-folder" style={{ color: f.classification === 'CRITICAL' ? 'var(--amber)' : 'var(--teal)' }}>
            {f.path}/
          </div>
        ))}
        {topFiles?.map(f => (
          <div key={f.path} className="ui-tree-item">
            {f.path}
          </div>
        ))}
        <div className="ui-tree-item" style={{ color: 'var(--text-dim)' }}>
           node_modules/ X
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loadingStep, setLoadingStep] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('M1');

  // Datasets
  const [structureData, setStructureData] = useState(null);
  const [entryPoint, setEntryPoint] = useState(null);
  const [dependencies, setDependencies] = useState(null);
  const [criticalFiles, setCriticalFiles] = useState(null);
  const [summary, setSummary] = useState(null);

  // Chat
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: 'Codebase context loaded. Ask me anything about the architecture or specifics.' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    try {
      setError(null);
      setStructureData(null); setEntryPoint(null); setDependencies(null); setCriticalFiles(null); setSummary(null);
      
      setLoadingStep('Cloning repository...');
      await axios.post(`${API_BASE}/clone`, { repoUrl });

      setLoadingStep('M1: Analyzing Folder Structure...');
      const { data: st } = await axios.post(`${API_BASE}/analyze/structure`);
      setStructureData(st);

      setLoadingStep('M2: Detecting Entry Point & Flow...');
      const { data: ep } = await axios.post(`${API_BASE}/analyze/entrypoint`);
      setEntryPoint(ep);

      setLoadingStep('M3: Mapping Dependency Graph...');
      const { data: dep } = await axios.post(`${API_BASE}/analyze/dependencies`);
      setDependencies(dep);

      setLoadingStep('B1: Scoring Critical Files...');
      const { data: b1 } = await axios.post(`${API_BASE}/analyze/critical`);
      setCriticalFiles(b1);

      setLoadingStep('B3: Generating AI Summary...');
      try {
        const { data: sum } = await axios.post(`${API_BASE}/analyze/summary`);
        setSummary(sum);
      } catch (e) {
        setSummary({ content: 'Summary generation failed — AI service temporarily unavailable.' });
      }

      setLoadingStep(null);
      setActiveTab('M1'); // default after load
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
      setLoadingStep(null);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const q = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE}/chat`, { question: q });
      setChatHistory(prev => [...prev, { role: 'ai', text: data.answer, sources: data.sources }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'AI service is temporarily unavailable. Please try again.', sources: ['Error'] }]);
    }
    setChatLoading(false);
  };

  // ── Render Tabs ──
  const tabs = [
    { id: 'M1', label: 'M1 · STRUCTURE' },
    { id: 'M2', label: 'M2 · ENTRY POINT' },
    { id: 'M3', label: 'M3 · DEPENDENCIES' },
    { id: 'B1', label: 'B1 · CRITICAL FILES' },
    { id: 'ASK_AI', label: 'ASK AI ✦' },
  ];

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="app-container" style={{ paddingTop: 40, paddingBottom: 60 }}>
        
        {/* DASHBOARD MOCKUP WRAPPER */}
        <div className="ui-mockup">
          {/* TOP NAVBAR */}
          <div className="ui-topbar">
            <div className="ui-topbar-logo">
              ⬡ CodeAura
            </div>
            <input 
              type="text" 
              className="ui-topbar-input" 
              value={repoUrl}
              onChange={e => setRepoUrl(e.target.value)}
              placeholder="https://github.com/expressjs/express"
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            />
            <button className="ui-topbar-btn" disabled={!!loadingStep} onClick={handleAnalyze}>
              {loadingStep ? 'ANALYSING...' : 'ANALYSE →'}
            </button>
          </div>

          <div className="ui-tabs">
            {tabs.map(t => (
              <div 
                key={t.id} 
                className={`ui-tab ${activeTab === t.id ? 'active' : ''}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </div>
            ))}
          </div>

          {loadingStep ? (
             <div style={{ padding: 60, textAlign: 'center' }}>
               <div className="dot" style={{ display: 'inline-block', width: 10, height: 10, background: 'var(--teal)', borderRadius: '50%', animation: 'pulse 1s infinite' }}></div>
               <div className="mono" style={{ color: 'var(--teal)', fontSize: 13, marginTop: 16 }}>{loadingStep}</div>
             </div>
          ) : error ? (
            <div style={{ padding: 40 }}>
              <div style={{ background: 'rgba(255,90,90,0.1)', color: 'var(--red)', padding: 16, borderRadius: 8, fontFamily: 'var(--mono)', fontSize: 12 }}>
                [Error] {error}
              </div>
            </div>
          ) : !structureData ? (
             <div style={{ padding: 100, textAlign: 'center', opacity: 0.5 }}>
                <span style={{ fontSize: 40, color: 'var(--text-dim)' }}>⬡</span>
                <p className="mono" style={{ marginTop: 20, fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ENTER A REPOSITORY URL TO BEGIN INTELLIGENCE EXTRACTION</p>
             </div>
          ) : (
            <div className="ui-body">
              {/* === M1 TAB === */}
              {activeTab === 'M1' && (
                <>
                  <div className="ui-sidebar">
                    <FolderTree folders={structureData.folders} topFiles={structureData.topFiles} />
                  </div>
                  <div className="ui-main">
                    <div className="ui-panel-title">▸ M1 FOLDER INTELLIGENCE REPORT</div>
                    {structureData.folders.map((f, i) => (
                      <div key={i} className="ui-desc">
                        <span className="hl">{f.path}/</span> &mdash; {f.description}
                        {f.classification === 'CRITICAL' && <strong style={{ color: '#e2e8f0', marginLeft: 8 }}>Critical zone.</strong>}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* === M2 TAB === */}
              {activeTab === 'M2' && (
                <>
                  <div className="ui-sidebar">
                    <div className="ui-panel-title" style={{color: 'var(--blue)'}}>ENTRY FILE</div>
                    <div className="ui-tree-item" style={{color: '#8ba8c8', fontWeight: 700, fontSize: 12}}>{entryPoint.entryFile}</div>
                    <div className="ui-panel-title" style={{color: 'var(--text-dim)', marginTop: 24}}>LANGUAGE</div>
                    <div className="ui-tree-item" style={{fontSize: 12}}>{entryPoint.language}</div>
                  </div>
                  <div className="ui-main">
                    <div className="ui-panel-title" style={{color: 'var(--blue)'}}>▸ M2 EXECUTION CHAIN</div>
                    
                    {(!entryPoint.executionChain || entryPoint.executionChain.length === 0) ? (
                      <div className="ui-desc">No local imports found. Cannot trace static chain.</div>
                    ) : (
                      <div style={{ background: '#050709', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)' }}>
                        {entryPoint.executionChain.slice(0, 10).map((chain, i) => (
                          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 8 }}>
                            <span className="mono" style={{ color: 'var(--text-dim)', fontSize: 10 }}>{String(i + 1).padStart(2, '0')}</span>
                            <span className="mono" style={{ color: '#8ba8c8', fontSize: 12 }}>{chain.file}</span>
                          </div>
                        ))}
                        {entryPoint.executionChain.length > 10 && (
                          <div className="mono" style={{ padding: '4px 8px', color: 'var(--text-dim)', fontSize: 10 }}>+ {entryPoint.executionChain.length - 10} more files</div>
                        )}
                      </div>
                    )}

                    <div className="ui-panel-title" style={{color: 'var(--blue)', marginTop: 24}}>▸ EXECUTION FLOW NARRATIVE</div>
                    {Array.isArray(entryPoint.description) ? (
                      <ul style={{ paddingLeft: 20 }}>
                        {entryPoint.description.map((step, i) => (
                          <li key={i} className="ui-desc" style={{marginBottom: 4}}>{step}</li>
                        ))}
                      </ul>
                    ) : (
                      <div className="ui-desc">{entryPoint.description}</div>
                    )}
                  </div>
                </>
              )}

              {/* === M3 TAB === */}
              {activeTab === 'M3' && (
                <>
                  <div className="ui-sidebar">
                    <div className="ui-panel-title" style={{color: '#b57bee'}}>GRAPH STATS</div>
                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
                      {dependencies.nodes?.length || 0}
                    </div>
                    <div className="ui-tree-item" style={{marginLeft: 0, paddingLeft: 0, textTransform: 'uppercase', fontSize: 10}}>Nodes Parsed</div>

                    <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--text)', marginTop: 24 }}>
                      {dependencies.links?.length || 0}
                    </div>
                    <div className="ui-tree-item" style={{marginLeft: 0, paddingLeft: 0, textTransform: 'uppercase', fontSize: 10}}>Graph Edges</div>
                  </div>
                  <div className="ui-main">
                    <div className="ui-panel-title" style={{color: '#b57bee'}}>▸ B3 INTELLIGENCE BRIEF</div>
                    <div className="ui-desc" style={{ whiteSpace: 'pre-wrap' }}>
                      {summary?.content || 'Brief currently unavailable.'}
                    </div>
                  </div>
                </>
              )}

              {/* === B1 TAB === */}
              {activeTab === 'B1' && (
                <>
                  <div className="ui-sidebar">
                    <div className="ui-panel-title" style={{color: 'var(--amber)'}}>METHODOLOGY</div>
                    <p className="ui-desc" style={{fontSize: 12}}>Files are scored based on in-bound dependency links (importedBy) and heuristic folder weights to expose the architectural nucleus.</p>
                  </div>
                  <div className="ui-main">
                    <div className="ui-panel-title" style={{color: 'var(--amber)'}}>▸ TOP CRITICAL FILES</div>
                    <div style={{ display: 'grid', gap: 12 }}>
                      {criticalFiles?.topFiles?.map((f, i) => (
                        <div key={i} style={{ background: 'var(--bg3)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className="mono" style={{ color: 'var(--text)', fontSize: 13 }}>{f.path}</span>
                            <span className="mono" style={{ color: 'var(--amber)', fontSize: 11, fontWeight: 700 }}>{f.score}pts</span>
                          </div>
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            <span style={{ fontSize: 10, padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: 3, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                              x{f.importedBy} imports
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* === ASK AI TAB === */}
              {activeTab === 'ASK_AI' && (
                <div style={{ gridColumn: '1 / -1', padding: '24px 40px', background: 'var(--bg2)', height: '100%' }}>
                  
                  <div style={{ background: '#080b10', border: '1px solid rgba(79,163,255,0.2)', borderRadius: 12, overflow: 'hidden', height: 480, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ background: '#0d1829', borderBottom: '1px solid rgba(79,163,255,0.15)', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 8px var(--teal)' }} />
                      <span className="mono" style={{ fontSize: 11, color: 'var(--text)', fontWeight: 700 }}>RAG EXPERT CHAT</span>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {chatHistory.map((msg, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', gap: 12 }}>
                          <div style={{ 
                            background: msg.role === 'user' ? 'rgba(0,230,170,0.07)' : 'rgba(79,163,255,0.07)',
                            border: `1px solid ${msg.role === 'user' ? 'rgba(0,230,170,0.14)' : 'rgba(79,163,255,0.14)'}`,
                            color: msg.role === 'user' ? 'var(--teal)' : '#94a3b8',
                            padding: '12px 16px',
                            borderRadius: msg.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px',
                            maxWidth: '80%',
                            fontFamily: 'var(--mono)', fontSize: 12, lineHeight: 1.6 
                          }}>
                            {msg.text}
                            {msg.sources && msg.sources.length > 0 && (
                              <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                {msg.sources.map(s => (
                                  <span key={s} style={{ background: 'rgba(79,163,255,0.12)', border: '1px solid rgba(79,163,255,0.2)', borderRadius: 3, padding: '2px 6px', fontSize: 10, color: 'var(--blue)' }}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--mono)' }}>Thinking...</div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(79,163,255,0.1)', display: 'flex', gap: 10 }}>
                      <input 
                        type="text"
                        style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(79,163,255,0.15)', borderRadius: 8, padding: '10px 14px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}
                        placeholder="Ask about authentication, specific components, or code flow..."
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleChat()}
                      />
                      <button 
                        style={{ background: 'var(--blue)', color: '#000', border: 'none', borderRadius: 8, padding: '10px 18px', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        onClick={handleChat}
                        disabled={chatLoading}
                      >
                        SEND
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </>
  );
}
