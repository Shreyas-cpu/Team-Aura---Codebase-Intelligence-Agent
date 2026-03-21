const express = require('express');
const router = express.Router();
const { askCodebase } = require('../services/rag.service');

// POST /api/chat  — { sessionId, localPath, message } → RAG answer
router.post('/', async (req, res) => {
  try {
    const { sessionId, localPath, message } = req.body;

    if (!sessionId || !localPath || !message) {
      return res.status(400).json({ error: 'sessionId, localPath, and message are required.' });
    }

    console.log(`[Chat] ${sessionId}: "${message.substring(0, 60)}..."`);
    const result = await askCodebase(sessionId, localPath, message);
    console.log(`[Chat] ✓ Answered (${result.sources.length} sources)`);

    return res.json({ success: true, data: result });
  } catch (err) {
    console.error('[Chat] ✗ Error:', err.message);
    return res.status(500).json({ error: 'Chat query failed.' });
  }
});

module.exports = router;
