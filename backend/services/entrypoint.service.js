const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Common entry point filenames per language ──
const ENTRY_CANDIDATES = [
  'server.js', 'index.js', 'app.js', 'main.js',
  'main.py', 'app.py', 'manage.py', 'run.py',
  'index.ts', 'server.ts', 'app.ts', 'main.ts',
  'Program.cs', 'Main.java', 'main.go',
  'main.c', 'main.cpp', 'CMakeLists.txt', 'Makefile'
];

/**
 * T-03: M2 — Entry Point Detection + Execution Chain
 * detectEntryPoint(repoPath) → { entryFile, language, executionChain[] }
 */
async function detectEntryPoint(repoPath) {
  let entryFile = null;
  let entrySource = '';

  // ... (Strategy 1: pkg)
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      if (pkg.main && fs.existsSync(path.join(repoPath, pkg.main))) {
        entryFile = pkg.main;
        entrySource = 'package.json main field';
      }
      if (!entryFile && pkg.scripts && pkg.scripts.start) {
        const startScript = pkg.scripts.start;
        const match = startScript.match(/(?:node|nodemon|ts-node|python)\s+(\S+)/);
        if (match && fs.existsSync(path.join(repoPath, match[1]))) {
          entryFile = match[1];
          entrySource = 'package.json scripts.start';
        }
      }
    } catch (e) { /* malformed package.json */ }
  }

  // Strategy 2: root files
  if (!entryFile) {
    const rootFiles = fs.readdirSync(repoPath);
    for (const candidate of ENTRY_CANDIDATES) {
      if (rootFiles.includes(candidate)) {
        entryFile = candidate;
        entrySource = 'filename heuristic (root scan)';
        break;
      }
    }
  }

  // Strategy 3: subdirectories
  if (!entryFile) {
    const subDirs = ['src', 'lib', 'app', 'src/nvim'];
    for (const sub of subDirs) {
      const subPath = path.join(repoPath, sub);
      if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
        const subFiles = fs.readdirSync(subPath);
        for (const candidate of ENTRY_CANDIDATES) {
          if (subFiles.includes(candidate)) {
            entryFile = path.join(sub, candidate).replace(/\\/g, '/');
            entrySource = `filename heuristic (${sub}/ scan)`;
            break;
          }
        }
        if (entryFile) break;
      }
    }
  }

  if (!entryFile) {
    return {
      entryFile: null,
      language: 'unknown',
      detectedBy: 'none',
      executionChain: [],
      description: 'No entry point detected. The repository may use a non-standard project structure.'
    };
  }

  const ext = path.extname(entryFile);
  const langMap = {
    '.js': 'JavaScript', '.ts': 'TypeScript', '.jsx': 'JavaScript (React)',
    '.tsx': 'TypeScript (React)', '.py': 'Python', '.java': 'Java',
    '.cs': 'C#', '.go': 'Go', '.rb': 'Ruby',
    '.c': 'C', '.cpp': 'C++', '.txt': 'CMake (Build Script)'
  };
  const language = langMap[ext] || 'Unknown';

  const entryFullPath = path.join(repoPath, entryFile);
  const executionChain = traceExecutionChain(entryFullPath, repoPath, 0, 4);

  let description = '';
  try {
    const entryContent = fs.readFileSync(entryFullPath, 'utf8');
    const first50Lines = entryContent.split('\n').slice(0, 50).join('\n');

    const prompt = `You are an expert software architect.
The entry point of this ${language} project is: ${entryFile}

Here are the first 50 lines:
\`\`\`
${first50Lines}
\`\`\`

The import chain from this file traces through:
${executionChain.map(c => `  ${c.file} → ${c.action}`).join('\n')}

Describe the execution flow in 3-5 bullet points, each starting with the file name and what it does.
Return ONLY a raw JSON array of strings, no markdown, no code fences:
["server.js loads environment variables", "server.js connects to database via db.config.js", ...]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.1 }
    });

    let rawText = response.text.trim();
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
    }
    const flowSteps = JSON.parse(rawText);
    description = flowSteps;
  } catch (err) {
    console.error('[M2] Gemini flow description error:', err.message);
    description = executionChain.map(c => `${c.file}: ${c.action}`);
  }

  return { entryFile, language, detectedBy: entrySource, executionChain, description };
}

function traceExecutionChain(filePath, repoPath, depth, maxDepth) {
  if (depth >= maxDepth || !fs.existsSync(filePath)) return [];

  const chain = [];
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const relativePath = path.relative(repoPath, filePath).replace(/\\/g, '/');

    const ext = path.extname(filePath);
    const imports = [];

    if (['.js', '.ts', '.jsx', '.tsx'].includes(ext)) {
      const esMatches = content.matchAll(/import\s+.*?\s+from\s+['"](.+?)['"]/g);
      for (const m of esMatches) imports.push(m[1]);

      const cjsMatches = content.matchAll(/require\s*\(\s*['"](.+?)['"]\s*\)/g);
      for (const m of cjsMatches) imports.push(m[1]);
    } else if (['.py'].includes(ext)) {
      const pyMatches = content.matchAll(/(?:from\s+(\S+)\s+import|import\s+(\S+))/g);
      for (const m of pyMatches) imports.push(m[1] || m[2]);
    } else if (['.c', '.cpp', '.h', '.hpp'].includes(ext)) {
      // Local C includes
      const cMatches = content.matchAll(/#include\s+["'](.+?)["']/g);
      for (const m of cMatches) imports.push(m[1]);
    }

    for (const imp of imports) {
      if (!imp.startsWith('.') && !imp.startsWith('/') && !['.c', '.cpp'].includes(ext)) continue;

      let resolvedPath = path.resolve(path.dirname(filePath), imp);
      const extensions = ['.js', '.ts', '.jsx', '.tsx', '.py', '.c', '.cpp', '.h', '.hpp', ''];
      let found = false;
      for (const tryExt of extensions) {
        const tryPath = resolvedPath + tryExt;
        if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
          resolvedPath = tryPath;
          found = true;
          break;
        }
      }
      if (!found) continue;

      const targetRel = path.relative(repoPath, resolvedPath).replace(/\\/g, '/');

      chain.push({
        file: targetRel,
        action: `imported by ${relativePath}`,
        connects_to: imp
      });

      const subChain = traceExecutionChain(resolvedPath, repoPath, depth + 1, maxDepth);
      chain.push(...subChain);
    }
  } catch (e) {
  }

  return chain;
}

module.exports = { detectEntryPoint };
