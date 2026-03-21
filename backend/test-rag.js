require('dotenv').config();
const { askCodebase } = require('./services/rag.service');
const path = require('path');

async function run() {
  try {
    // mock parameters mimicking a real frontend request
    const sessionId = 'test-session-123';
    const localPath = path.join(__dirname, 'services'); // use backend/services folder as mock repo
    const message = 'tell me about the project?';

    console.log(`Testing askCodebase("${sessionId}", "${localPath}", "${message}")`);
    const result = await askCodebase(sessionId, localPath, message);
    console.log('--- RESULT ---');
    console.log(result);
  } catch (e) {
    console.error('--- FATAL SCRPT ERROR ---');
    console.error(e);
  }
}

run();
