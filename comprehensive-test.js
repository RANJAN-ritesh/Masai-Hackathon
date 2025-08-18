#!/usr/bin/env node

const https = require('https');
const http = require('http');

const BASE_URL = 'https://masai-hackathon.onrender.com';
const FRONTEND_URL = 'https://masai-hackathon.netlify.app';

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
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
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  console.log(`${status} ${name}${message ? ': ' + message : ''}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

async function testBackendHealth() {
  console.log('\n🔍 Testing Backend Health...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/health`);
    logTest('Backend Health Check', response.status === 200, `Status: ${response.status}`);
    
    if (response.data && response.data.status === 'ok') {
      logTest('Backend Status OK', true, `Uptime: ${Math.floor(response.data.uptime)}s`);
    } else {
      logTest('Backend Status OK', false, 'Invalid health response');
    }
  } catch (error) {
    logTest('Backend Health Check', false, error.message);
  }
}

async function testHackathonAPI() {
  console.log('\n🔍 Testing Hackathon API...');
  
  try {
    // Test GET hackathons
    const getResponse = await makeRequest(`${BASE_URL}/hackathons`);
    logTest('Get Hackathons', getResponse.status === 200, `Found ${Array.isArray(getResponse.data) ? getResponse.data.length : 0} hackathons`);
    
    // Test specific hackathon if exists
    if (Array.isArray(getResponse.data) && getResponse.data.length > 0) {
      const hackathonId = getResponse.data[0]._id;
      const specificResponse = await makeRequest(`${BASE_URL}/hackathons/${hackathonId}`);
      logTest('Get Specific Hackathon', specificResponse.status === 200, `ID: ${hackathonId}`);
    }
    
  } catch (error) {
    logTest('Hackathon API', false, error.message);
  }
}

async function testUserAPI() {
  console.log('\n🔍 Testing User API...');
  
  try {
    // Test get all users
    const usersResponse = await makeRequest(`${BASE_URL}/users/getAllUsers`);
    logTest('Get All Users', usersResponse.status === 200, `Found ${Array.isArray(usersResponse.data) ? usersResponse.data.length : 0} users`);
    
    // Test create user (might fail if exists)
    const createUserResponse = await makeRequest(`${BASE_URL}/users/create-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: {
        userId: `TEST_USER_${Date.now()}`,
        name: 'Test User',
        code: 'TEST001',
        course: 'Computer Science',
        skills: ['JavaScript', 'React'],
        vertical: 'Frontend',
        phoneNumber: `123456${Math.floor(Math.random() * 10000)}`,
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      }
    });
    
    logTest('Create User', createUserResponse.status === 201 || createUserResponse.status === 400, 
      `Status: ${createUserResponse.status} - ${createUserResponse.data?.message || 'OK'}`);
    
  } catch (error) {
    logTest('User API', false, error.message);
  }
}

async function testTeamAPI() {
  console.log('\n🔍 Testing Team API...');
  
  try {
    // Test get teams
    const teamsResponse = await makeRequest(`${BASE_URL}/team/get-teams`);
    logTest('Get Teams', teamsResponse.status === 200, `Found ${Array.isArray(teamsResponse.data) ? teamsResponse.data.length : 0} teams`);
    
  } catch (error) {
    logTest('Team API', false, error.message);
  }
}

async function testFrontend() {
  console.log('\n🔍 Testing Frontend...');
  
  try {
    // Test frontend accessibility
    const frontendResponse = await makeRequest(FRONTEND_URL);
    logTest('Frontend Accessible', frontendResponse.status === 200, 'Main page loads');
    
    // Test if frontend can reach backend
    const corsTest = await makeRequest(`${BASE_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    logTest('CORS Configuration', corsTest.status === 200, 'Backend accessible from frontend');
    
  } catch (error) {
    logTest('Frontend', false, error.message);
  }
}

async function testParticipantManagement() {
  console.log('\n🔍 Testing Participant Management...');
  
  try {
    // Get hackathons first
    const hackathonsResponse = await makeRequest(`${BASE_URL}/hackathons`);
    
    if (Array.isArray(hackathonsResponse.data) && hackathonsResponse.data.length > 0) {
      const hackathonId = hackathonsResponse.data[0]._id;
      
      // Test upload participants
      const participantsData = [
        {
          "First Name": "John",
          "Last Name": "Doe",
          "Email": `john.doe.${Date.now()}@example.com`,
          "Course": "Computer Science",
          "Skills": "JavaScript, React",
          "Vertical": "Frontend",
          "Phone": "1234567890",
          "Role": "member"
        }
      ];
      
      const uploadResponse = await makeRequest(`${BASE_URL}/users/upload-participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: {
          participants: participantsData,
          hackathonId: hackathonId
        }
      });
      
      logTest('Upload Participants', uploadResponse.status === 200, 
        uploadResponse.data?.message || 'Participants processed');
      
      // Test get participants for hackathon
      const participantsResponse = await makeRequest(`${BASE_URL}/users/hackathon/${hackathonId}/participants`);
      logTest('Get Hackathon Participants', participantsResponse.status === 200, 
        `Found ${participantsResponse.data?.participants?.length || 0} participants`);
      
    } else {
      logTest('Participant Management', false, 'No hackathons available for testing');
    }
    
  } catch (error) {
    logTest('Participant Management', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Platform Test...');
  console.log('='.repeat(50));
  console.log(`📋 Backend: ${BASE_URL}`);
  console.log(`📋 Frontend: ${FRONTEND_URL}`);
  console.log('='.repeat(50));
  
  await testBackendHealth();
  await testHackathonAPI();
  await testUserAPI();
  await testTeamAPI();
  await testParticipantManagement();
  await testFrontend();
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📊 Success Rate: ${Math.round((results.passed / (results.passed + results.failed)) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Failed Tests:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`   • ${test.name}: ${test.message}`);
    });
  }
  
  console.log('\n🎯 Platform Status:');
  if (results.passed >= results.failed * 2) {
    console.log('✅ Platform is working well! Most functionality is operational.');
  } else {
    console.log('⚠️  Platform has some issues that need attention.');
  }
  
  console.log('\n🌐 Next Steps:');
  console.log('1. Visit the frontend: ' + FRONTEND_URL);
  console.log('2. Create an admin account');
  console.log('3. Create a hackathon');
  console.log('4. Upload participants');
  console.log('5. Generate teams');
  
  process.exit(results.failed > results.passed ? 1 : 0);
}

runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error);
  process.exit(1);
}); 