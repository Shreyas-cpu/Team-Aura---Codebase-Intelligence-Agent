# 🧠 Codebase Intelligence Agent
### by CodeAura

> *Turn any GitHub repository into structured intelligence — instantly.*

---

## Overview

**Codebase Intelligence Agent** is an AI-powered developer tool that analyzes any public GitHub repository and extracts structured insights about its architecture, dependencies, entry points, and critical paths — all presented in a clean, modern dashboard UI.

It leverages **Google Gemini AI** for intelligent summarization and runs entirely locally as a full-stack Node.js + React application.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **M1 — Folder Intelligence** | Visual tree-based representation of the repo structure with critical zone highlights |
| **M2 — Execution Chain** | Detects the entry point and statically traces the execution flow across imported files |
| **M3 — Dependency Graph** | Builds an interactive SVG node-edge graph of all internal module linkages |
| **B1 — Critical Files** | Ranks files by import weight and architectural importance |
| **AI Chat** | Ask questions about your codebase via a RAG-powered AI assistant |
| **Overview** | AI-generated one-line summary, tech stack, architecture style, design patterns, and quality signals |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite
- Lucide Icons
- Native SVG Graph Visualization
- Custom `AuraDark` CSS design system

**Backend**
- Node.js + Express
- Google Gemini AI (`@google/genai`)
- `acorn` for JS/TS AST parsing
- `simple-git` for repo cloning
- Custom regex parsers for Python, C, and C++

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/codebase-intelligence-agent.git
   cd codebase-intelligence-agent
   ```

2. **Configure environment variables**
   ```bash
   cd backend
   cp .env.example .env
   ```
   Edit `backend/.env` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3001
   ```

3. **Start the application**

   **Windows:**
   ```bat
   start.bat
   ```

   **Mac/Linux:**
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Usage

1. Paste any **public GitHub repository URL** into the input box.
2. Click **ANALYZE REPO** — the system will clone, parse, and analyze the codebase.
3. Navigate the left sidebar to explore each intelligence module:
   - **Overview** — High-level AI summary
   - **Folder Struct (M1)** — Visual directory tree
   - **Entry Point (M2)** — Stack trace from entry file
   - **Dependencies (M3)** — Interactive dependency ring graph
   - **Bonus Features** — Critical file ranking
   - **AI Chat** — Ask questions, get answers

---

## 📁 Project Structure

```
├── backend/
│   ├── services/
│   │   ├── structure.service.js     # M1 - Folder analysis
│   │   ├── entrypoint.service.js    # M2 - Entry detection + chain trace
│   │   ├── dependency.service.js    # M3 - AST dependency graph
│   │   ├── bonus.service.js         # Bonus - Critical files + AI summary
│   │   └── rag.service.js           # AI Chat RAG engine
│   ├── routes/
│   └── index.js
├── frontend/
│   ├── src/
│   │   ├── App.jsx                  # Main dashboard + all module views
│   │   └── index.css                # AuraDark design system
│   └── index.html
├── start.bat                        # Windows launcher
├── start.sh                         # Unix launcher
└── README.md
```

---

## 🌐 Supported Languages / Stacks

The agent intelligently analyzes repositories written in:

- **JavaScript / TypeScript** (Node.js, React, Next.js, etc.)
- **Python** (Django, Flask, FastAPI, etc.)
- **C / C++** (CMake, Makefile-based projects like Neovim)
- **Go**, **Java**, **C#** (entry point detection)

---

## 📌 Notes

- The system clones the target repository into a temporary sandbox directory and cleans it up automatically.
- Repositories with more than 100 modules are capped in the M3 graph for performance.
- The AI Chat (RAG) requires a valid Gemini API key.

---

## 🤝 Team

Built with ❤️ by **Team Aura** as part of a Codebase Intelligence research initiative.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
