const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cloneRoutes = require('./routes/clone.routes');
const filesRoutes = require('./routes/files.routes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'CodeAura Backend', version: '0.1.0' });
});

// ── Routes ──
app.use('/api/clone', cloneRoutes);
app.use('/api/files', filesRoutes);

// ── Start ──
app.listen(PORT, () => {
  console.log(`⬡ CodeAura backend running on http://localhost:${PORT}`);
});
