const path = require('path');
const fs = require('fs');
const acorn = require('acorn');

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  'venv', '__pycache__', '.venv', 'env', '.cache',
  'coverage', '.nyc_output', 'target', 'out'
]);

const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.java', '.cs',
  '.c', '.cpp', '.h', '.hpp'
]);

/**
 * T-04: M3 — AST Import Extraction + Dependency Graph
 * buildDependencyGraph(repoPath) → { nodes:[], edges:[] }
 */
function buildDependencyGraph(repoPath) {
  const allFiles = [];
  walkSource(repoPath, repoPath, allFiles);

  const nodes = [];   // { id, path, extension, importedByCount }
  const edges = [];   // { source, target }
  const nodeMap = new Map(); // relativePath → node index

  // Register all source files as nodes
  for (const filePath of allFiles) {
    const rel = path.relative(repoPath, filePath).replace(/\\/g, '/');
    const ext = path.extname(filePath);
    const idx = nodes.length;
    nodes.push({ id: idx, path: rel, extension: ext, importedByCount: 0 });
    nodeMap.set(rel, idx);
  }

  // Extract imports per file and build edges
  for (const filePath of allFiles) {
    const rel = path.relative(repoPath, filePath).replace(/\\/g, '/');
    const sourceIdx = nodeMap.get(rel);
    const ext = path.extname(filePath);

    let imports = [];
    if (['.js', '.jsx', '.mjs', '.cjs'].includes(ext)) {
      imports = extractImportsJS(filePath);
    } else if (['.ts', '.tsx'].includes(ext)) {
      imports = extractImportsTS(filePath);
    } else if (ext === '.py') {
      imports = extractImportsPython(filePath);
    } else if (['.c', '.cpp', '.h', '.hpp'].includes(ext)) {
      imports = extractImportsC(filePath);
    }

    // Resolve each import to a node
    for (const imp of imports) {
      const resolved = resolveImport(imp, filePath, repoPath);
      if (!resolved) continue;

      const resolvedRel = path.relative(repoPath, resolved).replace(/\\/g, '/');
      const targetIdx = nodeMap.get(resolvedRel);
      if (targetIdx !== undefined && targetIdx !== sourceIdx) {
        edges.push({ source: sourceIdx, target: targetIdx });
        nodes[targetIdx].importedByCount++;
      }
    }
  }

  // Score and sort nodes by importedByCount descending
  nodes.sort((a, b) => b.importedByCount - a.importedByCount);

  // Re-index after sort
  const oldToNew = new Map();
  nodes.forEach((n, i) => { oldToNew.set(n.id, i); n.id = i; });
  for (const edge of edges) {
    edge.source = oldToNew.get(edge.source);
    edge.target = oldToNew.get(edge.target);
  }

  // Cap at top 100 nodes for large repos
  if (nodes.length > 100) {
    const keep = new Set(nodes.slice(0, 100).map(n => n.id));
    const filteredEdges = edges.filter(e => keep.has(e.source) && keep.has(e.target));
    return { nodes: nodes.slice(0, 100), edges: filteredEdges, totalFiles: allFiles.length, capped: true };
  }

  return { nodes, edges, totalFiles: allFiles.length, capped: false };
}

/**
 * extractImportsJS — use acorn to parse ES modules + CommonJS require()
 */
function extractImportsJS(filePath) {
  const imports = [];
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const ast = acorn.parse(code, {
      sourceType: 'module',
      ecmaVersion: 'latest',
      allowHashBang: true,
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true
    });

    for (const node of ast.body) {
      // import ... from 'xxx'
      if (node.type === 'ImportDeclaration' && node.source && node.source.value) {
        imports.push(node.source.value);
      }

      // const x = require('xxx')
      if (node.type === 'VariableDeclaration') {
        for (const decl of node.declarations) {
          if (decl.init && decl.init.type === 'CallExpression' &&
              decl.init.callee && decl.init.callee.name === 'require' &&
              decl.init.arguments.length > 0 && decl.init.arguments[0].type === 'Literal') {
            imports.push(decl.init.arguments[0].value);
          }
        }
      }

      // module.exports = require('xxx') or standalone require calls
      if (node.type === 'ExpressionStatement' && node.expression) {
        findRequireCalls(node.expression, imports);
      }
    }
  } catch (e) {
    // Fallback to regex if acorn parse fails (e.g., JSX, Flow)
    return extractImportsRegex(filePath);
  }
  return imports;
}

/**
 * extractImportsTS — regex fallback for TypeScript (acorn doesn't parse TS)
 */
function extractImportsTS(filePath) {
  return extractImportsRegex(filePath);
}

/**
 * Regex-based import extractor (fallback for TS/JSX)
 */
function extractImportsRegex(filePath) {
  const imports = [];
  try {
    const code = fs.readFileSync(filePath, 'utf8');

    // ES imports
    const esPattern = /import\s+.*?\s+from\s+['"](.+?)['"]/g;
    let m;
    while ((m = esPattern.exec(code)) !== null) imports.push(m[1]);

    // Dynamic imports
    const dynPattern = /import\s*\(\s*['"](.+?)['"]\s*\)/g;
    while ((m = dynPattern.exec(code)) !== null) imports.push(m[1]);

    // CommonJS requires
    const cjsPattern = /require\s*\(\s*['"](.+?)['"]\s*\)/g;
    while ((m = cjsPattern.exec(code)) !== null) imports.push(m[1]);
  } catch (e) { /* unreadable */ }
  return imports;
}

/**
 * extractImportsPython — regex on import/from statements
 */
function extractImportsPython(filePath) {
  const imports = [];
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const lines = code.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#')) continue;

      // from .module import x  OR  from module import x
      const fromMatch = trimmed.match(/^from\s+(\.+\S*|\S+)\s+import/);
      if (fromMatch) {
        imports.push(fromMatch[1]);
        continue;
      }

      // import module
      const impMatch = trimmed.match(/^import\s+(\S+)/);
      if (impMatch) {
        imports.push(impMatch[1].split(',')[0].trim());
      }
    }
  } catch (e) { /* unreadable */ }
  return imports;
}

/**
 * extractImportsC — regex on local #include statements
 */
function extractImportsC(filePath) {
  const imports = [];
  try {
    const code = fs.readFileSync(filePath, 'utf8');
    const cPattern = /#include\s+["'](.+?)["']/g;
    let m;
    while ((m = cPattern.exec(code)) !== null) imports.push(m[1]);
  } catch (e) { /* unreadable */ }
  return imports;
}

// ── Helpers ──

function findRequireCalls(node, imports) {
  if (!node || typeof node !== 'object') return;
  if (node.type === 'CallExpression' && node.callee &&
      node.callee.name === 'require' &&
      node.arguments.length > 0 && node.arguments[0].type === 'Literal') {
    imports.push(node.arguments[0].value);
  }
  // Recurse into assignment right-hand side
  if (node.right) findRequireCalls(node.right, imports);
  if (node.arguments) node.arguments.forEach(a => findRequireCalls(a, imports));
}

function resolveImport(importPath, sourceFile, repoPath) {
  // Only resolve relative imports (skip npm packages)
  if (!importPath.startsWith('.') && !importPath.startsWith('/')) {
    // For Python relative imports (starting with dots)
    if (path.extname(sourceFile) === '.py' && importPath.startsWith('.')) {
      // Handle Python relative imports
    } else {
      return null;
    }
  }

  const sourceDir = path.dirname(sourceFile);
  let resolved = path.resolve(sourceDir, importPath);

  // Try file extensions
  const tryExts = ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.py', '.c', '.cpp', '.h', '.hpp', ''];
  for (const ext of tryExts) {
    const tryPath = resolved + ext;
    if (fs.existsSync(tryPath) && fs.statSync(tryPath).isFile()) {
      return tryPath;
    }
  }

  // Try index files in directory
  const indexFiles = ['index.js', 'index.ts', 'index.jsx', 'index.tsx', '__init__.py'];
  for (const idx of indexFiles) {
    const tryPath = path.join(resolved, idx);
    if (fs.existsSync(tryPath)) return tryPath;
  }

  return null;
}

function walkSource(dir, repoPath, results) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        walkSource(path.join(dir, entry.name), repoPath, results);
      } else {
        const ext = path.extname(entry.name);
        if (SOURCE_EXTENSIONS.has(ext)) {
          results.push(path.join(dir, entry.name));
        }
      }
    }
  } catch (e) { /* permission error */ }
}

module.exports = { buildDependencyGraph };
