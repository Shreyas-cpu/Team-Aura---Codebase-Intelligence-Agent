# 🎨 CodeAura - Usage & Extension Guide

## Quick Start

### Basic Usage
```jsx
import CodeAura from './components/CodeAura'

export default function App() {
  return <CodeAura />
}
```

### With Real Data
```jsx
import CodeAura from './components/CodeAura'
import { useAppStore } from './store/appStore'

export default function App() {
  const { projectData } = useAppStore()
  
  return (
    <CodeAura 
      data={projectData}
      onAnalyze={(url) => {
        // Fetch and analyze repository
      }}
    />
  )
}
```

## Tailwind CSS Customization

### Adding Custom Colors
Update `tailwind.config.js` theme colors:

```js
theme: {
  extend: {
    colors: {
      'brand-primary': '#FF1493',
      'brand-secondary': '#00CED1',
    }
  }
}
```

Then use in components:
```jsx
<button className="bg-brand-primary text-brand-secondary">
  Custom Color
</button>
```

### Creating Custom Animations
```js
keyframes: {
  'slide-up': {
    '0%': { transform: 'translateY(10px)', opacity: '0' },
    '100%': { transform: 'translateY(0)', opacity: '1' },
  }
},
animation: {
  'slide-up': 'slide-up 0.3s ease-out',
}
```

## Component Extensions

### Example 1: Add Real-Time Status Indicator
```jsx
// In CodeAura.jsx, add to header
<div className="flex items-center gap-2">
  <div className="w-2 h-2 bg-aura-emerald rounded-full animate-pulse"></div>
  <span className="text-aura-gray text-xs font-mono">LIVE</span>
</div>
```

### Example 2: Add Search/Filter to File Explorer
```jsx
const [searchTerm, setSearchTerm] = useState('')

const filteredFolders = mockFolderStructure.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase())
)

// In render:
<div className="mb-4">
  <input
    type="text"
    placeholder="Search files..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full px-3 py-2 bg-aura-dark border border-aura-border rounded text-aura-white text-sm focus:border-aura-emerald"
  />
</div>
```

### Example 3: Add Dark/Light Theme Toggle
```jsx
const [isDark, setIsDark] = useState(true)

const bgColor = isDark ? 'bg-aura-black' : 'bg-white'
const textColor = isDark ? 'text-aura-white' : 'text-gray-900'

// In header:
<button
  onClick={() => setIsDark(!isDark)}
  className="p-2 hover:bg-aura-dark rounded"
>
  {isDark ? '☀️' : '🌙'}
</button>
```

### Example 4: Code Preview Panel
```jsx
<div className="bg-aura-dark border border-aura-border rounded p-4 font-mono text-xs">
  <p className="text-aura-emerald mb-3">{selectedItem?.name}</p>
  <pre className="text-aura-gray overflow-x-auto">
    {`function example() {
  return "CodeAura is awesome!";
}`}
  </pre>
</div>
```

### Example 5: Metrics Dashboard
```jsx
const metrics = [
  { label: 'Complexity', value: 'HIGH', color: '#FF6B6B' },
  { label: 'Maintainability', value: '7.2/10', color: '#4ECDC4' },
  { label: 'Test Coverage', value: '87%', color: '#00FF9D' },
]

<div className="grid grid-cols-3 gap-4">
  {metrics.map(m => (
    <div key={m.label} className="bg-aura-dark border border-aura-border rounded p-4">
      <p className="text-aura-gray text-xs mb-2">{m.label}</p>
      <p style={{ color: m.color }} className="text-xl font-bold font-mono">
        {m.value}
      </p>
    </div>
  ))}
</div>
```

## Integration Examples

### With Zustand Store
```jsx
import { useAppStore } from '../store/appStore'

export default function CodeAuraConnected() {
  const { projectData, selectedFile, setSelectedFile } = useAppStore()

  return (
    <CodeAura 
      data={projectData}
      selectedItem={selectedFile}
      onSelectItem={setSelectedFile}
    />
  )
}
```

### With API Backend
```jsx
const [isLoading, setIsLoading] = useState(false)

const handleAnalyze = async (url) => {
  setIsLoading(true)
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: JSON.stringify({ url })
    })
    const data = await response.json()
    // Update component with real data
  } finally {
    setIsLoading(false)
  }
}
```

### With D3 Graphs
```jsx
import * as d3 from 'd3'

const M3DependencyGraph = ({ nodes, links }) => {
  const svgRef = useRef()

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    // Create force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter())

    // Render nodes and links
  }, [nodes, links])

  return <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
}
```

## Styling Techniques

### Glass Morphism
```jsx
<div className="bg-gradient-emerald backdrop-blur-sm border border-aura-emerald/20 rounded">
  Glassmorphic Content
</div>
```

### Neon Glow Effect
```jsx
<div className="bg-aura-emerald shadow-emerald-glow hover:shadow-emerald-glow-lg transition-all">
  Glowing Element
</div>
```

### Hover Animation
```jsx
<button className="
  bg-aura-dark 
  hover:bg-aura-black 
  hover:border-aura-emerald 
  hover:shadow-emerald-glow
  transition-all 
  duration-200
">
  Animated Hover
</button>
```

### Gradient Text
```jsx
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-aura-emerald to-cyan-500">
  Gradient Text
</h1>
```

## Performance Optimization

### Memoization
```jsx
import { useMemo, memo } from 'react'

const FileTree = memo(({ items }) => {
  const renderedItems = useMemo(() => 
    items.map(item => renderTreeItem(item)),
    [items]
  )
  
  return <div>{renderedItems}</div>
})
```

### Virtual Scrolling for Large Lists
```jsx
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={35}
>
  {({ index, style }) => (
    <div style={style}>{items[index].name}</div>
  )}
</FixedSizeList>
```

### Code Splitting
```jsx
import { lazy, Suspense } from 'react'

const M3DependencyGraph = lazy(() => import('./M3DependencyGraph'))

<Suspense fallback={<div>Loading...</div>}>
  <M3DependencyGraph />
</Suspense>
```

## Accessibility Considerations

### ARIA Labels
```jsx
<button
  aria-label="Toggle folder"
  onClick={() => toggleFolder(item.id)}
  className="..."
>
  <ChevronDown size={16} />
</button>
```

### Keyboard Navigation
```jsx
const handleKeyDown = (e) => {
  if (e.key === 'ArrowDown') {
    // Navigate to next item
  } else if (e.key === 'ArrowUp') {
    // Navigate to previous item
  } else if (e.key === 'Enter') {
    // Select current item
  }
}
```

### Focus Management
```jsx
<input
  className="
    focus:outline-none 
    focus:ring-2 
    focus:ring-aura-emerald
    focus:border-transparent
  "
  aria-describedby="input-help"
/>
```

## Testing Examples

### Component Testing with Vitest
```jsx
import { render, screen } from '@testing-library/react'
import CodeAura from './CodeAura'

describe('CodeAura', () => {
  it('renders header with logo', () => {
    render(<CodeAura />)
    expect(screen.getByText('CodeAura')).toBeInTheDocument()
  })

  it('displays file tree', () => {
    render(<CodeAura />)
    expect(screen.getByText('lib')).toBeInTheDocument()
  })
})
```

### E2E Testing with Cypress
```js
describe('CodeAura Navigation', () => {
  it('switches between tabs', () => {
    cy.visit('/')
    cy.contains('M2 - ENTRY POINT').click()
    cy.contains('Entry Point Analysis').should('be.visible')
  })
})
```

## Deployment Checklist

- [ ] Build succeeds without errors: `npm run build`
- [ ] No console errors or warnings
- [ ] Tailwind CSS purging working (no unused styles in build)
- [ ] All icons load correctly
- [ ] Animations run smoothly (60fps)
- [ ] Responsive design tested
- [ ] Keyboard navigation works
- [ ] Theme toggle functions properly
- [ ] API endpoints configured
- [ ] Environment variables set
- [ ] Performance metrics acceptable (<3s load time)

## Troubleshooting

### Tailwind Classes Not Applied
```bash
# Clear cache and rebuild
rm -rf node_modules dist .next
npm install
npm run dev
```

### Memory Leaks
```jsx
useEffect(() => {
  const handler = () => {/* ... */}
  window.addEventListener('resize', handler)
  
  return () => {
    window.removeEventListener('resize', handler)
  }
}, [])
```

### Animations Stuttering
```js
// Enable GPU acceleration
className="... will-change-transform transform-gpu"
```

---

**Last Updated:** March 21, 2026
**Version:** CodeAura 1.0
**Status:** Production Ready ✅
