const express = require('express');
const router = express.Router();
const { analyzeStructure } = require('../services/structure.service');
const { detectEntryPoint } = require('../services/entrypoint.service');

// POST /api/analyze/structure  — M1: Folder structure analysis
router.post('/structure', async (req, res) => {
  try {
    const { localPath } = req.body;
    if (!localPath) {
      return res.status(400).json({ error: 'localPath is required.' });
    }

    console.log('[M1] Analyzing structure:', localPath);
    const result = await analyzeStructure(localPath);
    console.log(`[M1] ✓ ${result.folders.length} folders analyzed`);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[M1] ✗ Error:', err.message);
    return res.status(500).json({ error: 'Folder structure analysis failed.' });
  }
});

// POST /api/analyze/entrypoint  — M2: Entry point detection
router.post('/entrypoint', async (req, res) => {
  try {
    const { localPath } = req.body;
    if (!localPath) {
      return res.status(400).json({ error: 'localPath is required.' });
    }

    console.log('[M2] Detecting entry point:', localPath);
    const result = await detectEntryPoint(localPath);
    console.log(`[M2] ✓ Entry: ${result.entryFile || 'not found'}`);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[M2] ✗ Error:', err.message);
    return res.status(500).json({ error: 'Entry point detection failed.' });
  }
});

module.exports = router;
