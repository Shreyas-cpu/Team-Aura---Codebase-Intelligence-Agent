import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Terminal, FolderGit2, Cpu, GitBranch, MessageSquare, AlertTriangle, CheckCircle2, ChevronRight, Hash, ShieldAlert, Sparkles, Home, Box, Link2, Zap } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import ReactMarkdown from 'react-markdown';

const API_BASE = 'http://localhost:3001/api';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// recursive folder tree component wrapper
function FolderTree({ folders, topFiles }) {
  const sortedFolders = [...(folders || [])].sort((a, b) => a.path.localeCompare(b.path));
  
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text)', marginBottom: 12 }}>
        <FolderGit2 size={16} /> <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>repo_root/</span>
      </div>
      <div style={{ marginLeft: 8, paddingLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
        {sortedFolders.map(f => {
          const depth = (f.path.match(/\//g) || []).length;
          const name = f.path.split('/').pop() || f.path;
          return (
            <div key={f.path} style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: depth * 20, marginTop: 10, marginBottom: 10 }}>
               <FolderGit2 size={14} color={f.classification === 'CRITICAL' ? 'var(--amber)' : 'var(--teal)'} />
               <span className="mono" style={{ color: f.classification === 'CRITICAL' ? 'var(--amber)' : 'var(--teal)', fontSize: 12, fontWeight: f.classification === 'CRITICAL' ? 700 : 400 }}>
                 {name}/
               </span>
               {f.classification === 'CRITICAL' && <span style={{fontSize: 9, color: 'var(--amber)', opacity: 0.6}}>(critical)</span>}
            </div>
          );
        })}
        {topFiles?.map(f => (
          <div key={f.path} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 8 }}>
            <Terminal size={14} color="var(--text-muted)" />
            <span className="mono" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{f.path}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Color map by file extension
function getNodeColor(node) {
  if (node.type === 'external') return '#6b7280'; // gray
  const ext = node.extension;
  if (['.ts', '.tsx'].includes(ext)) return '#b57bee'; // purple
  if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) return '#4fa3ff'; // blue
  if (ext === '.py') return '#00e6aa'; // teal
  if (['.c', '.cpp', '.h', '.hpp'].includes(ext)) return '#f5a623'; // amber
  if (['.java'].includes(ext)) return '#ff6b6b'; // red
  if (ext === '.go') return '#67e8f9'; // cyan
  return '#94a3b8'; // slate
}

// Tiered / Layered Dependency Graph
function DependencyGraphVis({ nodes, edges }) {
  const [hoveredId, setHoveredId] = useState(null);

  if (!nodes || nodes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--text-muted)', fontFamily: 'var(--mono)', fontSize: 12 }}>
        No dependency data available.
      </div>
    );
  }


  // Assign tiers based on importedByCount
  // Tier 0 (top): importedByCount >= highest 33%
  // Tier 1 (mid): importedByCount > 0
  // Tier 2 (bottom): importedByCount === 0 (leaf importers)
  const maxCount = Math.max(...nodes.map(n => n.importedByCount), 1);
  const tierThreshold = Math.ceil(maxCount * 0.33);

  const tier0 = nodes.filter(n => n.importedByCount >= tierThreshold && n.importedByCount > 0);
  const tier1 = nodes.filter(n => n.importedByCount > 0 && n.importedByCount < tierThreshold);
  const tier2 = nodes.filter(n => n.importedByCount === 0);

  const NODE_W = 110;
  const NODE_H = 28;
  const H_GAP = 18;
  const V_GAP = 70;
  const PADDING = 30;

  function layoutTier(tierNodes, y) {
    const totalWidth = tierNodes.length * (NODE_W + H_GAP) - H_GAP;
    return tierNodes.map((n, i) => ({
      ...n,
      x: PADDING + i * (NODE_W + H_GAP),
      y,
      tierWidth: totalWidth
    }));
  }

  const placed0 = layoutTier(tier0, PADDING);
  const placed1 = layoutTier(tier1, PADDING + NODE_H + V_GAP);
  const placed2 = layoutTier(tier2, PADDING + NODE_H + V_GAP * 2 + NODE_H);

  const allPlaced = [...placed0, ...placed1, ...placed2];
  const placedMap = new Map(allPlaced.map(n => [n.id, n]));

  const maxTierWidth = Math.max(
    tier0.length * (NODE_W + H_GAP),
    tier1.length * (NODE_W + H_GAP),
    tier2.length * (NODE_W + H_GAP),
    400
  );
  const svgWidth = maxTierWidth + PADDING * 2;
  const svgHeight = PADDING + NODE_H + V_GAP * 2 + NODE_H + PADDING + 40;

  const hoveredEdges = hoveredId != null
    ? new Set(edges.filter(e => e.source === hoveredId || e.target === hoveredId).map(e => `${e.source}-${e.target}`))
    : null;

  return (
    <div style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: 480, position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 14, padding: '8px 16px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-soft)' }}>
        {[['JS/JSX', '#4fa3ff'], ['TS/TSX', '#b57bee'], ['Python', '#00e6aa'], ['C/C++', '#f5a623'], ['Java', '#ff6b6b'], ['Go', '#67e8f9'], ['External', '#6b7280']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text-muted)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: color, opacity: 0.85 }} />
            {label}
          </div>
        ))}
        {tier0.length > 0 && <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: '#b57bee', marginLeft: 'auto' }}>Top row = most depended-on</div>}
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        style={{ display: 'block' }}
      >
        {/* Arrow marker */}
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="rgba(181,123,238,0.6)" />
          </marker>
          <marker id="arrowhead-hi" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="#b57bee" />
          </marker>
        </defs>

        {/* Tier labels */}
        {tier0.length > 0 && <text x={PADDING} y={PADDING - 8} fill="rgba(181,123,238,0.5)" fontSize={9} fontFamily="var(--mono)" letterSpacing="0.08em">CORE MODULES</text>}
        {tier1.length > 0 && <text x={PADDING} y={PADDING + NODE_H + V_GAP - 8} fill="rgba(255,255,255,0.18)" fontSize={9} fontFamily="var(--mono)" letterSpacing="0.08em">IMPORTERS</text>}
        {tier2.length > 0 && <text x={PADDING} y={PADDING + NODE_H + V_GAP * 2 + NODE_H - 8} fill="rgba(255,255,255,0.1)" fontSize={9} fontFamily="var(--mono)" letterSpacing="0.08em">LEAVES</text>}

        {/* Edges */}
        {edges.map((edge, i) => {
          const src = placedMap.get(edge.source);
          const tgt = placedMap.get(edge.target);
          if (!src || !tgt) return null;
          const key = `${edge.source}-${edge.target}`;
          const isHi = hoveredEdges ? hoveredEdges.has(key) : false;
          const x1 = src.x + NODE_W / 2;
          const y1 = src.y + NODE_H;
          const x2 = tgt.x + NODE_W / 2;
          const y2 = tgt.y;
          // Shorten line so arrowhead doesn't overlap node
          const dx = x2 - x1, dy = y2 - y1;
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const sx = x1 + (dx / len) * 4;
          const ex = x2 - (dx / len) * 8;
          const sy = y1 + (dy / len) * 4;
          const ey = y2 - (dy / len) * 8;
          return (
            <line
              key={i}
              x1={sx} y1={sy} x2={ex} y2={ey}
              stroke={isHi ? 'rgba(181,123,238,0.9)' : 'rgba(181,123,238,0.18)'}
              strokeWidth={isHi ? 1.5 : 0.8}
              markerEnd={isHi ? 'url(#arrowhead-hi)' : 'url(#arrowhead)'}
            />
          );
        })}

        {/* Nodes */}
        {allPlaced.map(node => {
          const color = getNodeColor(node);
          const isHovered = node.id === hoveredId;
          const isRelated = hoveredEdges ? (hoveredEdges.size > 0 && [...hoveredEdges].some(k => k.startsWith(`${node.id}->`) || k.endsWith(`->${node.id}`))) : false;
          const label = node.label.length > 14 ? node.label.slice(0, 12) + '…' : node.label;
          return (
            <g key={node.id}
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHoveredId(node.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {/* Node box */}
              <rect
                x={node.x} y={node.y}
                width={NODE_W} height={NODE_H}
                rx={5} ry={5}
                fill={isHovered ? `${color}22` : 'rgba(10,12,18,0.85)'}
                stroke={isHovered || isRelated ? color : `${color}55`}
                strokeWidth={isHovered ? 1.5 : 0.8}
              />
              {/* Color indicator bar on left */}
              <rect x={node.x} y={node.y} width={4} height={NODE_H} rx={3} fill={color} opacity={0.8} />
              {/* Label */}
              <text
                x={node.x + 12} y={node.y + 17}
                fill={isHovered ? '#ffffff' : 'rgba(255,255,255,0.75)'}
                fontSize={10}
                fontFamily="var(--mono)"
              >
                {label}
              </text>
              {/* importedByCount badge */}
              {node.importedByCount > 0 && (
                <text x={node.x + NODE_W - 5} y={node.y + 17} textAnchor="end" fill={color} fontSize={9} fontFamily="var(--mono)" opacity={0.7}>
                  ×{node.importedByCount}
                </text>
              )}
              {/* Tooltip (title) */}
              <title>{node.path}\nType: {node.type}\nImported by: {node.importedByCount} file(s)</title>
            </g>
          );
        })}
      </svg>
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
                <div style={{ display: 'inline-block', background: 'rgba(79,163,255,0.1)', border: '1px solid rgba(79,163,255,0.2)', padding: '4px 10px', borderRadius: 4, fontFamily: 'var(--mono)', fontSize: 13, color: '#e2e8f0', fontWeight: 700 }}>
                  {entryPoint.entryFile}
                </div>
                
                <div className="ui-panel-title" style={{color: 'var(--blue)', marginTop: 28}}>LANGUAGE</div>
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <span className="feature-tag tag-base">{entryPoint.language}</span>
                </div>
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
            <p className="ui-desc" style={{ marginBottom: 24 }}>Module linkage map showing import relationships between internal files and external packages.</p>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              <div className="card-purple" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: '#b57bee' }}>{dependencies.nodes?.length || 0}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>NODES IN GRAPH</div>
              </div>
              <div className="card-base" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>{dependencies.edges?.length || 0}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>DEPENDENCY EDGES</div>
              </div>
              <div className="card-base" style={{ padding: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)' }}>{dependencies.totalFiles || 0}</div>
                <div className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4, letterSpacing: '0.08em' }}>TOTAL SOURCE FILES</div>
              </div>
            </div>

            {dependencies.capped && (
              <div className="mono" style={{ fontSize: 11, color: '#b57bee', background: 'rgba(181,123,238,0.06)', border: '1px solid rgba(181,123,238,0.15)', borderRadius: 6, padding: '8px 14px' }}>
                ⚠ Graph focuses on top {dependencies.cappedAt} most-imported nodes (out of {dependencies.totalNodes}). Leaf-only isolated files are excluded.
              </div>
            )}

            {/* Graph */}
            <div className="card-base" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="ui-panel-title" style={{ color: '#b57bee', padding: '20px 24px 0' }}>▸ VISUAL DEPENDENCY MAP</div>
              <div style={{ padding: '12px 0 8px' }}>
                <DependencyGraphVis nodes={dependencies.nodes} edges={dependencies.edges} />
              </div>
            </div>

            {/* Node list table */}
            <div className="card-base">
              <div className="ui-panel-title" style={{ color: '#b57bee', marginBottom: 12 }}>▸ NODE DIRECTORY</div>
              <div style={{ display: 'grid', gap: 6, maxHeight: 300, overflowY: 'auto' }}>
                {(dependencies.nodes || []).map((n, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 6, border: '1px solid var(--border-soft)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, background: getNodeColor(n) }} />
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.path}</span>
                    <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'rgba(181,123,238,0.08)', border: '1px solid rgba(181,123,238,0.15)', color: '#b57bee', fontFamily: 'var(--mono)', flexShrink: 0 }}>×{n.importedByCount}</span>
                    {n.type === 'external' && <span style={{ fontSize: 9, color: '#6b7280', fontFamily: 'var(--mono)', flexShrink: 0 }}>ext</span>}
                  </div>
                ))}
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
                  {(Array.isArray(criticalFiles) ? criticalFiles : []).map((f, i) => (
                    <div key={i} style={{ background: 'var(--bg3)', padding: 16, borderRadius: 8, border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="mono" style={{ color: 'var(--text)', fontSize: 13 }}>{f.path}</span>
                        <span className="mono" style={{ color: 'var(--amber)', fontSize: 12, fontWeight: 700 }}>{f.score}pts</span>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        <span style={{ fontSize: 10, padding: '4px 8px', background: 'rgba(255,166,35,0.06)', borderRadius: 4, fontFamily: 'var(--mono)', color: 'var(--amber)' }}>
                          x{f.importedByCount} imports
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
                     {msg.role === 'user' ? (
                       msg.text
                     ) : (
                       <div className="md-body">
                         <ReactMarkdown
                           components={{
                             h1: ({node, ...props}) => <h1 className="md-h1" {...props} />,
                             h2: ({node, ...props}) => <h2 className="md-h2" {...props} />,
                             h3: ({node, ...props}) => <h3 className="md-h3" {...props} />,
                             h4: ({node, ...props}) => <h4 className="md-h4" {...props} />,
                             p:  ({node, ...props}) => <p  className="md-p"  {...props} />,
                             strong: ({node, ...props}) => <strong className="md-strong" {...props} />,
                             em: ({node, ...props}) => <em className="md-em" {...props} />,
                             ul: ({node, ...props}) => <ul className="md-ul" {...props} />,
                             ol: ({node, ...props}) => <ol className="md-ol" {...props} />,
                             li: ({node, ...props}) => <li className="md-li" {...props} />,
                             code: ({node, inline, className, children, ...props}) =>
                               inline
                                 ? <code className="md-inline-code" {...props}>{children}</code>
                                 : <pre className="md-pre"><code className="md-code" {...props}>{children}</code></pre>,
                             blockquote: ({node, ...props}) => <blockquote className="md-blockquote" {...props} />,
                             hr: () => <hr className="md-hr" />,
                             a: ({node, ...props}) => <a className="md-a" target="_blank" rel="noreferrer" {...props} />,
                           }}
                         >
                           {msg.text}
                         </ReactMarkdown>
                       </div>
                     )}
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
