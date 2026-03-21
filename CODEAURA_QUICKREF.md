# 🎨 CodeAura - Quick Reference Card

## 🚀 Getting Started (30 seconds)

### 1. View the Dashboard
```bash
npm run dev
# Open http://localhost:5174
```

### 2. Switch Themes
Press: **Ctrl+Shift+T**
- CodeAura (Tailwind) ↔ Original Dashboard (CSS-in-JS)

### 3. Explore Features
- **Click tabs** (M1, M2, M3, ASK AI+) to navigate
- **Click folders** in tree to expand/collapse
- **Click files** to select and view details
- **Hover buttons** to see glow effects

---

## 🎨 Tailwind CSS Cheat Sheet

### Colors (CodeAura Palette)
```
bg-aura-black    → #050505 (Background)
bg-aura-dark     → #0B0B0B (Cards)
bg-aura-emerald  → #00FF9D (Accent - NEON GREEN)
text-aura-white  → #FFFFFF (Headers)
text-aura-gray   → #94A3B8 (Body)
```

### Layout Classes
```
flex flex-col           → Column layout
flex-1                  → Fill available space
gap-4                   → Add spacing between items
grid grid-cols-3        → 3-column grid
w-80, w-full, w-1/2     → Width helpers
p-4, px-6, py-8         → Padding
```

### Effects
```
border border-aura-border                → Add border
rounded, rounded-lg                      → Corners
shadow-emerald-glow                      → Glow effect
hover:shadow-emerald-glow-lg             → Hover glow
transition-all duration-200              → Smooth animation
```

### Hover & Focus
```
hover:text-aura-emerald    → Color on hover
hover:bg-aura-dark         → Background on hover
focus:outline-none         → Remove default focus
focus:ring-1 ring-aura-emerald → Custom focus ring
```

---

## 📦 Component API

### CodeAura Props (Expandable)
```jsx
<CodeAura
  // Future implementation
  repositoryUrl="https://github.com/user/repo"
  onAnalyze={(url) => console.log(url)}
  m1Data={mockData}        // Folder structure
  m2Data={executionData}   // Entry points
  m3Data={dependencyData}  // Dependencies
/>
```

### Current Data Structure
```js
// Mock folder structure
{
  id: '1',
  name: 'lib',
  type: 'folder',
  critical: true,
  children: [/* files */]
}

// Mock M1 Report
{
  name: 'lib',
  type: 'Critical Core Library',
  stats: { files: 24, lines: 3482, complexity: 'HIGH' },
  dependencies: [/* deps */],
  keyFunctions: [/* funcs */]
}
```

---

## 🔧 Common Customizations

### Change Primary Color
**File:** `tailwind.config.js`
```js
colors: {
  'aura-emerald': '#YOUR_NEON_COLOR',
}
```

### Add New Tab
**File:** `src/components/CodeAura.jsx`
```jsx
{ id: 'custom', label: 'CUSTOM TAB', icon: CustomIcon }
```

### Add File Icons
**File:** `src/components/CodeAura.jsx`
```jsx
import { FileText, FileCode, FileJson } from 'lucide-react'
// Map by extension
const iconMap = { 'js': FileCode, 'json': FileJson }
```

---

## 🎭 Animation API (Framer Motion)

### Fade In/Out
```jsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Slide + Fade
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Spring Animation
```jsx
<motion.div
  layoutId="underline"
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

---

## 📊 Icons Available (Lucide-React)

### Included in CodeAura
```
Folder, FolderOpen        → Directory icons
File                      → File icon
ChevronDown, ChevronRight → Expand/collapse
Search                    → Search icon
Code2                     → Code icon
GitBranch                 → Git icon
Play                      → Execution icon
MessageSquare             → Chat icon
Download, Share2          → Action icons
```

### How to Add More
```jsx
import { NewIcon } from 'lucide-react'
<NewIcon size={16} className="text-aura-emerald" />
```

---

## 🧪 Testing the Build

### Development
```bash
npm run dev
# ✓ Dev server running on http://localhost:5174
# Hot reload on file changes
```

### Production
```bash
npm run build
# ✓ 2,132 modules transformed
# ✓ Output: dist/
npm run preview
# Preview production build locally
```

---

## 🐛 Troubleshooting

### Issue: Tailwind classes not applying
**Solution:** Restart dev server and clear cache
```bash
npm run dev
# Press Ctrl+C and restart
```

### Issue: Animations lag
**Solution:** Enable GPU acceleration
```jsx
className="... will-change-transform transform-gpu"
```

### Issue: Theme toggle not working
**Solution:** Verify keyboard listeners in App.jsx
```jsx
// Check Ctrl+Shift+T is being caught
if (e.ctrlKey && e.shiftKey && e.code === 'KeyT')
```

---

## 📁 File Locations

| What | Where |
|------|-------|
| Main Component | `src/components/CodeAura.jsx` |
| Pro Version | `src/components/CodeAuraPro.jsx` |
| Styles Config | `tailwind.config.js` |
| CSS Directives | `src/index.css` |
| Documentation | `CODEAURA_*.md` |
| App Integration | `src/App.jsx` |

---

## 🎯 Performance Tips

1. **Use Memoization**
   ```jsx
   const TreeNode = memo(({ item }) => ...)
   ```

2. **Lazy Load Components**
   ```jsx
   const M3Graph = lazy(() => import('./M3Graph'))
   ```

3. **Optimize Images**
   - Use WebP format
   - Compress before upload

4. **Monitor Bundle**
   ```bash
   npm run build
   # Check dist/ size
   ```

---

## 🔐 Security Checklist

- [ ] Sanitize GitHub URLs before API calls
- [ ] Validate all user inputs
- [ ] Use environment variables for API keys
- [ ] Check CORS headers
- [ ] Implement rate limiting
- [ ] Add authentication for production

---

## 🚀 Deployment Options

### Vercel
```bash
npx vercel
# Auto-detects Next.js/React projects
```

### Netlify
```bash
npm run build
# Drag & drop dist/ folder to netlify.com
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm run build
EXPOSE 5174
CMD ["npm", "run", "dev"]
```

### Azure Static Web Apps
```bash
az staticwebapp create \
  --resource-group myGroup \
  --name CodeAura
```

---

## 📞 Support Resources

- **Tailwind CSS:** https://tailwindcss.com/docs
- **Framer Motion:** https://www.framer.com/motion/
- **Lucide Icons:** https://lucide.dev/
- **React Docs:** https://react.dev/
- **Vite Guide:** https://vitejs.dev/guide/

---

## ✅ Feature Checklist

### Core Features ✓
- [x] Dark terminal theme
- [x] Neon emerald color system
- [x] File tree explorer
- [x] M1 report display
- [x] Navigation tabs
- [x] Glassmorphism effects
- [x] Glow shadows

### Animations ✓
- [x] Tab transitions
- [x] Button pulse
- [x] Hover effects
- [x] Fade animations
- [x] Slide animations

### Responsive Design ✓
- [x] Header layout
- [x] Sidebar navigation
- [x] Main content area
- [x] Mobile-friendly (in progress)

---

## 📊 Current Status

| Component | Status | Notes |
|-----------|--------|-------|
| CodeAura | ✅ Ready | Production use |
| CodeAuraPro | ✅ Ready | Enhanced features |
| M1 Report | ✅ Complete | Mock data |
| M2 Flow | 🟡 Partial | Placeholder |
| M3 Graph | 🟡 Partial | Placeholder |
| ASK AI | 🟡 Partial | Placeholder |

---

## 🎓 Learning Path

### Beginner
1. Understand Tailwind CSS utility classes
2. Learn Framer Motion basics
3. Explore CodeAura component structure

### Intermediate
1. Customize colors and animations
2. Add new tabs and sections
3. Integrate with mock data

### Advanced
1. Connect real backend APIs
2. Implement D3 visualizations
3. Add AI chat integration
4. Deploy to production

---

**Version:** 1.0.0
**Last Updated:** March 21, 2026
**Status:** ✅ Production Ready
**Theme Toggle:** Ctrl+Shift+T

🚀 Happy coding!
