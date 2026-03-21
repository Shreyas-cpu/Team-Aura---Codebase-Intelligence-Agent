const express = require('express');
const router = express.Router();
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getCached, setCached, checkFileLimit, getCacheStats, clearCache } = require('../services/cache.service');
const { analyzeStructure } = require('../services/structure.service');
const { detectEntryPoint } = require('../services/entrypoint.service');
const { buildDependencyGraph } = require('../services/dependency.service');
const { scoreCriticalFiles, generateSummary } = require('../services/bonus.service');

const DEMO_REPOS = [
  'https://github.com/expressjs/express',
  'https://github.com/tiangolo/fastapi',
  'https://github.com/gothinkster/realworld'
];

// POST /api/preload  — preload all 3 demo repos into cache
router.post('/', async (req, res) => {
  const results = [];

  for (const repoUrl of DEMO_REPOS) {
    // Skip if already cached
    const existing = getCached(repoUrl);
    if (existing) {
      results.push({ repoUrl, status: 'already_cached' });
      continue;
    }

    try {
      console.log(`[Preload] Cloning ${repoUrl}...`);
      const sandboxBase = path.join(os.tmpdir(), 'codeaura_sandbox');
      if (!fs.existsSync(sandboxBase)) fs.mkdirSync(sandboxBase, { recursive: true });

      const sessionId = 'preload_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
      const cloneDir = path.join(sandboxBase, sessionId);

      const git = simpleGit();
      await git.clone(repoUrl, cloneDir, ['--depth', '1', '--single-branch']);

      console.log(`[Preload] Analyzing ${repoUrl}...`);
      const structure = await analyzeStructure(cloneDir);
      const entryPoint = await detectEntryPoint(cloneDir);
      const depGraph = buildDependencyGraph(cloneDir);
      const criticalFiles = scoreCriticalFiles(depGraph);

      let summary;
      try {
        summary = await generateSummary(structure, entryPoint, criticalFiles);
      } catch (e) {
        summary = { success: false, oneLineSummary: 'Summary unavailable' };
      }

      setCached(repoUrl, {
        localPath: cloneDir,
        sessionId,
        structure,
        entryPoint,
        depGraph,
        criticalFiles,
        summary
      });

      results.push({ repoUrl, status: 'preloaded', sessionId });
      console.log(`[Preload] ✓ ${repoUrl} cached`);
    } catch (err) {
      console.error(`[Preload] ✗ ${repoUrl}:`, err.message);
      results.push({ repoUrl, status: 'failed', error: err.message });
    }
  }

  return res.json({ success: true, results, cacheStats: getCacheStats() });
});

// GET /api/preload/status  — check cache status
router.get('/status', (req, res) => {
  return res.json({ success: true, data: getCacheStats() });
});

// POST /api/preload/clear  — clear cache
router.post('/clear', (req, res) => {
  const count = clearCache();
  return res.json({ success: true, cleared: count });
});

module.exports = router;
