const express = require('express');
const router = express.Router();
const simpleGit = require('simple-git');
const path = require('path');
const fs = require('fs');
const os = require('os');

// POST /api/clone  — { repoUrl } → clone repo, return session ID + local path
router.post('/', async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl || !repoUrl.startsWith('https://github.com/')) {
      return res.status(400).json({ error: 'A valid GitHub HTTPS URL is required.' });
    }

    // Create sandbox directory
    const sandboxBase = path.join(os.tmpdir(), 'codeaura_sandbox');
    if (!fs.existsSync(sandboxBase)) {
      fs.mkdirSync(sandboxBase, { recursive: true });
    }

    // Unique ID for this session
    const sessionId = Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    const cloneDir = path.join(sandboxBase, sessionId);

    console.log(`[clone] ${repoUrl} → ${cloneDir}`);

    const git = simpleGit();
    await git.clone(repoUrl, cloneDir, ['--depth', '1', '--single-branch']);

    console.log(`[clone] ✓ Success`);

    return res.json({
      success: true,
      sessionId,
      localPath: cloneDir,
      repoUrl
    });

  } catch (err) {
    console.error('[clone] ✗ Failed:', err.message);
    return res.status(500).json({ error: 'Failed to clone repository. Ensure the URL is valid and public.' });
  }
});

module.exports = router;
