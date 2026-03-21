async function run() {
  try {
    const res = await fetch('http://localhost:3001/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: 'test-session-999',
        localPath: __dirname,
        message: 'tell me about the project?'
      })
    });
    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('SUCCESS:', data);
  } catch (err) {
    console.error('FAILED:', err);
  }
}
run();
