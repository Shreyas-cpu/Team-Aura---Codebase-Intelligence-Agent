# CodeAura — Changes Log

## [2026-03-21T09:43:25+05:30] — Session Start
- Read problem statement (`code_on_vibes_problem_statement.pdf`) and solution document (`team_aura_solution.html`)

## [2026-03-21T10:07:45+05:30] — Realignment to TaskBooks
- Read `CodeAura_TaskBook.docx` and `CodeAura_LeadDev_TaskBook.docx`
- Identified correct 7-phase development plan
- User instructed: git setup first, then follow TaskBook phases exactly
- Established logging conventions: Changes.md (timestamps) + SMM Prompt.txt (raw prompts)

## [2026-03-21T10:14:16+05:30] — Phase 0: Git Setup ✅
- Deleted premature `backend/` and `frontend/` folders
- Created `.gitignore` (node_modules, .env, sandbox, dist, build, IDE files)
- `git init` → initial commit on `main`
- Remote added: `https://github.com/Shreyas-cpu/Team-Aura---Codebase-Intelligence-Agent.git`
- Branch renamed `master` → `main`, pushed to `origin/main`

## [2026-03-21T10:32:52+05:30] — Phase 1: Scaffold & Environment ✅
- Branch: `feat/scaffold`
- Created root `package.json` (monorepo scripts)
- Backend: `npm init` + installed `express`, `cors`, `simple-git`, `acorn`, `dotenv`, `nodemon`
- Created `backend/index.js` — Express server on port 3001
- Created `backend/routes/clone.routes.js` — `/api/clone` endpoint (GitHub URL → shallow clone to sandbox)
- Created `backend/routes/files.routes.js` — `/api/files` endpoint (recursive tree walk, returns JSON)
- Created `frontend/README.md` placeholder
- **Tested**: Cloned `expressjs/express` → 213 files returned in correct tree JSON
- Commit: `feat(scaffold): monorepo setup, clone + file-tree API`

## [2026-03-21T10:50:53+05:30] — Phase 2: M1 + M2 Core Features ✅
- Branch: `feat/m1-m2`
- Installed `@google/genai` for Gemini API integration
- Created `backend/services/structure.service.js` — T-02 M1: folder analysis with keyword criticality scoring (CRITICAL/IMPORTANT/TEST/META) + Gemini one-line descriptions
- Created `backend/services/entrypoint.service.js` — T-03 M2: multi-strategy entry point detection (package.json main, scripts.start, root/subdir filename scan) + recursive import chain tracing to depth 4 + Gemini execution flow description
- Created `backend/routes/analyze.routes.js` — `/api/analyze/structure` and `/api/analyze/entrypoint` endpoints
- **Tested on `expressjs/express`**: Entry point `index.js` detected via package.json main field, execution chain traced through `lib/express.js → lib/application.js → lib/view.js → lib/request.js → lib/response.js`
- Commit: `feat(M1): folder analysis engine + Gemini prompt` + `feat(M2): entry point detection + execution chain API`

## [2026-03-21T11:08:57+05:30] — Phase 3: M3 Dependency Graph ✅
- Branch: `feat/m3-dependency-graph`
- Created `backend/services/dependency.service.js` — T-04: acorn AST parsing (JS), regex (TS/Python), import resolution, `importedByCount` scoring, 100-node cap
- Added `/api/analyze/dependencies` endpoint to `analyze.routes.js`
- **Tested on `expressjs/express`**: 100 nodes (capped), 97 edges from 213 source files
- Commit: `feat(M3): AST dependency graph, JS + Python import extractors`

## [2026-03-21T11:33:46+05:30] — Phase 4: RAG Pipeline / Ask AI ✅
- Branch: `feat/rag-ask-ai`
- Created `backend/services/rag.service.js` — T-05: chunk codebase (800 chars, 100 overlap, 500 file cap), Gemini text-embedding-004, cosine similarity search with keyword fallback, Gemini 2.5 Flash answer generation
- Created `backend/routes/chat.routes.js` — `POST /api/chat` endpoint (sessionId, localPath, message → RAG answer)
- In-memory session store with auto-indexing on first query
- **Tested pipeline**: Clone → chunk → search → answer (Gemini requires valid API key for full end-to-end)
- Commit: `feat(rag): codebase chunking, Gemini embeddings + /api/chat endpoint`

## [2026-03-21T11:48:05+05:30] — Phase 5: Bonus B1 + B3 ✅
- Branch: `feat/bonus-b1-b3`
- Created `backend/services/bonus.service.js` — B1 critical scoring + B3 AI summary
- Added `/api/analyze/critical` and `/api/analyze/summary` endpoints
- **Tested B1 on `expressjs/express`**: Top 5 scored correctly
- Commit: `feat(B1+B3): critical file scoring + AI repo summary`

## [2026-03-21T12:00:24+05:30] — Phase 6: Caching + Performance ✅
- Branch: `feat/caching-v2` (rebased from `bonus-b1-b3` to include all merged features)
- Created `backend/services/cache.service.js` — T-10: In-memory cache (30 min TTL), 5000-file size limit check
- Created `backend/routes/preload.routes.js` — `/api/preload` endpoint clones and analyzes 3 demo repos concurrently, caching results. Includes `/api/preload/status` and `/api/preload/clear`.
- Wired all routes into `backend/index.js` (v0.6.0)
- **Tested pipeline**: `/api/preload` successfully cached express, fastapi, and realworld repos
- Commit: `feat(caching): add cache routes, services and preload endpoint`

## [2026-03-21T12:59:42+05:30] — Phase 7: Frontend Application UI ✅
- Branch: `feat/frontend-ui`
- Removed placeholder frontend folder and scaffolded React using Vite without Tailwind (to abide by strict custom CSS design system rules).
- Instantly installed dependencies (`lucide-react`, `axios`).
- Transcribed the `AuraDark` design system from `CodeAura_StylePrompt.html` carefully into `frontend/src/index.css`, capturing all CSS variables, typography, glow Orbs, grid backgrounds, and utility classes flawlessly.
- Rewrote `frontend/src/App.jsx` to be a beautiful dashboard layout integrating M1, M2, M3, B1, B3, and conversational RAG features.
- Wired frontend API calls to `http://localhost:3001/api`.
- Verified compilation using `npm run dev`.
- Commit: `feat(frontend): scaffold React Vite app with AuraDark UI system`

## [2026-03-21T13:28:51+05:30] — Phase 7: Hotfix & Cleanup ✅
- **Bug Fixed**: `backend/index.js` — Moved `dotenv.config()` to execute before route imports, ensuring the Gemini API key securely loads for the AI features (B3 summaries and RAG chat).
- Removed default placeholder link from the UI input box.
- Commit: `fix(backend/frontend): load dotenv properly, remove default repo link`

## [2026-03-21T16:38:12+05:30] — Phase 8: Tabbed Dashboard Redesign ✅
- **UI Architecture Rewrite:** Refactored `App.jsx` from a single scrolling feed into a modular, tabbed application.
- Developed specific layouts for `M1`, `M2`, `M3`, `B1`, and `ASK AI`.
- Designed the Sidebar + Main Layout grid mapping directly to the `team_aura_solution.html` aesthetic wireframe.
- Added extensive UI utility classes (`.ui-mockup`, `.ui-topbar`, `.ui-tabs`, `.ui-sidebar`) into `index.css`.
- **Bug Fixed (16:54):** Restored the `localPath` API payloads in `App.jsx` `handleAnalyze()` which were mistakenly omitted during the rewrite, causing `M1` analysis 500 errors. Fixed property alias bug `repoPath` -> `localPath`.
- **Bug Fixed (17:35):** Restored the `{ sessionId, localPath, message }` API payload structure in `App.jsx` `handleChat()` which was accidentally replaced with `{ question }` during the UI rewrite.
- Commit: `feat(frontend): redesign dashboard to match tabbed layout specification`
