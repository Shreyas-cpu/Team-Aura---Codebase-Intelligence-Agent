import { create } from 'zustand'

export const useAppStore = create((set) => ({
  // App Flow State
  appStage: 'landing', // 'landing' | 'loading' | 'dashboard'
  
  // Input State
  repositoryUrl: '',
  analysisDepth: 'intermediate', // 'surface' | 'intermediate' | 'deep'
  
  // Loading State
  loadingLogs: [],
  loadingProgress: 0, // 0-100
  isAnalyzing: false,
  
  // Analysis Data
  projectData: null,
  folderTree: {},
  fileMetadata: {},
  executionFlow: [],
  dependencyGraph: { nodes: [], links: [] },
  keyFunctions: [
    {
      name: 'authenticateUser',
      file: 'src/auth/authService.js',
      description: 'Checks JWT, applies roles/permissions, sets session state.',
      complexity: 'High',
      snippet: 'const user = await getUserByToken(token);',
    },
    {
      name: 'calculateRiskScore',
      file: 'src/security/risk.js',
      description: 'Evaluates cross-service dependencies and scoring for each endpoint.',
      complexity: 'Medium',
      snippet: 'const score = evaluatePaths(deps, metrics);',
    },
  ],
  
  // UI State
  selectedFile: null,
  selectedView: 'dependency', // 'timeline' | 'dependency'
  chatMessages: [],
  insights: null,
  
  // Actions
  setAppStage: (stage) => set({ appStage: stage }),
  
  setRepositoryUrl: (url) => set({ repositoryUrl: url }),
  
  setAnalysisDepth: (depth) => set({ analysisDepth: depth }),
  
  startAnalysis: (url, depth) =>
    set({
      repositoryUrl: url,
      analysisDepth: depth,
      appStage: 'loading',
      isAnalyzing: true,
      loadingLogs: [],
      loadingProgress: 0,
    }),
  
  addLog: (message) =>
    set((state) => ({
      loadingLogs: [...state.loadingLogs, { message, timestamp: new Date() }],
    })),
  
  updateProgress: (progress) => set({ loadingProgress: Math.min(progress, 100) }),
  
  completeAnalysis: (data) =>
    set({
      projectData: data,
      folderTree: data.folderTree || {},
      fileMetadata: data.fileMetadata || {},
      executionFlow: data.executionFlow || [],
      dependencyGraph: data.dependencyGraph || { nodes: [], links: [] },
      insights: data.insights || null,
      isAnalyzing: false,
      appStage: 'dashboard',
      loadingProgress: 100,
    }),
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  setSelectedView: (view) => set({ selectedView: view }),
  
  addChatMessage: (role, content) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, { role, content, timestamp: new Date() }],
    })),
  
  resetState: () =>
    set({
      appStage: 'landing',
      repositoryUrl: '',
      analysisDepth: 'intermediate',
      loadingLogs: [],
      loadingProgress: 0,
      isAnalyzing: false,
      projectData: null,
      folderTree: {},
      fileMetadata: {},
      executionFlow: [],
      dependencyGraph: { nodes: [], links: [] },
      selectedFile: null,
      selectedView: 'dependency',
      chatMessages: [],
      insights: null,
    }),
}))
