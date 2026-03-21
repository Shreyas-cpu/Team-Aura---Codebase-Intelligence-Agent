import React, { useState, useEffect } from 'react'
import { useAppStore } from './store/appStore'
import LandingPage from './pages/LandingPage'
import LoadingOrchestration from './pages/LoadingOrchestration'
import UnifiedIntelligenceDashboard from './components/UnifiedIntelligenceDashboard'
import CodeAura from './components/CodeAura'

export default function App() {
  return <CodeAura />
}
