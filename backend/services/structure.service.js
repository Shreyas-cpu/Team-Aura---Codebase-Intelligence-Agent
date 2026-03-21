const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Keywords for criticality scoring ──
const CRITICAL_KEYWORDS = ['controller', 'auth', 'db', 'config', 'route', 'service', 'model', 'middleware', 'api', 'server', 'app'];

/**
 * T-02: M1 — Folder Structure Analysis Engine
 * analyzeStructure(repoPath) → array of {path, type, fileCount, depth, criticality, description}
 */
async function analyzeStructure(repoPath) {
  const IGNORE_DIRS = new Set([
    'node_modules', '.git', 'dist', 'build', '.next',
    'venv', '__pycache__', '.venv', 'env', '.cache',
    'coverage', '.nyc_output', 'target', 'out'
  ]);

  // Step 1: Walk top-level directories and collect metadata
  const entries = fs.readdirSync(repoPath, { withFileTypes: true });
  const folders = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (IGNORE_DIRS.has(entry.name)) continue;

    const fullPath = path.join(repoPath, entry.name);
    const fileCount = countFilesRecursive(fullPath, IGNORE_DIRS);
    const depth = getMaxDepth(fullPath, IGNORE_DIRS, 0, 4);

    // Step 2: Criticality scoring based on keywords
    const nameLower = entry.name.toLowerCase();
    let criticalityScore = 0;
    const matchedKeywords = [];
    for (const kw of CRITICAL_KEYWORDS) {
      if (nameLower.includes(kw)) {
        criticalityScore += 2;
        matchedKeywords.push(kw);
      }
    }
    // Also check child file names for keywords
    try {
      const childFiles = fs.readdirSync(fullPath);
      for (const child of childFiles) {
        const childLower = child.toLowerCase();
        for (const kw of CRITICAL_KEYWORDS) {
          if (childLower.includes(kw)) {
            criticalityScore += 1;
            if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
          }
        }
      }
    } catch (e) { /* ignore */ }

    // Classify
    let classification = 'META';
    if (criticalityScore >= 4) classification = 'CRITICAL';
    else if (criticalityScore >= 2) classification = 'IMPORTANT';
    else if (nameLower.includes('test') || nameLower === 'spec' || nameLower === 'tests') classification = 'TEST';

    folders.push({
      path: entry.name,
      type: 'directory',
      fileCount,
      depth,
      criticalityScore,
      classification,
      matchedKeywords,
      description: '' // Will be filled by Gemini
    });
  }

  // Step 3: Gemini prompt — batch all top-level dirs for one-line descriptions
  const folderList = folders.map(f => `${f.path}/ (${f.fileCount} files, classification: ${f.classification})`).join('\n');

  try {
    const prompt = `You are an expert software architect analyzing a GitHub repository.
Here are the top-level directories:

${folderList}

For each directory, provide a single-sentence plain-English description of what it likely contains and its purpose.
Return ONLY a raw JSON array, no markdown, no code fences:
[{"folder": "dirName", "description": "one-sentence purpose"}]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.1 }
    });

    let rawText = response.text.trim();
    // Strip markdown fences if present
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
    }

    const descriptions = JSON.parse(rawText);

    // Merge descriptions back
    for (const desc of descriptions) {
      const folder = folders.find(f => f.path === desc.folder);
      if (folder) folder.description = desc.description;
    }
  } catch (err) {
    console.error('[M1] Gemini description error:', err.message);
    // Fallback: leave descriptions empty or use classification
    for (const folder of folders) {
      if (!folder.description) {
        folder.description = `${folder.classification} directory with ${folder.fileCount} files`;
      }
    }
  }

  // Also include top-level files
  const topFiles = entries
    .filter(e => !e.isDirectory())
    .map(e => ({
      path: e.name,
      type: 'file',
      extension: path.extname(e.name),
      size: fs.statSync(path.join(repoPath, e.name)).size
    }));

  return { folders, topFiles };
}

// ── Helper: count files recursively ──
function countFilesRecursive(dirPath, ignoreDirs, depth = 0) {
  if (depth > 6) return 0;
  let count = 0;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignoreDirs.has(entry.name)) {
          count += countFilesRecursive(path.join(dirPath, entry.name), ignoreDirs, depth + 1);
        }
      } else {
        count++;
      }
    }
  } catch (e) { /* permission denied etc */ }
  return count;
}

// ── Helper: get max nesting depth ──
function getMaxDepth(dirPath, ignoreDirs, current, max) {
  if (current >= max) return current;
  let deepest = current;
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !ignoreDirs.has(entry.name)) {
        deepest = Math.max(deepest, getMaxDepth(path.join(dirPath, entry.name), ignoreDirs, current + 1, max));
      }
    }
  } catch (e) { /* */ }
  return deepest;
}

module.exports = { analyzeStructure };
