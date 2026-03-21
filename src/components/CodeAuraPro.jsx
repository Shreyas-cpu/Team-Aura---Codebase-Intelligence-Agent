import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Folder, FolderOpen, File, Search, Play, MessageSquare, Code2, GitBranch, Download, Share2, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * CodeAura Pro - Extended Version with Advanced Features
 * 
 * Features:
 * - Real-time code analysis integration
 * - Export functionality
 * - Share analysis reports
 * - Settings panel
 * - Advanced filtering
 */

export default function CodeAuraPro() {
  const [activeTab, setActiveTab] = useState('m1')
  const [expandedFolders, setExpandedFolders] = useState(new Set(['1', '2']))
  const [selectedItem, setSelectedItem] = useState(null)
  const [githubUrl, setGithubUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
  }

  const handleExport = () => {
    console.log('Exporting analysis report...')
    // Generate and download report
  }

  const handleShare = () => {
    console.log('Sharing analysis...')
    // Copy shareable link
  }

  return (
    <div className="flex flex-col h-screen w-full bg-aura-black text-aura-white font-sans overflow-hidden">
      {/* Header with Enhanced Controls */}
      <header className="bg-aura-black border-b border-aura-border px-6 py-4 flex items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Code2 size={24} className="text-aura-emerald" />
          <span className="text-2xl font-bold tracking-wider" style={{ color: '#00FF9D', textShadow: '0 0 10px rgba(0, 255, 157, 0.3)' }}>
            CodeAura Pro
          </span>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-md">
          <Search size={16} className="absolute left-9 top-1/2 transform -translate-y-1/2 text-aura-gray pointer-events-none" />
          <input
            type="text"
            placeholder="github.com/username/repo"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-aura-dark border border-aura-border rounded text-aura-white text-sm font-mono placeholder-aura-gray focus:outline-none focus:border-aura-emerald focus:ring-1 focus:ring-aura-emerald transition-all"
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className={`px-6 py-2 ${
            isAnalyzing
              ? 'bg-aura-gray text-aura-black'
              : 'bg-aura-emerald text-aura-black hover:shadow-emerald-glow-lg shadow-emerald-glow'
          } font-bold text-sm rounded font-sans transition-all animate-pulse-emerald disabled:animate-none`}
        >
          {isAnalyzing ? 'ANALYZING...' : 'ANALYSE'}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="p-2 text-aura-gray hover:text-aura-emerald hover:bg-aura-dark rounded transition-colors"
            title="Export Report"
          >
            <Download size={20} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-aura-gray hover:text-aura-emerald hover:bg-aura-dark rounded transition-colors"
            title="Share Analysis"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-aura-gray hover:text-aura-emerald hover:bg-aura-dark rounded transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Navigation Tabs with Icon Labels */}
      <nav className="bg-aura-dark border-b border-aura-border px-6 flex items-center gap-8 flex-shrink-0 overflow-x-auto">
        {[
          { id: 'm1', label: 'M1 - STRUCTURE', icon: Folder },
          { id: 'm2', label: 'M2 - ENTRY POINT', icon: Play },
          { id: 'm3', label: 'M3 - DEPENDENCIES', icon: GitBranch },
          { id: 'ai', label: 'ASK AI +', icon: MessageSquare },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`py-4 font-mono text-sm font-semibold transition-all flex items-center gap-2 relative whitespace-nowrap ${
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

      {/* Settings Panel - Slide Over */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-aura-dark border-l border-aura-border z-50 p-6 overflow-y-auto"
          >
            <h2 className="text-lg font-bold text-aura-white mb-4">Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-aura-gray text-sm font-mono block mb-2">Analysis Depth</label>
                <select className="w-full bg-aura-black border border-aura-border rounded text-aura-white text-sm p-2">
                  <option>SURFACE (Fast)</option>
                  <option>INTERMEDIATE (Balanced)</option>
                  <option>DEEP (Thorough)</option>
                </select>
              </div>

              <div>
                <label className="text-aura-gray text-sm font-mono block mb-2">Report Format</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" value="json" className="w-4 h-4" />
                    <span className="text-aura-white text-sm">JSON</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" value="markdown" className="w-4 h-4" />
                    <span className="text-aura-white text-sm">Markdown</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="format" value="html" className="w-4 h-4" />
                    <span className="text-aura-white text-sm">HTML</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-aura-gray text-sm font-mono block mb-2">Theme</label>
                <select className="w-full bg-aura-black border border-aura-border rounded text-aura-white text-sm p-2">
                  <option>Dark (Default)</option>
                  <option>Light</option>
                  <option>High Contrast</option>
                </select>
              </div>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 px-4 py-2 bg-aura-emerald text-aura-black font-bold rounded hover:shadow-emerald-glow transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content with Fade Animation */}
      <div className="flex-1 bg-aura-black overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'm1' && (
            <motion.div
              key="m1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-8"
            >
              <div className="space-y-6">
                <div className="border-l-4 border-aura-emerald pl-4">
                  <h1 className="text-3xl font-bold text-aura-emerald mb-2 font-mono">
                    M1 FOLDER INTELLIGENCE REPORT
                  </h1>
                  <p className="text-aura-gray text-sm">
                    Deep structural analysis of your codebase
                  </p>
                </div>

                {/* Enhanced Stats with Animations */}
                <motion.div
                  className="grid grid-cols-3 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ staggerChildren: 0.1 }}
                >
                  {[
                    { label: 'Total Files', value: 24 },
                    { label: 'Lines of Code', value: '3.2K' },
                    { label: 'Coverage', value: '87%' },
                  ].map((stat, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-aura-dark border border-aura-border rounded p-4 hover:border-aura-emerald hover:shadow-emerald-glow transition-all"
                    >
                      <p className="text-aura-gray text-xs font-mono mb-2">{stat.label}</p>
                      <p className="text-2xl font-bold text-aura-emerald">{stat.value}</p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Additional Content Placeholder */}
                <div className="bg-gradient-emerald border border-aura-emerald/20 rounded-lg p-6 backdrop-blur-sm">
                  <h2 className="text-aura-emerald font-mono font-bold text-lg mb-3">
                    Enhanced Analysis Features
                  </h2>
                  <p className="text-aura-white text-sm mb-4">
                    This pro version includes real-time collaboration, advanced filtering, and AI-powered insights.
                  </p>
                  <div className="flex gap-2">
                    <span className="text-xs bg-aura-emerald/10 text-aura-emerald px-2 py-1 rounded font-mono">
                      ✓ Export to PDF
                    </span>
                    <span className="text-xs bg-aura-emerald/10 text-aura-emerald px-2 py-1 rounded font-mono">
                      ✓ Share Reports
                    </span>
                    <span className="text-xs bg-aura-emerald/10 text-aura-emerald px-2 py-1 rounded font-mono">
                      ✓ Real-time Updates
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Other tab content */}
          {['m2', 'm3', 'ai'].includes(activeTab) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 flex items-center justify-center h-full"
            >
              <div className="text-center">
                <p className="text-aura-gray text-lg">
                  {activeTab === 'm2' && 'M2 - Entry Point Analysis'}
                  {activeTab === 'm3' && 'M3 - Dependency Graph'}
                  {activeTab === 'ai' && 'AI-Powered Insights'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
