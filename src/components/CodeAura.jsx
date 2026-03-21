import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, Search, Play, MessageSquare, Code2, GitBranch } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Mock folder structure
const mockFolderStructure = [
  {
    id: '1',
    name: 'lib',
    type: 'folder',
    critical: true,
    children: [
      { id: '1-1', name: 'api.js', type: 'file' },
      { id: '1-2', name: 'utils.js', type: 'file' },
    ]
  },
  {
    id: '2',
    name: 'middleware',
    type: 'folder',
    critical: true,
    children: [
      { id: '2-1', name: 'auth.js', type: 'file' },
      { id: '2-2', name: 'logger.js', type: 'file' },
    ]
  },
  {
    id: '3',
    name: 'components',
    type: 'folder',
    critical: false,
    children: [
      { id: '3-1', name: 'Header.jsx', type: 'file' },
      { id: '3-2', name: 'Footer.jsx', type: 'file' },
    ]
  },
  {
    id: '4',
    name: 'public',
    type: 'folder',
    critical: false,
    children: [
      { id: '4-1', name: 'index.html', type: 'file' },
    ]
  },
]

// Mock M1 Report Data
const m1ReportData = {
  name: 'lib',
  purpose: 'Core business logic and API integrations',
  type: 'Critical Core Library',
  description: 'Houses essential utilities and API interaction layers that form the backbone of the application.',
  stats: {
    files: 24,
    lines: 3482,
    complexity: 'HIGH',
    coverage: 87,
  },
  dependencies: [
    { name: 'express', version: '4.18.0', type: 'production' },
    { name: 'axios', version: '1.4.0', type: 'production' },
    { name: 'dotenv', version: '16.0.3', type: 'production' },
  ],
  keyFunctions: [
    'fetchUserData() - Retrieves user information from external API',
    'processPayment() - Handles payment processing and validation',
    'logActivity() - Logs user activity for analytics',
    'validateToken() - JWT token validation',
  ],
}

export default function CodeAura() {
  const [activeTab, setActiveTab] = useState('m1')
  const [expandedFolders, setExpandedFolders] = useState(new Set(['1', '2', '3', '4']))
  const [selectedItem, setSelectedItem] = useState(null)
  const [githubUrl, setGithubUrl] = useState('')

  const toggleFolder = (id) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedFolders(newExpanded)
  }

  const renderTreeItem = (item, depth = 0) => {
    const isCritical = item.critical
    const isExpanded = expandedFolders.has(item.id)

    return (
      <div key={item.id}>
        <div className="flex items-center gap-1" style={{ paddingLeft: `${depth * 16}px` }}>
          {item.type === 'folder' ? (
            <>
              <button
                onClick={() => toggleFolder(item.id)}
                className="p-0 hover:bg-aura-dark rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown size={16} className="text-aura-emerald" />
                ) : (
                  <ChevronRight size={16} className="text-aura-gray" />
                )}
              </button>
              {isExpanded ? (
                <FolderOpen size={16} className={isCritical ? 'text-aura-emerald' : 'text-aura-gray'} />
              ) : (
                <Folder size={16} className={isCritical ? 'text-aura-emerald' : 'text-aura-gray'} />
              )}
              <span
                onClick={() => setSelectedItem(item)}
                className={`cursor-pointer font-mono text-sm transition-colors whitespace-nowrap ${
                  isCritical
                    ? 'text-aura-emerald hover:text-aura-emerald font-semibold'
                    : 'text-aura-white hover:text-aura-emerald'
                } ${selectedItem?.id === item.id ? 'bg-gradient-emerald px-2 py-1 rounded' : 'hover:bg-aura-dark px-2 py-1 rounded'}`}
              >
                {item.name}
              </span>
            </>
          ) : (
            <>
              <ChevronRight size={16} className="text-transparent" />
              <File size={16} className="text-aura-gray" />
              <span
                onClick={() => setSelectedItem(item)}
                className={`cursor-pointer font-mono text-xs transition-colors ${
                  selectedItem?.id === item.id
                    ? 'text-aura-emerald bg-gradient-emerald px-2 py-1 rounded'
                    : 'text-aura-gray hover:text-aura-white px-2 py-1 rounded hover:bg-aura-dark'
                }`}
              >
                {item.name}
              </span>
            </>
          )}
        </div>
        {item.children && isExpanded && (
          <div>
            {item.children.map((child) => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen w-full bg-aura-black text-aura-white font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-aura-black border-b border-aura-border px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code2 size={24} className="text-aura-emerald" />
            <span className="text-2xl font-bold tracking-wider" style={{ color: '#00FF9D', textShadow: '0 0 10px rgba(0, 255, 157, 0.3)' }}>
              CodeAura
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-aura-gray" />
            <input
              type="text"
              placeholder="github.com/username/repo"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-aura-dark border border-aura-border rounded text-aura-white text-sm font-mono placeholder-aura-gray focus:outline-none focus:border-aura-emerald focus:ring-1 focus:ring-aura-emerald transition-all"
            />
          </div>
          <button className="px-6 py-2 bg-aura-emerald text-aura-black font-bold text-sm rounded font-sans transition-all hover:shadow-emerald-glow-lg shadow-emerald-glow animate-pulse-emerald">
            ANALYSE
          </button>
        </div>

        <GitBranch size={20} className="text-aura-gray" />
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-aura-dark border-b border-aura-border px-6 flex items-center gap-8 flex-shrink-0">
        {[
          { id: 'm1', label: 'M1 - STRUCTURE', icon: Folder },
          { id: 'm2', label: 'M2 - ENTRY POINT', icon: Play },
          { id: 'm3', label: 'M3 - DEPENDENCIES', icon: GitBranch },
          { id: 'ai', label: 'ASK AI +', icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-4 font-mono text-sm font-semibold transition-all flex items-center gap-2 relative ${
              activeTab === id
                ? 'text-aura-emerald'
                : 'text-aura-gray hover:text-aura-white'
            }`}
          >
            <Icon size={16} />
            {label}
            {activeTab === id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-1 bg-aura-emerald"
                layoutId="underline"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden gap-0">
        {/* Left Sidebar - File Explorer */}
        <div className="w-80 bg-aura-black border-r border-aura-border p-4 overflow-y-auto flex-shrink-0">
          <div className="mb-4">
            <h3 className="text-aura-emerald font-mono font-bold text-sm mb-3 flex items-center gap-2">
              <Folder size={16} />
              Project Structure
            </h3>
          </div>
          <div className="space-y-1 font-mono text-sm">
            {mockFolderStructure.map((item) => renderTreeItem(item))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-aura-black overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'm1' && (
              <motion.div
                key="m1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8"
              >
                {/* M1 Folder Intelligence Report */}
                <div className="space-y-6">
                  {/* Header */}
                  <div className="border-l-4 border-aura-emerald pl-4">
                    <h1 className="text-3xl font-bold text-aura-emerald mb-2 font-mono">
                      M1 FOLDER INTELLIGENCE REPORT
                    </h1>
                    <p className="text-aura-gray text-sm">
                      Deep structural analysis of your codebase
                    </p>
                  </div>

                  {/* Report Cards */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'Total Files', value: m1ReportData.stats.files, unit: '' },
                      { label: 'Lines of Code', value: m1ReportData.stats.lines, unit: '' },
                      { label: 'Coverage', value: m1ReportData.stats.coverage, unit: '%' },
                    ].map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-aura-dark border border-aura-border rounded p-4 hover:border-aura-emerald transition-colors"
                      >
                        <p className="text-aura-gray text-xs font-mono mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold text-aura-emerald">
                          {stat.value}
                          {stat.unit}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Folder Overview */}
                  <div className="bg-gradient-emerald border border-aura-emerald/20 rounded-lg p-6 backdrop-blur-sm">
                    <h2 className="text-aura-emerald font-mono font-bold text-lg mb-3">
                      {m1ReportData.name}/ (CRITICAL CORE)
                    </h2>
                    <p className="text-aura-white mb-4 text-sm leading-relaxed">
                      {m1ReportData.description}
                    </p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-aura-emerald font-mono">complexity: <span className="font-bold">{m1ReportData.stats.complexity}</span></span>
                      <span className="text-aura-gray">●</span>
                      <span className="text-aura-gray">Type: <span className="text-aura-white font-mono">{m1ReportData.type}</span></span>
                    </div>
                  </div>

                  {/* Dependencies Section */}
                  <div className="border border-aura-border rounded-lg p-6 bg-aura-dark/50">
                    <h3 className="text-aura-emerald font-mono font-bold mb-4 flex items-center gap-2">
                      <GitBranch size={16} />
                      Key Dependencies
                    </h3>
                    <div className="space-y-3">
                      {m1ReportData.dependencies.map((dep, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-aura-black/50 border border-aura-border/50 rounded hover:border-aura-emerald transition-colors"
                        >
                          <span className="text-aura-white font-mono text-sm">{dep.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-aura-gray text-xs">{dep.version}</span>
                            <span className={`text-xs font-mono px-2 py-1 rounded ${
                              dep.type === 'production'
                                ? 'bg-aura-emerald/10 text-aura-emerald'
                                : 'bg-aura-border text-aura-gray'
                            }`}>
                              {dep.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Functions */}
                  <div className="border border-aura-border rounded-lg p-6 bg-aura-dark/50">
                    <h3 className="text-aura-emerald font-mono font-bold mb-4 flex items-center gap-2">
                      <Code2 size={16} />
                      Key Functions & Utilities
                    </h3>
                    <div className="space-y-2">
                      {m1ReportData.keyFunctions.map((func, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3 rounded hover:bg-aura-black/50 transition-colors"
                        >
                          <span className="text-aura-emerald font-mono text-lg mt-0">▸</span>
                          <span className="text-aura-gray text-sm font-mono">{func}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Terminal Output */}
                  <div className="bg-aura-black border border-aura-border rounded-lg p-4 font-mono text-xs overflow-x-auto">
                    <p className="text-aura-gray mb-2"># Analysis Terminal Output</p>
                    <p className="text-aura-emerald">$ analyze-structure --depth=3</p>
                    <p className="text-aura-gray mt-2">✓ Scanned {m1ReportData.stats.files} files</p>
                    <p className="text-aura-gray">✓ Identified {m1ReportData.dependencies.length} dependencies</p>
                    <p className="text-aura-gray">✓ Complexity score: HIGH</p>
                    <p className="text-aura-emerald mt-2">Done in 2.34s</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'm2' && (
              <motion.div
                key="m2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 flex items-center justify-center"
              >
                <div className="text-center">
                  <Play size={48} className="text-aura-emerald mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-aura-white mb-2 font-mono">M2 - ENTRY POINT ANALYSIS</h2>
                  <p className="text-aura-gray">Execution flow and entry point visualization coming soon...</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'm3' && (
              <motion.div
                key="m3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 flex items-center justify-center"
              >
                <div className="text-center">
                  <GitBranch size={48} className="text-aura-emerald mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-aura-white mb-2 font-mono">M3 - DEPENDENCY GRAPH</h2>
                  <p className="text-aura-gray">Interactive dependency visualization coming soon...</p>
                </div>
              </motion.div>
            )}

            {activeTab === 'ai' && (
              <motion.div
                key="ai"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-8 flex items-center justify-center"
              >
                <div className="text-center">
                  <MessageSquare size={48} className="text-aura-emerald mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-aura-white mb-2 font-mono">ASK AI + CHAT</h2>
                  <p className="text-aura-gray">AI-powered code insights and chat interface coming soon...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
