const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// ── Keywords for scoring ──
const SCORE_KEYWORDS = {
  auth: 'authentication', db: 'database', config: 'configuration',
  router: 'routing', middleware: 'middleware', model: 'data-model',
  controller: 'routing', service: 'business-logic', api: 'routing',
  server: 'configuration', app: 'configuration', index: 'entry-point'
};

/**
 * T-06: B1 — Critical File Scoring
 * scoreCriticalFiles(graph, repoPath) → top 5 files with score, reasons, category
 */
function scoreCriticalFiles(graph) {
  const scored = graph.nodes.map(node => {
    let score = node.importedByCount * 3; // Import weight
    const reasons = [];
    const categories = new Set();

    if (node.importedByCount > 0) {
      reasons.push(`Imported by ${node.importedByCount} file(s)`);
    }

    // Keyword scoring
    const nameLower = node.path.toLowerCase();
    for (const [keyword, category] of Object.entries(SCORE_KEYWORDS)) {
      if (nameLower.includes(keyword)) {
        score += 2;
        reasons.push(`Contains keyword "${keyword}"`);
        categories.add(category);
      }
    }

    // File size bonus (larger files tend to be more important)
    // Extension bonus (entry-like extensions)
    if (node.path.endsWith('index.js') || node.path.endsWith('index.ts') ||
        node.path.endsWith('app.js') || node.path.endsWith('server.js')) {
      score += 3;
      reasons.push('Entry-point pattern filename');
      categories.add('entry-point');
    }

    // Determine primary category
    let category = 'business-logic';
    if (categories.has('authentication')) category = 'auth';
    else if (categories.has('database')) category = 'database';
    else if (categories.has('routing')) category = 'routing';
    else if (categories.has('configuration')) category = 'config';
    else if (categories.has('entry-point')) category = 'entry-point';

    return {
      path: node.path,
      score,
      reasons,
      category,
      importedByCount: node.importedByCount
    };
  });

  // Sort by score descending, return top 5
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

/**
 * T-07: B3 — AI Repository Summary Card
 * generateSummary(folderData, entryPoint, criticalFiles) → structured summary
 */
async function generateSummary(folderData, entryPoint, criticalFiles) {
  const folderList = folderData.folders
    .map(f => `${f.path}/ (${f.fileCount} files, ${f.classification}) — ${f.description}`)
    .join('\n');

  const criticalList = criticalFiles
    .map((f, i) => `${i + 1}. ${f.path} [score: ${f.score}, category: ${f.category}]`)
    .join('\n');

  const prompt = `You are an expert software architect. Analyze this repository and produce a structured summary.

FOLDER STRUCTURE:
${folderList}

ENTRY POINT: ${entryPoint?.entryFile || 'Unknown'} (${entryPoint?.language || 'Unknown'})

CRITICAL FILES:
${criticalList}

Return ONLY a raw JSON object (no markdown, no code fences) with these fields:
{
  "techStack": ["technology1", "technology2"],
  "architectureStyle": "MVC | microservices | monolith | layered | event-driven",
  "designPatterns": ["pattern1", "pattern2"],
  "qualitySignals": ["signal1", "signal2"],
  "oneLineSummary": "A single sentence describing this repo"
}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.1 }
    });

    let rawText = response.text.trim();
    if (rawText.startsWith('```')) {
      rawText = rawText.replace(/```json\s*/i, '').replace(/```\s*$/, '').trim();
    }

    const summary = JSON.parse(rawText);
    return {
      success: true,
      ...summary
    };
  } catch (err) {
    console.error('[B3] Summary generation error:', err.message);
    return {
      success: false,
      techStack: [],
      architectureStyle: 'unknown',
      designPatterns: [],
      qualitySignals: [],
      oneLineSummary: 'Summary generation failed — AI service unavailable.'
    };
  }
}

module.exports = { scoreCriticalFiles, generateSummary };
