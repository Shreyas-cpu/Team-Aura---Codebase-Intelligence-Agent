/**
 * T-10: In-memory result caching + preload endpoint
 * Cache structure: Map<repoUrl, { structure, entrypoint, deps, critical, summary, timestamp }>
 */

const analysisCache = new Map();

const CACHE_TTL = 30 * 60 * 1000; // 30 minutes
const MAX_FILES_LIMIT = 5000;

/**
 * Get cached result for a repo URL
 */
function getCached(repoUrl) {
  if (!analysisCache.has(repoUrl)) return null;

  const entry = analysisCache.get(repoUrl);

  // Check TTL
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    analysisCache.delete(repoUrl);
    return null;
  }

  return entry;
}

/**
 * Store analysis results in cache
 */
function setCached(repoUrl, results) {
  analysisCache.set(repoUrl, {
    ...results,
    timestamp: Date.now(),
    cached: true
  });
  console.log(`[Cache] Stored results for ${repoUrl} (${analysisCache.size} entries total)`);
}

/**
 * Check if repo is too large (> MAX_FILES_LIMIT)
 */
function checkFileLimit(fileCount) {
  if (fileCount > MAX_FILES_LIMIT) {
    return {
      allowed: false,
      message: `Repository has ${fileCount} files, which exceeds the ${MAX_FILES_LIMIT} file limit. Please try a smaller repository.`
    };
  }
  return { allowed: true };
}

/**
 * Clear all cache entries
 */
function clearCache() {
  const count = analysisCache.size;
  analysisCache.clear();
  return count;
}

/**
 * Get cache stats
 */
function getCacheStats() {
  return {
    entries: analysisCache.size,
    repos: [...analysisCache.keys()],
    memoryMB: (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)
  };
}

module.exports = { getCached, setCached, checkFileLimit, clearCache, getCacheStats, MAX_FILES_LIMIT };
