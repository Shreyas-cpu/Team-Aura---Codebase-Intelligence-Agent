require('dotenv').config();
const { generateSummary } = require('./services/bonus.service');

async function test() {
  try {
    const mockFolderData = { folders: [{ path: 'src', fileCount: 15, classification: 'CRITICAL', description: 'Core logic' }] };
    const mockEntryPoint = { entryFile: 'src/index.js', language: 'JavaScript' };
    const mockCriticalFiles = [{ path: 'src/index.js', score: 10, category: 'entry-point' }];
    
    console.log('--- GENERATING SUMMARY ---');
    const result = await generateSummary(mockFolderData, mockEntryPoint, mockCriticalFiles);
    console.dir(result, { depth: null });
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
