import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5009';

async function testBasicConnection() {
  console.log('🔍 Testing basic backend connection...');
  
  try {
    // Test if backend is running
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@test.com',
        password: 'test123'
      })
    });
    
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}`);
    
    if (response.status === 400 || response.status === 401) {
      console.log('✅ Backend is running (got expected auth error)');
    } else {
      console.log('⚠️ Unexpected response from backend');
    }
    
  } catch (error) {
    console.log(`❌ Backend connection failed: ${error.message}`);
  }
}

testBasicConnection();
