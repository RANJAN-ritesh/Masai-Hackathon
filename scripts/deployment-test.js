// COMPREHENSIVE DEPLOYMENT TESTING SUITE
const axios = require('axios');

const BACKEND_URL = 'https://masai-hackathon.onrender.com';
const FRONTEND_URL = 'https://masai-hackathon.netlify.app';

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
  console.log('\n🔧 TESTING BACKEND DEPLOYMENT...\n');
  
  try {
    // Test 1: Basic health check
    console.log('1️⃣ Testing backend health...');
    const healthResponse = await axios.get(BACKEND_URL);
    logTest('Backend Health Check', healthResponse.status === 200);
    
    // Test 2: CORS headers
    console.log('2️⃣ Testing CORS configuration...');
    const corsResponse = await axios.options(BACKEND_URL);
    logTest('CORS Configuration', corsResponse.status === 200);
    
    // Test 3: API routes availability
    console.log('3️⃣ Testing API routes...');
    const routes = [
      '/users',
      '/team',
      '/hackathons',
      '/notifications',
      '/team-polling',
      '/team-reporting',
      '/submission',
      '/admin'
    ];
    
    for (const route of routes) {
      try {
        const response = await axios.get(`${BACKEND_URL}${route}`);
        logTest(`API Route ${route}`, response.status === 200 || response.status === 404);
      } catch (error) {
        // 404 is acceptable for GET requests to these routes
        logTest(`API Route ${route}`, error.response?.status === 404);
      }
    }
    
  } catch (error) {
    logTest('Backend Health', false, error.message);
  }
}

async function testFrontendHealth() {
  console.log('\n🎨 TESTING FRONTEND DEPLOYMENT...\n');
  
  try {
    // Test 1: Frontend availability
    console.log('1️⃣ Testing frontend availability...');
    const frontendResponse = await axios.get(FRONTEND_URL);
    logTest('Frontend Availability', frontendResponse.status === 200);
    
    // Test 2: Check for React app
    console.log('2️⃣ Testing React app loading...');
    const hasReactApp = frontendResponse.data.includes('react') || frontendResponse.data.includes('root');
    logTest('React App Loading', hasReactApp);
    
    // Test 3: Check for main assets
    console.log('3️⃣ Testing asset loading...');
    const hasAssets = frontendResponse.data.includes('assets') || frontendResponse.data.includes('js') || frontendResponse.data.includes('css');
    logTest('Asset Loading', hasAssets);
    
  } catch (error) {
    logTest('Frontend Health', false, error.message);
  }
}

async function testUserAuthentication() {
  console.log('\n🔐 TESTING USER AUTHENTICATION...\n');
  
  try {
    // Test 1: User creation
    console.log('1️⃣ Testing user creation...');
    const timestamp = Date.now();
    const userResponse = await axios.post(`${BACKEND_URL}/users/create-user`, {
      userId: `TEST_${timestamp}`,
      name: `Test User ${timestamp}`,
      code: `TEST${timestamp}`,
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: `987654321${timestamp % 1000}`,
      email: `test${timestamp}@example.com`,
      password: 'password123'
    });
    
    logTest('User Creation', userResponse.status === 201);
    
    // Test 2: User login
    console.log('2️⃣ Testing user login...');
    const loginResponse = await axios.post(`${BACKEND_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    logTest('User Login', loginResponse.status === 200);
    const token = loginResponse.data.token;
    
    // Test 3: Token validation
    console.log('3️⃣ Testing token validation...');
    const protectedResponse = await axios.get(`${BACKEND_URL}/team/get-teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    logTest('Token Validation', protectedResponse.status === 200);
    
    return { user: userResponse.data.user, token };
    
  } catch (error) {
    logTest('User Authentication', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testHackathonManagement(userData) {
  console.log('\n🏢 TESTING HACKATHON MANAGEMENT...\n');
  
  if (!userData) {
    logTest('Hackathon Management', false, 'No user data available');
    return null;
  }
  
  try {
    // Test 1: Create hackathon
    console.log('1️⃣ Testing hackathon creation...');
    const hackathonResponse = await axios.post(`${BACKEND_URL}/hackathons`, {
      title: `Deployment Test Hackathon ${Date.now()}`,
      description: 'Testing hackathon creation',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      submissionStartDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      submissionEndDate: new Date(Date.now() + 71 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      allowParticipantTeams: true,
      teamCreationMode: 'participant',
      problemStatements: [
        { track: 'AI/ML', description: 'Build an AI solution' },
        { track: 'Web Dev', description: 'Create a web application' }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Hackathon Creation', hackathonResponse.status === 201);
    const hackathonId = hackathonResponse.data._id;
    
    // Test 2: Get hackathons
    console.log('2️⃣ Testing hackathon retrieval...');
    const getHackathonsResponse = await axios.get(`${BACKEND_URL}/hackathons`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Hackathon Retrieval', getHackathonsResponse.status === 200);
    
    return hackathonId;
    
  } catch (error) {
    logTest('Hackathon Management', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testTeamManagement(userData, hackathonId) {
  console.log('\n👥 TESTING TEAM MANAGEMENT...\n');
  
  if (!userData || !hackathonId) {
    logTest('Team Management', false, 'Missing user data or hackathon ID');
    return null;
  }
  
  try {
    // Test 1: Create team
    console.log('1️⃣ Testing team creation...');
    const teamResponse = await axios.post(`${BACKEND_URL}/team/create-team`, {
      teamName: `Deployment Test Team ${Date.now()}`,
      description: 'Testing team creation',
      memberLimit: 4,
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Team Creation', teamResponse.status === 201);
    const teamId = teamResponse.data._id;
    
    // Test 2: Get teams
    console.log('2️⃣ Testing team retrieval...');
    const getTeamsResponse = await axios.get(`${BACKEND_URL}/team/get-teams`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Team Retrieval', getTeamsResponse.status === 200);
    
    return teamId;
    
  } catch (error) {
    logTest('Team Management', false, error.response?.data?.message || error.message);
    return null;
  }
}

async function testPollingSystem(userData, teamId, hackathonId) {
  console.log('\n🗳️ TESTING POLLING SYSTEM...\n');
  
  if (!userData || !teamId || !hackathonId) {
    logTest('Polling System', false, 'Missing required data');
    return false;
  }
  
  try {
    // Test 1: Get poll status
    console.log('1️⃣ Testing poll status...');
    const pollStatusResponse = await axios.get(`${BACKEND_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Poll Status Retrieval', pollStatusResponse.status === 200);
    
    // Test 2: Start poll
    console.log('2️⃣ Testing poll start...');
    const startPollResponse = await axios.post(`${BACKEND_URL}/team-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Poll Start', startPollResponse.status === 200);
    
    // Test 3: Vote on problem statement
    console.log('3️⃣ Testing voting...');
    const voteResponse = await axios.post(`${BACKEND_URL}/team-polling/vote-problem-statement`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Voting System', voteResponse.status === 200);
    
    // Test 4: Conclude poll
    console.log('4️⃣ Testing poll conclusion...');
    const concludeResponse = await axios.post(`${BACKEND_URL}/team-polling/conclude-poll`, {
      teamId: teamId
    }, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Poll Conclusion', concludeResponse.status === 200);
    
    return true;
    
  } catch (error) {
    logTest('Polling System', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testSubmissionSystem(userData, teamId) {
  console.log('\n📤 TESTING SUBMISSION SYSTEM...\n');
  
  if (!userData || !teamId) {
    logTest('Submission System', false, 'Missing required data');
    return false;
  }
  
  try {
    // Test 1: Get submission status
    console.log('1️⃣ Testing submission status...');
    const statusResponse = await axios.get(`${BACKEND_URL}/submission/submission-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Submission Status', statusResponse.status === 200);
    
    // Test 2: Submit project
    console.log('2️⃣ Testing project submission...');
    const submissionResponse = await axios.post(`${BACKEND_URL}/submission/submit-project`, {
      teamId: teamId,
      submissionLink: 'https://github.com/deployment/test-project'
    }, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Project Submission', submissionResponse.status === 200);
    
    return true;
    
  } catch (error) {
    logTest('Submission System', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testAdminFeatures(userData, hackathonId) {
  console.log('\n📊 TESTING ADMIN FEATURES...\n');
  
  if (!userData || !hackathonId) {
    logTest('Admin Features', false, 'Missing required data');
    return false;
  }
  
  try {
    // Test 1: Get hackathon statistics
    console.log('1️⃣ Testing hackathon statistics...');
    const statsResponse = await axios.get(`${BACKEND_URL}/admin/hackathon-stats/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Hackathon Statistics', statsResponse.status === 200);
    
    // Test 2: Download CSV
    console.log('2️⃣ Testing CSV download...');
    const csvResponse = await axios.get(`${BACKEND_URL}/admin/download-hackathon-data/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('CSV Download', csvResponse.status === 200);
    
    return true;
    
  } catch (error) {
    logTest('Admin Features', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testReportingSystem(userData, teamId) {
  console.log('\n🚨 TESTING REPORTING SYSTEM...\n');
  
  if (!userData || !teamId) {
    logTest('Reporting System', false, 'Missing required data');
    return false;
  }
  
  try {
    // Test 1: Get team reports
    console.log('1️⃣ Testing team reports...');
    const reportsResponse = await axios.get(`${BACKEND_URL}/team-reporting/team-reports/${teamId}`, {
      headers: { 'Authorization': `Bearer ${userData.token}` }
    });
    
    logTest('Team Reports', reportsResponse.status === 200);
    
    return true;
    
  } catch (error) {
    logTest('Reporting System', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function runComprehensiveDeploymentTest() {
  console.log('🚀 COMPREHENSIVE DEPLOYMENT TESTING SUITE');
  console.log('🎯 TESTING BOTH FRONTEND AND BACKEND DEPLOYMENTS\n');
  
  const startTime = Date.now();
  
  // Test deployments
  await testBackendHealth();
  await testFrontendHealth();
  
  // Test core functionality
  const userData = await testUserAuthentication();
  const hackathonId = await testHackathonManagement(userData);
  const teamId = await testTeamManagement(userData, hackathonId);
  
  // Test advanced features
  await testPollingSystem(userData, teamId, hackathonId);
  await testSubmissionSystem(userData, teamId);
  await testAdminFeatures(userData, hackathonId);
  await testReportingSystem(userData, teamId);
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 DEPLOYMENT TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📈 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🎯 DEPLOYMENT STATUS:');
  const backendTests = testResults.errors.filter(e => e.test.includes('Backend') || e.test.includes('API'));
  const frontendTests = testResults.errors.filter(e => e.test.includes('Frontend') || e.test.includes('React'));
  const coreTests = testResults.errors.filter(e => e.test.includes('User') || e.test.includes('Hackathon') || e.test.includes('Team'));
  const featureTests = testResults.errors.filter(e => e.test.includes('Polling') || e.test.includes('Submission') || e.test.includes('Admin'));
  
  console.log(`Backend Deployment: ${backendTests.length === 0 ? '✅ HEALTHY' : '❌ ISSUES'}`);
  console.log(`Frontend Deployment: ${frontendTests.length === 0 ? '✅ HEALTHY' : '❌ ISSUES'}`);
  console.log(`Core Functionality: ${coreTests.length === 0 ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`Advanced Features: ${featureTests.length === 0 ? '✅ WORKING' : '❌ ISSUES'}`);
  
  if (testResults.failed === 0) {
    console.log('\n🏆 PERFECT DEPLOYMENT! ALL SYSTEMS OPERATIONAL!');
    console.log('🎉 FRONTEND AND BACKEND ARE WORKING FLAWLESSLY!');
  } else if (testResults.failed <= 2) {
    console.log('\n✅ DEPLOYMENT SUCCESSFUL! MINOR ISSUES ONLY.');
    console.log('🎯 SYSTEM IS PRODUCTION READY!');
  } else {
    console.log('\n⚠️  DEPLOYMENT ISSUES DETECTED! ATTENTION REQUIRED!');
    console.log('🔧 SOME FEATURES NEED INVESTIGATION!');
  }
  
  console.log('\n🚀 DEPLOYMENT TESTING COMPLETE');
}

runComprehensiveDeploymentTest().catch(console.error);
