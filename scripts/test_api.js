async function testApi() {
  try {
    const res = await fetch('http://127.0.0.1:3001/api/test-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'E2E Verification Test',
        expectedResult: 'Schema and Server connected',
        status: 'NoRun'
      })
    });
    const data = await res.json();
    console.log('API Response:', data);
    
    const listRes = await fetch('http://localhost:3000/api/test-items');
    const listData = await listRes.json();
    console.log('Current Test Items:', listData.items.length);
  } catch (e) {
    console.error('Test failed:', e.message);
  }
}

testApi();
