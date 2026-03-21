import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Terminal, FolderGit2, Cpu, GitBranch, MessageSquare, AlertTriangle, CheckCircle2, ChevronRight, Hash, ShieldAlert, Sparkles, Home, Box, Link2, Zap } from 'lucide-react';
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
  const [currentView, setCurrentView] = useState('HOME');

  // Internal Session State
  const [currentLocalPath, setCurrentLocalPath] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState('');

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
  }, [chatHistory, currentView]);

  const handleAnalyze = async () => {
    if (!repoUrl) return;
    try {
      setError(null);
      setStructureData(null); setEntryPoint(null); setDependencies(null); setCriticalFiles(null); setSummary(null);
      
      setLoadingStep('Cloning repository...');
      setCurrentView('SUMMARY');
      const { data: cloneData } = await axios.post(`${API_BASE}/clone`, { repoUrl });
      const localPath = cloneData.localPath;
      const sessionId = cloneData.sessionId;
      setCurrentLocalPath(localPath);
      setCurrentSessionId(sessionId);

      setLoadingStep('M1: Analyzing Folder Structure...');
      const { data: st } = await axios.post(`${API_BASE}/analyze/structure`, { localPath });
      setStructureData(st.data);

      setLoadingStep('M2: Detecting Entry Point & Flow...');
      const { data: ep } = await axios.post(`${API_BASE}/analyze/entrypoint`, { localPath });
      setEntryPoint(ep.data);

      setLoadingStep('M3: Mapping Dependency Graph...');
      const { data: dep } = await axios.post(`${API_BASE}/analyze/dependencies`, { localPath });
      setDependencies(dep.data);

      setLoadingStep('B1: Scoring Critical Files...');
      const { data: b1 } = await axios.post(`${API_BASE}/analyze/critical`, { localPath });
      setCriticalFiles(b1.data);

      setLoadingStep('B3: Generating AI Summary...');
      try {
        const { data: sum } = await axios.post(`${API_BASE}/analyze/summary`, { localPath });
        setSummary(sum.data);
      } catch (e) {
        setSummary({ content: 'Summary generation failed — AI service temporarily unavailable.' });
      }

      setLoadingStep(null);
      setCurrentView('SUMMARY'); // default after load
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || err.message);
      setLoadingStep(null);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || !currentSessionId || !currentLocalPath) return;
    const q = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: q }]);
    setChatLoading(true);

    try {
      const payload = { sessionId: currentSessionId, localPath: currentLocalPath, message: q };
      const { data } = await axios.post(`${API_BASE}/chat`, payload);
      setChatHistory(prev => [...prev, { role: 'ai', text: data.data.answer, sources: data.data.sources }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'ai', text: 'AI service is temporarily unavailable. Please try again.', sources: ['Error'] }]);
    }
    setChatLoading(false);
  };

  const renderContent = () => {
    if (loadingStep) {
      let perc = 10;
      if (loadingStep.includes('M1')) perc = 30;
      else if (loadingStep.includes('M2')) perc = 50;
      else if (loadingStep.includes('M3')) perc = 70;
      else if (loadingStep.includes('B1')) perc = 85;
      else if (loadingStep.includes('B3')) perc = 95;

      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div className="card-base" style={{ width: '100%', maxWidth: 460, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'var(--teal)', animation: 'scan 2s linear infinite', opacity: 0.5 }} />
            
            <div className="ui-panel-title" style={{ color: 'var(--teal)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Terminal size={14} /> INTELLIGENCE EXTRACTION
            </div>
            
            <div className="mono" style={{ fontSize: 12, color: 'var(--text)', marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
              <span>{loadingStep}</span>
              <span style={{ color: 'var(--teal)' }}>{perc}%</span>
            </div>
            
            <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
               <div style={{ width: `${perc}%`, height: '100%', background: 'var(--teal)', transition: 'width 0.4s ease', boxShadow: '0 0 10px rgba(0,230,170,0.5)' }} />
            </div>

            <div className="mono" style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 24, borderTop: '1px dashed var(--border)', paddingTop: 16 }}>
              Mapping architectural zones and dependency graphs...
            </div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{ padding: 40 }}>
          <div className="card-red">
            <h3 style={{ color: 'var(--red)', marginBottom: 8 }}>Analysis Failed</h3>
            <p className="mono" style={{ fontSize: 12, color: 'var(--red)' }}>[Error] {error}</p>
          </div>
        </div>
      );
    }

    if (!structureData && currentView !== 'HOME') {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5, minHeight: 400 }}>
           <span style={{ fontSize: 40, color: 'var(--text-dim)' }}>⬡</span>
           <p className="mono" style={{ marginTop: 20, fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ENTER A REPOSITORY URL TO BEGIN</p>
        </div>
      );
    }

    switch(currentView) {
      case 'SUMMARY':
        return (
          <div className="animate-fade-up">
            <h2 style={{ marginBottom: 24, fontSize: 28 }}>Repository Overview</h2>
            <div className="card-blue" style={{ marginBottom: 40 }}>
              <div className="feature-tag tag-blue">◈ AI SUMMARY</div>
              
              {!summary ? (
                <p className="ui-desc" style={{ color: '#c8d8e8', fontSize: 13 }}>Intelligence brief currently unavailable.</p>
              ) : summary.content ? (
                /* Fallback if backend does return 'content' */
                <p className="ui-desc" style={{ whiteSpace: 'pre-wrap', color: '#c8d8e8', fontSize: 13, lineHeight: 1.8 }}>
                  {summary.content}
                </p>
              ) : (
                /* Structured display */
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p className="ui-desc" style={{ color: '#c8d8e8', fontSize: 14, fontWeight: 600, borderLeft: '2px solid var(--blue)', paddingLeft: 12, background: 'rgba(79,163,255,0.05)', padding: '10px 12px', borderTopRightRadius: 6, borderBottomRightRadius: 6 }}>
                    {summary.oneLineSummary}
                  </p>
                  
                  <div className="grid-2" style={{ gap: 16, marginTop: 8 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--blue)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>ARCHITECTURE STYLE</div>
                      <div className="ui-desc" style={{ color: '#e2e8f0', fontSize: 13 }}>{summary.architectureStyle || 'Unknown'}</div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--blue)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>TECH STACK</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(summary.techStack || []).length > 0 ? summary.techStack.map(t => (
                          <span key={t} style={{ background: 'rgba(79,163,255,0.1)', border: '1px solid rgba(79,163,255,0.2)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--mono)', color: '#8ba8c8' }}>{t}</span>
                        )) : <span className="ui-desc">None detected</span>}
                      </div>
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: 16, marginTop: 8 }}>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--blue)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>DESIGN PATTERNS</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {(summary.designPatterns || []).length > 0 ? summary.designPatterns.map(p => (
                          <span key={p} style={{ background: 'rgba(79,163,255,0.05)', border: '1px dashed rgba(79,163,255,0.3)', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--mono)', color: '#8ba8c8' }}>{p}</span>
                        )) : <span className="ui-desc">None detected</span>}
                      </div>
                    </div>
                    <div>
                      <div className="mono" style={{ fontSize: 10, color: 'var(--blue)', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>QUALITY SIGNALS</div>
                      <ul style={{ margin: 0, paddingLeft: 18, color: '#e2e8f0', fontSize: 12, lineHeight: 1.6 }}>
                         {(summary.qualitySignals || []).length > 0 ? summary.qualitySignals.map((s, i) => (
                           <li key={i}>{s}</li>
                         )) : <li>None detected</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <h3 style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14, letterSpacing: '0.05em' }}>EXPLORE MODULES</h3>
            <div className="grid-2">
              <div className="card-base cursor-pointer hover:border-teal/30" onClick={() => setCurrentView('M1')}>
                <div className="feature-tag tag-teal">M1 · STRUCTURE</div>
                <h3 style={{ marginBottom: 8 }}>Folder Intelligence (M1)</h3>
                <p className="ui-desc" style={{ fontSize: 13, margin: 0 }}>Examine the architectural layout and critical zones of the repository.</p>
              </div>
              <div className="card-base cursor-pointer hover:border-blue/30" onClick={() => setCurrentView('M2')}>
                <div className="feature-tag tag-blue">M2 · ENTRY POINT</div>
                <h3 style={{ marginBottom: 8 }}>Execution Chain (M2)</h3>
                <p className="ui-desc" style={{ fontSize: 13, margin: 0 }}>Identify primary entry files and trace the initial execution flow.</p>
              </div>
              <div className="card-base cursor-pointer hover:border-purple/30" onClick={() => setCurrentView('M3')}>
                <div className="feature-tag tag-purple">M3 · DEPENDENCIES</div>
                <h3 style={{ marginBottom: 8 }}>Dependency Graph (M3)</h3>
                <p className="ui-desc" style={{ fontSize: 13, margin: 0 }}>Visualize module linkages and internal dependency metrics.</p>
              </div>
              <div className="card-base cursor-pointer hover:border-amber/30" onClick={() => setCurrentView('BONUS')}>
                <div className="feature-tag tag-amber">B1 · BONUS</div>
                <h3 style={{ marginBottom: 8 }}>Critical Files (Bonus)</h3>
                <p className="ui-desc" style={{ fontSize: 13, margin: 0 }}>Discover files ranked by incoming dependencies and architectural weight.</p>
              </div>
            </div>
          </div>
        );
      
      case 'M1':
        return (
          <div className="animate-fade-right" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Folder Intelligence (M1)</h2>
            <p className="ui-desc" style={{ marginBottom: 24 }}>Analyzed folder structure with critical path highlights.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 24 }}>
              <div className="card-base" style={{ padding: '20px 16px', maxHeight: '600px', overflowY: 'auto' }}>
                <FolderTree folders={structureData.folders} topFiles={structureData.topFiles} />
              </div>
              <div className="card-base" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                 <div className="ui-panel-title">▸ FOLDER INTELLIGENCE REPORT</div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                   {structureData.folders.map((f, i) => (
                      <div key={i} style={{ 
                          background: 'var(--bg3)', 
                          border: f.classification === 'CRITICAL' ? '1px solid rgba(245,166,35,0.3)' : '1px solid var(--border-soft)', 
                          borderRadius: 8, 
                          padding: 16 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FolderGit2 size={16} color={f.classification === 'CRITICAL' ? 'var(--amber)' : 'var(--teal)'} />
                                <span className="mono" style={{ color: 'var(--text)', fontSize: 13, fontWeight: 700 }}>{f.path}/</span>
                            </div>
                            {f.classification === 'CRITICAL' && (
                                <span style={{ fontSize: 9, padding: '3px 8px', background: 'rgba(245,166,35,0.1)', border: '1px solid rgba(245,166,35,0.2)', borderRadius: 4, fontFamily: 'var(--mono)', color: 'var(--amber)', letterSpacing: '0.05em', fontWeight: 700 }}>
                                  CRITICAL ZONE
                                </span>
                            )}
                        </div>
                        <p className="ui-desc" style={{ fontSize: 13, margin: 0, lineHeight: 1.6 }}>{f.description}</p>
                      </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        );

      case 'M2':
        return (
          <div className="animate-fade-right" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Execution Chain (M2)</h2>
            <p className="ui-desc" style={{ marginBottom: 24 }}>Primary entry file and static execution trace.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 24 }}>
              <div className="card-blue" style={{ padding: 24 }}>
                <div className="ui-panel-title" style={{color: 'var(--blue)'}}>ENTRY FILE</div>
                <div className="ui-tree-item" style={{color: '#8ba8c8', fontWeight: 700, fontSize: 13}}>{entryPoint.entryFile}</div>
                <div className="ui-panel-title" style={{color: 'var(--text-dim)', marginTop: 24}}>LANGUAGE</div>
                <div className="ui-tree-item" style={{fontSize: 13}}>{entryPoint.language}</div>
              </div>
              <div className="card-base">
                <div className="ui-panel-title" style={{color: 'var(--blue)'}}>▸ EXECUTION CHAIN</div>
                {(!entryPoint.executionChain || entryPoint.executionChain.length === 0) ? (
                  <div className="ui-desc">No local imports found. Cannot trace static chain.</div>
                ) : (
                  <div style={{ background: '#050709', padding: 16, borderRadius: 8, border: '1px solid var(--border-soft)', marginBottom: 24 }}>
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
                <div className="ui-panel-title" style={{color: 'var(--blue)'}}>▸ EXECUTION FLOW NARRATIVE</div>
                {Array.isArray(entryPoint.description) ? (
                  <ul style={{ paddingLeft: 20 }}>
                    {entryPoint.description.map((step, i) => (
                      <li key={i} className="ui-desc" style={{marginBottom: 8}}>{step}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="ui-desc">{entryPoint.description}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 'M3':
        return (
          <div className="animate-fade-right" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Dependency Graph (M3)</h2>
            <p className="ui-desc" style={{ marginBottom: 24 }}>Module linkage statistics and broad intelligence brief.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 24 }}>
              <div className="card-purple" style={{ padding: 24 }}>
                <div className="ui-panel-title" style={{color: '#b57bee'}}>GRAPH STATS</div>
                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginTop: 8 }}>
                  {dependencies.nodes?.length || 0}
                </div>
                <div className="ui-tree-item" style={{marginLeft: 0, paddingLeft: 0, textTransform: 'uppercase', fontSize: 10}}>Nodes Parsed</div>

                <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--text)', marginTop: 32 }}>
                  {dependencies.links?.length || 0}
                </div>
                <div className="ui-tree-item" style={{marginLeft: 0, paddingLeft: 0, textTransform: 'uppercase', fontSize: 10}}>Graph Edges</div>
              </div>
              <div className="card-base">
                <div className="ui-panel-title" style={{color: '#b57bee'}}>▸ INTELLIGENCE BRIEF</div>
                <div className="ui-desc" style={{ whiteSpace: 'pre-wrap' }}>
                  {summary?.content || 'Brief currently unavailable.'}
                </div>
              </div>
            </div>
          </div>
        );

      case 'BONUS':
        return (
          <div className="animate-fade-right" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Bonus Features</h2>
            <p className="ui-desc" style={{ marginBottom: 24 }}>Additional metrics, rankings, and deep-dive analytics.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 24 }}>
              <div className="card-amber" style={{ padding: 24 }}>
                <div className="ui-panel-title" style={{color: 'var(--amber)'}}>METHODOLOGY</div>
                <p className="ui-desc" style={{fontSize: 13, lineHeight: 1.6}}>Files are scored based on in-bound dependency links (importedBy) and heuristic folder weights to expose the architectural nucleus.</p>
              </div>
              <div className="card-base">
                <div className="ui-panel-title" style={{color: 'var(--amber)'}}>▸ TOP CRITICAL FILES (B1)</div>
                <div style={{ display: 'grid', gap: 12 }}>
                  {criticalFiles?.topFiles?.map((f, i) => (
                    <div key={i} style={{ background: 'var(--bg3)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ color: 'var(--text)', fontSize: 13 }}>{f.path}</span>
                        <span className="mono" style={{ color: 'var(--amber)', fontSize: 12, fontWeight: 700 }}>{f.score}pts</span>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 10, padding: '4px 8px', background: 'rgba(255,166,35,0.06)', borderRadius: 4, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
                          x{f.importedBy} imports
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'ASK_AI':
        return (
          <div className="animate-fade-up chat-wrapper">
             <div className="chat-header">
               <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--teal)', boxShadow: '0 0 10px var(--teal)' }} />
               <span className="mono" style={{ fontSize: 12, color: 'var(--text)', fontWeight: 700, letterSpacing: '0.05em' }}>RAG EXPERT CHAT</span>
             </div>
             
             <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
               {chatHistory.map((msg, i) => (
                 <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                   <div className={msg.role === 'user' ? 'chat-msg-user' : 'chat-msg-ai'}>
                     {msg.text}
                     {msg.sources && msg.sources.length > 0 && (
                       <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                         {msg.sources.map(s => (
                           <span key={s} style={{ background: 'rgba(79,163,255,0.12)', border: '1px solid rgba(79,163,255,0.2)', borderRadius: 4, padding: '3px 8px', fontSize: 10, color: 'var(--blue)' }}>
                             {s}
                           </span>
                         ))}
                       </div>
                     )}
                   </div>
                 </div>
               ))}
               {chatLoading && (
                 <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--mono)', paddingLeft: 4 }}>Thinking...</div>
               )}
               <div ref={chatEndRef} />
             </div>

             <div className="chat-input-bar">
               <input 
                  type="text"
                  className="input-text"
                  placeholder="Ask about authentication, specific components, or code flow..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                />
                <button 
                  className="btn-primary"
                  onClick={handleChat}
                  disabled={chatLoading}
                >
                  SEND
                </button>
             </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ----- MAIN RENDER -----
  
  if (currentView === 'HOME') {
    return (
      <>
        <div className="orb orb-1"></div>
        <div className="orb orb-2"></div>
        <div className="orb orb-3"></div>
        
        <div className="app-container">
          <div className="hero-section animate-fade-up">
             <div className="eyebrow">CODEAURA · INTELLIGENCE ENGINE</div>
             <h1 style={{ marginBottom: 12 }}>Codebase<span className="accent"> Intelligence</span> Agent</h1>
             <p className="mono" style={{ color: 'var(--text-dim)', fontSize: 14, letterSpacing: '0.05em', fontWeight: 700 }}>by CodeAura</p>
             
             <p className="tagline" style={{ maxWidth: 600, fontSize: 16, marginTop: 24, lineHeight: 1.8 }}>
               AI-powered codebase analysis, architectural insights, and dependency mapping. Extrapolate intelligence instantly.
             </p>

             <div className="hero-input-area">
                <input 
                  type="text" 
                  className="input-text"
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  placeholder="Paste repository URL (e.g. https://github.com/expressjs/express)"
                  onKeyDown={e => { if (e.key === 'Enter') handleAnalyze(); }}
                  style={{ width: '100%', maxWidth: 450 }}
                />
                <button className="btn-primary" onClick={handleAnalyze} disabled={!!loadingStep} style={{ padding: '12px 24px', fontSize: 13 }}>
                  {loadingStep ? 'ANALYZING...' : 'ANALYZE REPO →'}
                </button>
             </div>
             
             <p className="mono" style={{ marginTop: 64, color: 'var(--text-dim)', fontSize: 12, fontStyle: 'italic' }}>
               "Unlock the blueprint of any codebase."
             </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>

      <div className="app-container" style={{ padding: '40px 32px' }}>
         <div className="ui-mockup-wrapper">
            
            <div className="ui-topbar">
              <div className="ui-topbar-logo" onClick={() => setCurrentView('HOME')}>
                ⬡ CodeAura <span style={{ color: 'var(--text-muted)', fontSize: 14, fontWeight: 400 }}>· Intelligence Agent</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="text" 
                  className="input-text" 
                  value={repoUrl}
                  onChange={e => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                  style={{ padding: '6px 14px', width: 260 }}
                />
                <button className="btn-primary" disabled={!!loadingStep} onClick={handleAnalyze}>
                  {loadingStep ? 'ANALYSING...' : 'RE-ANALYZE'}
                </button>
              </div>
            </div>

            <div className="ui-dashboard">
               
               <div className="ui-sidebar-nav">
                  <div className="nav-group-label">General</div>
                  <div className={`nav-item ${currentView === 'SUMMARY' ? 'active' : ''}`} onClick={() => setCurrentView('SUMMARY')}>
                    <Home size={16} /> Overview
                  </div>
                  
                  <div className="nav-group-label">Intelligence</div>
                  <div className={`nav-item ${currentView === 'M1' ? 'active' : ''}`} onClick={() => setCurrentView('M1')}>
                    <FolderGit2 size={16} /> Folder Struct (M1)
                  </div>
                  <div className={`nav-item ${currentView === 'M2' ? 'active' : ''}`} onClick={() => setCurrentView('M2')}>
                    <Terminal size={16} /> Entry Point (M2)
                  </div>
                  <div className={`nav-item ${currentView === 'M3' ? 'active' : ''}`} onClick={() => setCurrentView('M3')}>
                    <GitBranch size={16} /> Dependencies (M3)
                  </div>
                  
                  <div className="nav-group-label">Advanced</div>
                  <div className={`nav-item ${currentView === 'BONUS' ? 'active' : ''}`} onClick={() => setCurrentView('BONUS')}>
                    <Sparkles size={16} /> Bonus Features
                  </div>
                  <div className={`nav-item ${currentView === 'ASK_AI' ? 'active' : ''}`} onClick={() => setCurrentView('ASK_AI')}>
                    <MessageSquare size={16} /> AI Chat
                  </div>
               </div>

               <div className="ui-main-content">
                 {renderContent()}
               </div>
               
            </div>

         </div>
      </div>
    </>
  );
}
