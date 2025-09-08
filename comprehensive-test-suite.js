// COMPREHENSIVE APPLICATION TEST SUITE - EXTREME PREJUDICE TESTING
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

// Test results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error?.message || error });
    console.log(`❌ ${testName}: ${error?.message || error}`);
  }
}

async function testBackendHealth() {
  console.log('🏥 TESTING BACKEND HEALTH...\n');
  
  try {
    const response = await axios.get(`${BASE_URL}/health`);
    logTest('Backend Health Check', response.status === 200);
  } catch (error) {
    logTest('Backend Health Check', false, error);
  }
}

async function testUserAuthentication() {
  console.log('\n🔐 TESTING USER AUTHENTICATION...\n');
  
  // Test 1: User Registration/Creation
  try {
    const createResponse = await axios.post(`${BASE_URL}/users/create-user`, {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      course: 'Full Stack',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development'
    });
    logTest('User Creation', createResponse.status === 200 || createResponse.status === 201);
  } catch (error) {
    logTest('User Creation', false, error);
  }
  
  // Test 2: User Login
  let authToken = null;
  try {
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'testuser@example.com',
      password: 'password123'
    });
    authToken = loginResponse.data.token;
    logTest('User Login', loginResponse.status === 200 && !!authToken);
  } catch (error) {
    logTest('User Login', false, error);
  }
  
  // Test 3: Token Validation
  if (authToken) {
    try {
      const validateResponse = await axios.get(`${BASE_URL}/users/get-user/test`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      logTest('Token Validation', validateResponse.status === 200 || validateResponse.status === 404);
    } catch (error) {
      logTest('Token Validation', false, error);
    }
  }
  
  return authToken;
}

async function testHackathonManagement(authToken) {
  console.log('\n🏆 TESTING HACKATHON MANAGEMENT...\n');
  
  if (!authToken) {
    logTest('Hackathon Management', false, 'No auth token');
    return;
  }
  
  // Test 1: Get Hackathons
  try {
    const hackathonsResponse = await axios.get(`${BASE_URL}/hackathons`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Get Hackathons', hackathonsResponse.status === 200);
  } catch (error) {
    logTest('Get Hackathons', false, error);
  }
  
  // Test 2: Create Hackathon
  try {
    const createHackathonResponse = await axios.post(`${BASE_URL}/hackathons`, {
      title: 'Test Hackathon',
      description: 'Test Description',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      allowParticipantTeams: true,
      teamCreationMode: 'participant'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Create Hackathon', createHackathonResponse.status === 200 || createHackathonResponse.status === 201);
  } catch (error) {
    logTest('Create Hackathon', false, error);
  }
}

async function testTeamManagement(authToken) {
  console.log('\n👥 TESTING TEAM MANAGEMENT...\n');
  
  if (!authToken) {
    logTest('Team Management', false, 'No auth token');
    return null;
  }
  
  let teamId = null;
  
  // Test 1: Get Teams
  try {
    const teamsResponse = await axios.get(`${BASE_URL}/team/get-teams`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Get Teams', teamsResponse.status === 200);
    
    if (teamsResponse.data && teamsResponse.data.length > 0) {
      teamId = teamsResponse.data[0]._id;
    }
  } catch (error) {
    logTest('Get Teams', false, error);
  }
  
  // Test 2: Create Team
  try {
    const createTeamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Test Team',
      description: 'Test Team Description',
      memberLimit: 4
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Create Team', createTeamResponse.status === 200 || createTeamResponse.status === 201);
    
    if (createTeamResponse.data && createTeamResponse.data._id) {
      teamId = createTeamResponse.data._id;
    }
  } catch (error) {
    logTest('Create Team', false, error);
  }
  
  return teamId;
}

async function testProblemStatementPolling(authToken, teamId) {
  console.log('\n🗳️ TESTING PROBLEM STATEMENT POLLING...\n');
  
  if (!authToken || !teamId) {
    logTest('Problem Statement Polling', false, 'No auth token or team ID');
    return;
  }
  
  // Test 1: Get Poll Status
  try {
    const pollStatusResponse = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Get Poll Status', pollStatusResponse.status === 200);
  } catch (error) {
    logTest('Get Poll Status', false, error);
  }
  
  // Test 2: Start Poll
  try {
    const startPollResponse = await axios.post(`${BASE_URL}/team-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Start Poll', startPollResponse.status === 200 || startPollResponse.status === 201);
  } catch (error) {
    logTest('Start Poll', false, error);
    console.log('🔍 START POLL ERROR DETAILS:');
    console.log('Status:', error.response?.status);
    console.log('Message:', error.response?.data?.message);
    console.log('Debug:', error.response?.data?.debug);
  }
  
  // Test 3: Vote on Problem Statement
  try {
    const voteResponse = await axios.post(`${BASE_URL}/team-polling/vote-problem-statement`, {
      teamId: teamId,
      problemStatementId: 'ML'
    }, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Vote on Problem Statement', voteResponse.status === 200 || voteResponse.status === 201);
  } catch (error) {
    logTest('Vote on Problem Statement', false, error);
  }
}

async function testNotifications(authToken) {
  console.log('\n🔔 TESTING NOTIFICATIONS...\n');
  
  if (!authToken) {
    logTest('Notifications', false, 'No auth token');
    return;
  }
  
  // Test 1: Get Notifications
  try {
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logTest('Get Notifications', notificationsResponse.status === 200);
  } catch (error) {
    logTest('Get Notifications', false, error);
  }
}

async function testWebSocketConnection() {
  console.log('\n🔌 TESTING WEBSOCKET CONNECTION...\n');
  
  try {
    // Test WebSocket endpoint accessibility
    const wsTestResponse = await axios.get(`${BASE_URL}/socket.io/`, {
      timeout: 5000
    });
    logTest('WebSocket Endpoint', wsTestResponse.status === 200);
  } catch (error) {
    logTest('WebSocket Endpoint', false, error);
  }
}

async function testAllEndpoints(authToken) {
  console.log('\n🌐 TESTING ALL ENDPOINTS...\n');
  
  const endpoints = [
    { method: 'GET', path: '/health', name: 'Health Check' },
    { method: 'GET', path: '/hackathons', name: 'Get Hackathons' },
    { method: 'GET', path: '/team/get-teams', name: 'Get Teams' },
    { method: 'GET', path: '/notifications', name: 'Get Notifications' },
    { method: 'GET', path: '/users/getAllUsers', name: 'Get All Users' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const config = {
        method: endpoint.method.toLowerCase(),
        url: `${BASE_URL}${endpoint.path}`,
        timeout: 10000
      };
      
      if (authToken && endpoint.path !== '/health') {
        config.headers = { 'Authorization': `Bearer ${authToken}` };
      }
      
      const response = await axios(config);
      logTest(`${endpoint.method} ${endpoint.path}`, response.status < 500);
    } catch (error) {
      logTest(`${endpoint.method} ${endpoint.path}`, false, error);
    }
  }
}

async function runComprehensiveTest() {
  console.log('🚀 STARTING COMPREHENSIVE APPLICATION TEST SUITE');
  console.log('🎯 EXTREME PREJUDICE TESTING MODE ACTIVATED\n');
  
  const startTime = Date.now();
  
  // Run all tests
  await testBackendHealth();
  const authToken = await testUserAuthentication();
  await testHackathonManagement(authToken);
  const teamId = await testTeamManagement(authToken);
  await testProblemStatementPolling(authToken, teamId);
  await testNotifications(authToken);
  await testWebSocketConnection();
  await testAllEndpoints(authToken);
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Print comprehensive results
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📈 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🎯 RECOMMENDATIONS:');
  if (testResults.failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Application is working perfectly.');
  } else {
    console.log('🔧 FOCUS ON FIXING:');
    const criticalFailures = testResults.errors.filter(e => 
      e.test.includes('Start Poll') || 
      e.test.includes('Authentication') ||
      e.test.includes('Health')
    );
    
    if (criticalFailures.length > 0) {
      console.log('🚨 CRITICAL ISSUES:');
      criticalFailures.forEach(failure => {
        console.log(`   - ${failure.test}: ${failure.error}`);
      });
    }
  }
  
  console.log('\n🏁 COMPREHENSIVE TESTING COMPLETE');
}

// Run the comprehensive test
runComprehensiveTest().catch(console.error);
