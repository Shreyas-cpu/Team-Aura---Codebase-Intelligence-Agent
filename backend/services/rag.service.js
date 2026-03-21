const path = require('path');
const fs = require('fs');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SOURCE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.py', '.rb', '.go', '.java', '.cs',
  '.json', '.md', '.yaml', '.yml', '.toml'
]);

const IGNORE_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', '.next',
  'venv', '__pycache__', '.venv', 'env', '.cache',
  'coverage', '.nyc_output', 'target', 'out'
]);

// ── In-memory store per session ──
const sessionStore = new Map(); // sessionId → { chunks: [{text, filePath, embedding}] }

/**
 * T-05 Step 1: chunkCodebase — read all source files, split into ~200 token chunks
 */
function chunkCodebase(repoPath, maxFiles = 500) {
  const files = [];
  walkForRAG(repoPath, repoPath, files);

  // Sort by importance: shorter paths first (likely more central), then alphabetical
  files.sort((a, b) => {
    const depthA = a.split('/').length;
    const depthB = b.split('/').length;
    return depthA - depthB || a.localeCompare(b);
  });

  // Cap files
  const selectedFiles = files.slice(0, maxFiles);
  const chunks = [];

  for (const filePath of selectedFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(repoPath, filePath).replace(/\\/g, '/');

      // Skip very large files (> 50KB)
      if (content.length > 50000) continue;

      // Split into ~200 token chunks (approx 800 chars)
      const CHUNK_SIZE = 800;
      const OVERLAP = 100;

      if (content.length <= CHUNK_SIZE) {
        chunks.push({ text: content, filePath: relativePath, chunkIndex: 0 });
      } else {
        let start = 0;
        let idx = 0;
        while (start < content.length) {
          const end = Math.min(start + CHUNK_SIZE, content.length);
          chunks.push({
            text: content.substring(start, end),
            filePath: relativePath,
            chunkIndex: idx
          });
          start += CHUNK_SIZE - OVERLAP;
          idx++;
        }
      }
    } catch (e) { /* skip unreadable */ }
  }

  console.log(`[RAG] Chunked ${selectedFiles.length} files → ${chunks.length} chunks`);
  return chunks;
}

/**
 * T-05 Step 2: embedChunks — call Gemini text-embedding-004
 */
async function embedChunks(chunks, batchSize = 50) {
  const embedded = [];

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    try {
      const response = await ai.models.embedContent({
        model: 'text-embedding-004',
        contents: batch.map(c => c.text)
      });

      // Handle both single and batch responses
      if (response.embeddings) {
        for (let j = 0; j < batch.length; j++) {
          embedded.push({
            ...batch[j],
            embedding: response.embeddings[j]?.values || null
          });
        }
      } else if (response.embedding) {
        // Single result
        embedded.push({
          ...batch[0],
          embedding: response.embedding.values || null
        });
      }
    } catch (err) {
      console.error(`[RAG] Embedding batch ${i} failed:`, err.message);
      // Fallback: store without embeddings, will use keyword search
      for (const chunk of batch) {
        embedded.push({ ...chunk, embedding: null });
      }
    }
  }

  console.log(`[RAG] Embedded ${embedded.filter(e => e.embedding).length}/${embedded.length} chunks`);
  return embedded;
}

/**
 * T-05 Step 3: semanticSearch — cosine similarity between query and all chunks
 */
async function semanticSearch(query, embeddedChunks, topK = 5) {
  // First try embedding-based search
  try {
    const queryResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      contents: query
    });

    const queryEmbedding = queryResponse.embedding?.values;
    if (queryEmbedding) {
      const scored = embeddedChunks
        .filter(c => c.embedding)
        .map(chunk => ({
          ...chunk,
          score: cosineSimilarity(queryEmbedding, chunk.embedding)
        }))
        .sort((a, b) => b.score - a.score);

      return scored.slice(0, topK);
    }
  } catch (err) {
    console.error('[RAG] Query embedding failed, falling back to keyword search:', err.message);
  }

  // Fallback: keyword-based search
  return keywordSearch(query, embeddedChunks, topK);
}

/**
 * Keyword-based fallback search
 */
function keywordSearch(query, chunks, topK) {
  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  const scored = chunks.map(chunk => {
    const textLower = chunk.text.toLowerCase();
    const pathLower = chunk.filePath.toLowerCase();
    let score = 0;

    for (const word of queryWords) {
      // Count occurrences in text
      const regex = new RegExp(word, 'gi');
      const textMatches = (textLower.match(regex) || []).length;
      score += textMatches * 2;

      // Bonus for path match
      if (pathLower.includes(word)) score += 5;
    }

    return { ...chunk, score };
  })
  .filter(c => c.score > 0)
  .sort((a, b) => b.score - a.score);

  return scored.slice(0, topK);
}

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const magnitude = Math.sqrt(magA) * Math.sqrt(magB);
  return magnitude === 0 ? 0 : dot / magnitude;
}

/**
 * T-05 Step 4+5: Full RAG Q&A — index if needed, search, prompt Gemini
 */
async function askCodebase(sessionId, localPath, question) {
  // Index if first query for this session
  if (!sessionStore.has(sessionId)) {
    console.log(`[RAG] First query for session ${sessionId}, indexing...`);
    const chunks = chunkCodebase(localPath);
    const embedded = await embedChunks(chunks);
    sessionStore.set(sessionId, { chunks: embedded, localPath });
    console.log(`[RAG] Session ${sessionId} indexed: ${embedded.length} chunks`);
  }

  const store = sessionStore.get(sessionId);
  const topChunks = await semanticSearch(question, store.chunks, 5);

  if (topChunks.length === 0) {
    return {
      answer: 'I could not find relevant code to answer your question. Try rephrasing or asking about specific files or functions.',
      sources: []
    };
  }

  // Build context from top chunks
  const context = topChunks.map((c, i) =>
    `--- FILE: ${c.filePath} (chunk ${c.chunkIndex}) ---\n${c.text}`
  ).join('\n\n');

  const sources = [...new Set(topChunks.map(c => c.filePath))];

  // Gemini RAG prompt
  const prompt = `You are a senior software engineer explaining a codebase to a new developer.
Use the following code snippets as context to answer the question. Reference specific file names and line content.
Be concise but thorough. If the answer isn't in the context, say so.

CONTEXT:
${context}

QUESTION: ${question}

Answer in markdown format with code references.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { temperature: 0.2 }
    });

    return {
      answer: response.text,
      sources
    };
  } catch (err) {
    console.error('[RAG] Gemini answer error:', err.message);
    return {
      answer: 'AI service is temporarily unavailable. Please try again.',
      sources
    };
  }
}

// ── File walker for RAG ──
function walkForRAG(dir, repoPath, results) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (IGNORE_DIRS.has(entry.name)) continue;
        walkForRAG(path.join(dir, entry.name), repoPath, results);
      } else {
        const ext = path.extname(entry.name);
        if (SOURCE_EXTENSIONS.has(ext)) {
          results.push(path.join(dir, entry.name));
        }
      }
    }
  } catch (e) { /* */ }
}

module.exports = { askCodebase, sessionStore };
