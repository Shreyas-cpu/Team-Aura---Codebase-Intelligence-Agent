const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Directories to ignore during file tree walk
const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  'venv', '__pycache__', '.venv', 'env', '.cache',
  'coverage', '.nyc_output', 'target', 'out'
]);

// Walk directory recursively, return file tree JSON
function walkDir(dirPath, basePath, depth = 0, maxDepth = 6) {
  if (depth > maxDepth) return [];

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const result = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(basePath, fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      if (IGNORE_DIRS.has(entry.name)) continue;

      const children = walkDir(fullPath, basePath, depth + 1, maxDepth);
      result.push({
        name: entry.name,
        path: relativePath,
        type: 'directory',
        children,
        fileCount: countFiles(children)
      });
    } else {
      result.push({
        name: entry.name,
        path: relativePath,
        type: 'file',
        extension: path.extname(entry.name),
        size: fs.statSync(fullPath).size
      });
    }
  }

  return result;
}

// Count total files in a tree
function countFiles(children) {
  let count = 0;
  for (const child of children) {
    if (child.type === 'file') count++;
    else if (child.children) count += child.fileCount || 0;
  }
  return count;
}

// POST /api/files  — { localPath } → returns file tree JSON
router.post('/', (req, res) => {
  try {
    const { localPath } = req.body;

    if (!localPath || !fs.existsSync(localPath)) {
      return res.status(400).json({ error: 'Invalid or missing localPath.' });
    }

    console.log(`[files] Walking ${localPath}`);

    const tree = walkDir(localPath, localPath);

    // Count total files
    const totalFiles = countFiles(tree);

    console.log(`[files] ✓ ${totalFiles} files found`);

    return res.json({
      success: true,
      totalFiles,
      tree
    });

  } catch (err) {
    console.error('[files] ✗ Failed:', err.message);
    return res.status(500).json({ error: 'Failed to read file tree.' });
  }
});

module.exports = router;
