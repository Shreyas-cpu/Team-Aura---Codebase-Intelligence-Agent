const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloneRoutes = require('./routes/clone.routes');
const filesRoutes = require('./routes/files.routes');
const analyzeRoutes = require('./routes/analyze.routes');
const chatRoutes = require('./routes/chat.routes');
const preloadRoutes = require('./routes/preload.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeAura Backend', version: '0.6.0' });
});

// ── Routes ──
app.use('/api/clone', cloneRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/preload', preloadRoutes);

// ── Start ──
app.listen(PORT, () => {
  console.log(`⬡ CodeAura backend running on http://localhost:${PORT}`);
});
