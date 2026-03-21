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
