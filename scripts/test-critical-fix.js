const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';
const FRONTEND_URL = 'https://masai-hackathon.netlify.app';

console.log('🚀 Testing Critical Fix - App Stability Check');
console.log('=' .repeat(50));

async function testBackendHealth() {
  console.log('\n🔍 Testing Backend Health...');
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend Health:', response.status, response.data);
    return true;
  } catch (error) {
    console.log('❌ Backend Health Failed:', error.message);
    return false;
  }
}

async function testHackathonsEndpoint() {
  console.log('\n🔍 Testing Hackathons Endpoint...');
  try {
    const response = await axios.get(`${BASE_URL}/hackathons`);
    console.log('✅ Hackathons:', response.status, `Found ${response.data.length} hackathons`);
    return response.data.length > 0;
  } catch (error) {
    console.log('❌ Hackathons Failed:', error.message);
    return false;
  }
}

async function testUserLogin() {
  console.log('\n🔍 Testing User Login...');
  try {
    const loginData = {
      email: 'admin@example.com',
      password: 'admin123'
    };
    
    const response = await axios.post(`${BASE_URL}/users/verify-user`, loginData);
    console.log('✅ Login Success:', response.status, 'Token received');
    return response.data.token;
  } catch (error) {
    console.log('❌ Login Failed:', error.message);
    return null;
  }
}

async function testWebSocketConnection() {
  console.log('\n🔍 Testing WebSocket Connection...');
  try {
    // Test WebSocket endpoint availability
    const response = await axios.get(`${BASE_URL}/socket.io/`);
    console.log('✅ WebSocket Endpoint Available:', response.status);
    return true;
  } catch (error) {
    console.log('❌ WebSocket Endpoint Failed:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('\n🔍 Testing Frontend Access...');
  try {
    const response = await axios.get(FRONTEND_URL, { timeout: 10000 });
    console.log('✅ Frontend Accessible:', response.status);
    return true;
  } catch (error) {
    console.log('❌ Frontend Access Failed:', error.message);
    return false;
  }
}

async function runCriticalTests() {
  console.log('\n🚀 Running Critical Stability Tests...');
  
  const results = {
    backendHealth: await testBackendHealth(),
    hackathons: await testHackathonsEndpoint(),
    login: await testUserLogin(),
    websocket: await testWebSocketConnection(),
    frontend: await testFrontendAccess()
  };
  
  console.log('\n📊 Test Results Summary:');
  console.log('=' .repeat(30));
  
  Object.entries(results).forEach(([test, result]) => {
    const status = result ? '✅ PASS' : '❌ FAIL';
    console.log(`${test.padEnd(15)}: ${status}`);
  });
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('\n🎯 Overall Status:');
  if (passedTests === totalTests) {
    console.log('✅ ALL TESTS PASSED - App is stable!');
  } else {
    console.log(`⚠️  ${passedTests}/${totalTests} tests passed - Some issues remain`);
  }
  
  return passedTests === totalTests;
}

// Run the tests
runCriticalTests()
  .then(success => {
    if (success) {
      console.log('\n🎉 CRITICAL FIX SUCCESSFUL! App should be working properly now.');
    } else {
      console.log('\n⚠️  Some issues remain. Please check the specific failing tests above.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('\n💥 Test execution failed:', error.message);
    process.exit(1);
  });
