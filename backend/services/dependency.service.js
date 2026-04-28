const path = require("path");
const fs = require("fs");

const IGNORE_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  ".next",
  "venv",
  "__pycache__",
  ".venv",
  "env",
  ".cache",
  "coverage",
  ".nyc_output",
  "target",
  "out",
  ".idea",
  ".vs",
]);

const SOURCE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".rb",
  ".go",
  ".java",
  ".cs",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
]);

// Max nodes to show in the graph (focus on important ones)
const MAX_GRAPH_NODES = 40;

/**
 * M3 — Dependency Graph via text-based import scanning
 * Scans for `import`, `from`, `require`, `#include` keywords
 * Returns: { nodes, edges, totalFiles, capped, cappedAt }
 */
function buildDependencyGraph(repoPath) {
  const allFiles = [];
  walkSource(repoPath, allFiles);

  // Map: relative path → node id
  const fileNodeMap = new Map();
  // Map: package/module name → node id (for external deps)
  const externalNodeMap = new Map();
  const nodes = [];
  const edges = [];

  // Register all source files as internal nodes
  for (const filePath of allFiles) {
    const rel = path.relative(repoPath, filePath).replace(/\\/g, "/");
    const ext = path.extname(filePath);
    const label = path.basename(filePath);
    const id = nodes.length;
    nodes.push({
      id,
      label,
      path: rel,
      extension: ext,
      type: "internal",
      importedByCount: 0,
    });
    fileNodeMap.set(rel, id);
  }

  // Helper: get or create an external node
  function getOrCreateExternal(pkgName) {
    if (externalNodeMap.has(pkgName)) return externalNodeMap.get(pkgName);
    const id = nodes.length;
    nodes.push({
      id,
      label: pkgName,
      path: pkgName,
      extension: "",
      type: "external",
      importedByCount: 0,
    });
    externalNodeMap.set(pkgName, id);
    return id;
  }

  const edgeSet = new Set(); // prevent duplicate edges

  function addEdge(sourceId, targetId) {
    if (sourceId === targetId) return;
    const key = `${sourceId}->${targetId}`;
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ source: sourceId, target: targetId });
    nodes[targetId].importedByCount++;
  }

  // Process each file and extract imports
  for (const filePath of allFiles) {
    const rel = path.relative(repoPath, filePath).replace(/\\/g, "/");
    const sourceId = fileNodeMap.get(rel);
    const ext = path.extname(filePath);

    let rawImports = [];
    try {
      if ([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].includes(ext)) {
        rawImports = extractImportsJS(filePath);
      } else if (ext === ".py") {
        rawImports = extractImportsPython(filePath);
      } else if ([".c", ".cpp", ".h", ".hpp"].includes(ext)) {
        rawImports = extractImportsC(filePath);
      } else if (ext === ".java") {
        rawImports = extractImportsJava(filePath);
      } else if (ext === ".go") {
        rawImports = extractImportsGo(filePath);
      }
    } catch (e) {
      /* skip unreadable files */
    }

    for (const imp of rawImports) {
      // Try to resolve to a local file first
      const resolvedRel = resolveToRelative(imp, filePath, repoPath);
      if (resolvedRel && fileNodeMap.has(resolvedRel)) {
        addEdge(sourceId, fileNodeMap.get(resolvedRel));
      } else {
        // It's an external package — normalize the name
        const pkgName = normalizePackageName(imp, ext);
        if (pkgName) {
          const extId = getOrCreateExternal(pkgName);
          addEdge(sourceId, extId);
        }
      }
    }
  }

  // Sort nodes by importedByCount DESC (most depended-on first)
  nodes.sort((a, b) => b.importedByCount - a.importedByCount);

  // Re-index nodes after sort
  const oldToNew = new Map();
  nodes.forEach((n, i) => {
    oldToNew.set(n.id, i);
    n.id = i;
  });
  for (const edge of edges) {
    edge.source = oldToNew.get(edge.source);
    edge.target = oldToNew.get(edge.target);
  }

  // Keep only connected nodes (nodes that appear in at least one edge), cap at MAX
  const connectedIds = new Set();
  for (const edge of edges) {
    connectedIds.add(edge.source);
    connectedIds.add(edge.target);
  }

  // Also keep high-importedByCount nodes even if isolated
  const highImport = nodes
    .filter((n) => n.importedByCount > 0)
    .map((n) => n.id);
  const priorityIds = new Set([...highImport, ...connectedIds]);

  let keptNodes = nodes.filter((n) => priorityIds.has(n.id));
  const capped = keptNodes.length > MAX_GRAPH_NODES;
  if (capped) {
    keptNodes = keptNodes.slice(0, MAX_GRAPH_NODES);
  }

  const keptSet = new Set(keptNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => keptSet.has(e.source) && keptSet.has(e.target),
  );

  return {
    nodes: keptNodes,
    edges: filteredEdges,
    totalFiles: allFiles.length,
    totalNodes: nodes.length,
    capped,
    cappedAt: MAX_GRAPH_NODES,
  };
}

// ── Extractors ───────────────────────────────────────────────────────────────

/**
 * JS/TS: extract from `import ... from 'X'`, `require('X')`, dynamic `import('X')`
 */
function extractImportsJS(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const imports = [];

  // Static ES imports: import ... from 'X'
  const esStatic = /\bimport\b[\s\S]*?\bfrom\b\s*['"`]([^'"`]+)['"`]/g;
  let m;
  while ((m = esStatic.exec(code)) !== null) imports.push(m[1]);

  // Side-effect imports: import 'X'
  const esSide = /\bimport\s+['"`]([^'"`]+)['"`]/g;
  while ((m = esSide.exec(code)) !== null) imports.push(m[1]);

  // Dynamic imports: import('X')
  const esDyn = /\bimport\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((m = esDyn.exec(code)) !== null) imports.push(m[1]);

  // CommonJS: require('X')
  const cjs = /\brequire\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g;
  while ((m = cjs.exec(code)) !== null) imports.push(m[1]);

  return imports;
}

/**
 * Python: `import X`, `from X import Y`
 */
function extractImportsPython(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const imports = [];
  const lines = code.split("\n");

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;

    // from X import Y  or  from .X import Y
    const fromMatch = trimmed.match(/^from\s+([\.\w]+)\s+import/);
    if (fromMatch) {
      imports.push(fromMatch[1]);
      continue;
    }

    // import X, Y, Z
    const impMatch = trimmed.match(/^import\s+(.+)/);
    if (impMatch) {
      impMatch[1].split(",").forEach((s) => {
        const name = s
          .trim()
          .split(/\s+as\s+/)[0]
          .trim();
        if (name) imports.push(name);
      });
    }
  }
  return imports;
}

/**
 * C/C++: #include "local.h" and #include <sys.h>
 */
function extractImportsC(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const imports = [];
  // Local includes with quotes — more likely to resolve
  const localPat = /#include\s+"([^"]+)"/g;
  let m;
  while ((m = localPat.exec(code)) !== null) imports.push(m[1]);
  // System includes with angle brackets — treat as external
  const sysPat = /#include\s+<([^>]+)>/g;
  while ((m = sysPat.exec(code)) !== null) imports.push(m[1]);
  return imports;
}

/**
 * Java: import com.example.Foo
 */
function extractImportsJava(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const imports = [];
  const pat = /^\s*import\s+(static\s+)?([\w\.]+)\s*;/gm;
  let m;
  while ((m = pat.exec(code)) !== null) imports.push(m[2]);
  return imports;
}

/**
 * Go: import "pkg" or import ( "pkg1" \n "pkg2" )
 */
function extractImportsGo(filePath) {
  const code = fs.readFileSync(filePath, "utf8");
  const imports = [];
  const pat = /["'`]([^"'`\s]+)["'`]/g;
  // Only look inside import blocks
  const importBlock =
    code.match(/\bimport\s*\([\s\S]*?\)|\bimport\s+"[^"]+"/g) || [];
  for (const block of importBlock) {
    let m;
    while ((m = pat.exec(block)) !== null) imports.push(m[1]);
  }
  return imports;
}

// ── Resolver ─────────────────────────────────────────────────────────────────

const EXTENSIONS_TO_TRY = [
  "",
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".c",
  ".cpp",
  ".h",
  ".hpp",
  ".java",
  ".go",
];

/**
 * Try to resolve an import string to a relative repo path.
 * Returns null if it can't be resolved to a file in the repo.
 */
function resolveToRelative(importPath, sourceFile, repoPath) {
  const sourceDir = path.dirname(sourceFile);
  const ext = path.extname(sourceFile);

  // Python relative imports (.module, ..module)
  if (ext === ".py" && importPath.startsWith(".")) {
    const cleaned = importPath.replace(/^\.+/, "").replace(/\./g, "/");
    return tryResolve(cleaned, sourceDir, repoPath);
  }

  // JS/TS relative
  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    return tryResolve(importPath, sourceDir, repoPath);
  }

  // C/C++ includes with quotes are relative to source dir
  if ([".c", ".cpp", ".h", ".hpp"].includes(ext)) {
    const bases = [
      sourceDir,
      repoPath,
      path.join(repoPath, "src"),
      path.join(repoPath, "include"),
    ];
    for (const base of bases) {
      const r = tryResolve(importPath, base, repoPath);
      if (r) return r;
    }
    return null;
  }

  return null; // All other non-relative = external
}

function tryResolve(importPath, fromDir, repoPath) {
  const base = path.resolve(fromDir, importPath);

  for (const ext of EXTENSIONS_TO_TRY) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      const rel = path.relative(repoPath, candidate).replace(/\\/g, "/");
      return rel;
    }
  }

  // Try as a directory with index file
  const indexFiles = [
    "index.js",
    "index.ts",
    "index.jsx",
    "index.tsx",
    "__init__.py",
  ];
  for (const idx of indexFiles) {
    const candidate = path.join(base, idx);
    if (fs.existsSync(candidate)) {
      const rel = path.relative(repoPath, candidate).replace(/\\/g, "/");
      return rel;
    }
  }

  return null;
}

/**
 * Normalize external package name to a clean label.
 * Returns null to skip meaningless/empty names.
 */
function normalizePackageName(importStr, srcExt) {
  if (!importStr || importStr.length === 0) return null;

  // Skip internal-looking things
  if (importStr.startsWith(".")) return null;
  if (importStr.startsWith("/")) return null;

  let name = importStr.trim();

  // JS: scoped packages @org/pkg → keep full; others → first segment
  if ([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"].includes(srcExt)) {
    if (name.startsWith("@")) {
      // @org/pkg → @org/pkg
      const parts = name.split("/");
      name = parts.slice(0, 2).join("/");
    } else {
      name = name.split("/")[0];
    }
  }

  // Python: dotted module → top-level package
  if (srcExt === ".py") {
    name = name.split(".")[0];
    if (!name || name.match(/^\d/)) return null;
  }

  // Java: com.example.Class → com.example (top 2 parts)
  if (srcExt === ".java") {
    const parts = name.split(".");
    name = parts.slice(0, Math.min(2, parts.length)).join(".");
  }

  // Go: strip version suffix gopkg.in/X.v2 → X
  if (srcExt === ".go") {
    const parts = name.split("/");
    name = parts[parts.length - 1].replace(/\.v\d+$/, "");
    if (parts.length > 1 && !parts[0].includes(".")) return null; // skip stdlib
  }

  // C/C++: <stdio.h> → stdio (external)
  if ([".c", ".cpp", ".h", ".hpp"].includes(srcExt)) {
    name = name.replace(/\.(h|hpp)$/, "");
    // skip system paths like sys/types
    name = name.split("/").pop();
  }

  // Skip empty, numeric-only, or very short noise
  if (!name || name.length < 2 || /^\d+$/.test(name)) return null;

  return name;
}

// ── Walker ────────────────────────────────────────────────────────────────────

function walkSource(dir, results) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        walkSource(path.join(dir, entry.name), results);
      } else {
        const ext = path.extname(entry.name);
        if (SOURCE_EXTENSIONS.has(ext)) {
          results.push(path.join(dir, entry.name));
        }
      }
    }
  } catch (e) {
    /* permission error */
  }
}

module.exports = { buildDependencyGraph };
