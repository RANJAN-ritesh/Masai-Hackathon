#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'https://masai-hackathon.onrender.com';
const FRONTEND_URL = 'https://masai-hackathon.netlify.app';

console.log('🧪 STARTING COMPREHENSIVE PRODUCTION TESTING');
console.log('=' .repeat(60));

// Test configuration
const testConfig = {
  // Test user credentials (from handover document)
  adminUser: {
    email: 'admin@example.com',
    password: 'password123'
  },
  leaderUser: {
    email: 'kevin.p11@example.com', 
    password: 'password123'
  },
  memberUser: {
    email: 'hannah.n8@example.com',
    password: 'password123'
  }
};

// Utility function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, details = '') {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status} ${name}`);
  if (details) console.log(`   ${details}`);
  
  testResults.tests.push({ name, passed, details });
  if (passed) testResults.passed++;
  else testResults.failed++;
}

async function runTests() {
  console.log('\n🔍 PHASE 1: BACKEND INFRASTRUCTURE TESTS');
  console.log('-'.repeat(40));

  // Test 1: Health Check
  try {
    const health = await makeRequest(`${BASE_URL}/health`);
    logTest('Backend Health Check', health.status === 200, 
      `Status: ${health.status}, WebSocket: ${health.data.websocketService}`);
  } catch (error) {
    logTest('Backend Health Check', false, `Error: ${error.message}`);
  }

  // Test 2: CORS Test
  try {
    const cors = await makeRequest(`${BASE_URL}/cors-test`);
    logTest('CORS Configuration', cors.status === 200, 
      `Status: ${cors.status}, Message: ${cors.data.message}`);
  } catch (error) {
    logTest('CORS Configuration', false, `Error: ${error.message}`);
  }

  // Test 3: Frontend Accessibility
  try {
    const frontend = await makeRequest(FRONTEND_URL);
    logTest('Frontend Deployment', frontend.status === 200, 
      `Status: ${frontend.status}, Content-Type: ${frontend.headers['content-type']}`);
  } catch (error) {
    logTest('Frontend Deployment', false, `Error: ${error.message}`);
  }

  console.log('\n🔍 PHASE 2: AUTHENTICATION TESTS');
  console.log('-'.repeat(40));

  // Test 4: User Verification (Admin)
  try {
    const adminAuth = await makeRequest(`${BASE_URL}/users/verify-user`, {
      method: 'POST',
      body: testConfig.adminUser
    });
    logTest('Admin Authentication', adminAuth.status === 200, 
      `Status: ${adminAuth.status}, User: ${adminAuth.data.user?.name}`);
  } catch (error) {
    logTest('Admin Authentication', false, `Error: ${error.message}`);
  }

  // Test 5: User Verification (Leader)
  try {
    const leaderAuth = await makeRequest(`${BASE_URL}/users/verify-user`, {
      method: 'POST',
      body: testConfig.leaderUser
    });
    logTest('Leader Authentication', leaderAuth.status === 200, 
      `Status: ${leaderAuth.status}, User: ${leaderAuth.data.user?.name}`);
  } catch (error) {
    logTest('Leader Authentication', false, `Error: ${error.message}`);
  }

  // Test 6: User Verification (Member)
  try {
    const memberAuth = await makeRequest(`${BASE_URL}/users/verify-user`, {
      method: 'POST',
      body: testConfig.memberUser
    });
    logTest('Member Authentication', memberAuth.status === 200, 
      `Status: ${memberAuth.status}, User: ${memberAuth.data.user?.name}`);
  } catch (error) {
    logTest('Member Authentication', false, `Error: ${error.message}`);
  }

  console.log('\n🔍 PHASE 3: HACKATHON MANAGEMENT TESTS');
  console.log('-'.repeat(40));

  // Test 7: Get Hackathons
  try {
    const hackathons = await makeRequest(`${BASE_URL}/hackathons`);
    logTest('Hackathon List', hackathons.status === 200, 
      `Status: ${hackathons.status}, Count: ${hackathons.data.length || 0}`);
  } catch (error) {
    logTest('Hackathon List', false, `Error: ${error.message}`);
  }

  // Test 8: Get Participants (if hackathons exist)
  try {
    const hackathons = await makeRequest(`${BASE_URL}/hackathons`);
    if (hackathons.status === 200 && hackathons.data.length > 0) {
      const firstHackathon = hackathons.data[0];
      const participants = await makeRequest(`${BASE_URL}/participants/${firstHackathon._id}`);
      logTest('Participants List', participants.status === 200, 
        `Status: ${participants.status}, Hackathon: ${firstHackathon.title}, Count: ${participants.data.count || 0}`);
    } else {
      logTest('Participants List', true, 'No hackathons available for testing');
    }
  } catch (error) {
    logTest('Participants List', false, `Error: ${error.message}`);
  }

  console.log('\n🔍 PHASE 4: TEAM MANAGEMENT TESTS');
  console.log('-'.repeat(40));

  // Test 9: Get Teams (if hackathons exist)
  try {
    const hackathons = await makeRequest(`${BASE_URL}/hackathons`);
    if (hackathons.status === 200 && hackathons.data.length > 0) {
      const firstHackathon = hackathons.data[0];
      const teams = await makeRequest(`${BASE_URL}/team/hackathon/${firstHackathon._id}`);
      logTest('Teams List', teams.status === 200, 
        `Status: ${teams.status}, Hackathon: ${firstHackathon.title}, Count: ${teams.data.teams?.length || 0}`);
    } else {
      logTest('Teams List', true, 'No hackathons available for testing');
    }
  } catch (error) {
    logTest('Teams List', false, `Error: ${error.message}`);
  }

  console.log('\n🔍 PHASE 5: NOTIFICATION SYSTEM TESTS');
  console.log('-'.repeat(40));

  // Test 10: Notification Service (requires authentication)
  try {
    // First authenticate as admin
    const adminAuth = await makeRequest(`${BASE_URL}/users/verify-user`, {
      method: 'POST',
      body: testConfig.adminUser
    });
    
    if (adminAuth.status === 200 && adminAuth.data.user?._id) {
      const notifications = await makeRequest(`${BASE_URL}/notifications/${adminAuth.data.user._id}`, {
        headers: {
          'Authorization': `Bearer ${adminAuth.data.user._id}`
        }
      });
      logTest('Notification Service', notifications.status === 200, 
        `Status: ${notifications.status}, User: ${adminAuth.data.user.name}`);
    } else {
      logTest('Notification Service', false, 'Authentication failed');
    }
  } catch (error) {
    logTest('Notification Service', false, `Error: ${error.message}`);
  }

  console.log('\n🔍 PHASE 6: WEBSOCKET INFRASTRUCTURE TESTS');
  console.log('-'.repeat(40));

  // Test 11: WebSocket Service Status
  try {
    const health = await makeRequest(`${BASE_URL}/health`);
    const websocketRunning = health.data.websocketService === 'running';
    logTest('WebSocket Service', websocketRunning, 
      `Status: ${health.data.websocketService}, Environment: ${health.data.environment}`);
  } catch (error) {
    logTest('WebSocket Service', false, `Error: ${error.message}`);
  }

  console.log('\n🔍 PHASE 7: DEBUG ENDPOINTS TESTS');
  console.log('-'.repeat(40));

  // Test 12: Debug Authentication Endpoint
  try {
    const debugAuth = await makeRequest(`${BASE_URL}/participant-team/debug-auth`, {
      headers: {
        'Authorization': 'Bearer test-user-id'
      }
    });
    logTest('Debug Auth Endpoint', debugAuth.status === 401, 
      `Status: ${debugAuth.status} (Expected 401 for invalid token)`);
  } catch (error) {
    logTest('Debug Auth Endpoint', false, `Error: ${error.message}`);
  }

  // Test 13: Test Participants Endpoint
  try {
    const hackathons = await makeRequest(`${BASE_URL}/hackathons`);
    if (hackathons.status === 200 && hackathons.data.length > 0) {
      const firstHackathon = hackathons.data[0];
      const testParticipants = await makeRequest(`${BASE_URL}/participant-team/test-participants/${firstHackathon._id}`);
      logTest('Test Participants Endpoint', testParticipants.status === 200, 
        `Status: ${testParticipants.status}, Hackathon: ${firstHackathon.title}`);
    } else {
      logTest('Test Participants Endpoint', true, 'No hackathons available for testing');
    }
  } catch (error) {
    logTest('Test Participants Endpoint', false, `Error: ${error.message}`);
  }

  // Print final results
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);

  if (testResults.failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   - ${test.name}: ${test.details}`);
    });
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  if (testResults.failed === 0) {
    console.log('   ✅ All tests passed! The system is ready for production use.');
  } else {
    console.log('   🔧 Some tests failed. Review the failed tests above and fix issues.');
    console.log('   🧪 Run manual testing on the frontend to verify user experience.');
  }

  console.log('\n🌐 PRODUCTION URLs:');
  console.log(`   Frontend: ${FRONTEND_URL}`);
  console.log(`   Backend: ${BASE_URL}`);
  console.log(`   Health Check: ${BASE_URL}/health`);

  process.exit(testResults.failed > 0 ? 1 : 0);
}

// Run the tests
runTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
