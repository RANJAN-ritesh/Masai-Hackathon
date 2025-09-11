// TEST WITH PROPER LOGIN FLOW
const axios = require('axios');

const BACKEND_URL = 'https://masai-hackathon.onrender.com';

async function testWithLoginFlow() {
  console.log('🧪 TESTING WITH PROPER LOGIN FLOW...\n');
  
  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const timestamp = Date.now();
    const userResponse = await axios.post(`${BACKEND_URL}/users/create-user`, {
      userId: `TEST_LOGIN_${timestamp}`,
      name: `Test Login User ${timestamp}`,
      code: `TEST${timestamp}`,
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: `987654321${timestamp % 1000}`,
      email: `testlogin${timestamp}@example.com`,
      password: 'password123'
    });
    
    const user = userResponse.data.user;
    console.log('✅ User created:', user.email);
    
    // Step 2: Login to get JWT token
    console.log('2️⃣ Logging in to get JWT token...');
    const loginResponse = await axios.post(`${BACKEND_URL}/users/verify-user`, {
      email: user.email,
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, JWT token received');
    console.log('🔍 Token preview:', token.substring(0, 20) + '...');
    
    // Step 3: Create a hackathon
    console.log('3️⃣ Creating hackathon...');
    const hackathonResponse = await axios.post(`${BACKEND_URL}/hackathons`, {
      title: `Login Test Hackathon ${timestamp}`,
      description: 'Testing team creation with JWT',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      submissionStartDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      submissionEndDate: new Date(Date.now() + 71 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      allowParticipantTeams: true,
      teamCreationMode: 'participant',
      problemStatements: [
        { track: 'AI/ML', description: 'Build an AI solution' }
      ]
    });
    
    const hackathonId = hackathonResponse.data._id;
    console.log('✅ Hackathon created:', hackathonId);
    
    // Step 4: Test team creation with JWT token
    console.log('4️⃣ Testing team creation with JWT token...');
    const teamResponse = await axios.post(`${BACKEND_URL}/team/create-team`, {
      teamName: `Login Test Team ${timestamp}`,
      description: 'Testing team creation with JWT',
      hackathonId: hackathonId,
      memberLimit: 4
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team created successfully with JWT token!');
    console.log('🎉 LOGIN FLOW TEST PASSED!');
    
    return {
      success: true,
      message: 'Team creation works with proper JWT token from login'
    };
    
  } catch (error) {
    console.log('❌ LOGIN FLOW TEST FAILED:');
    console.log('Error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('Details:', error.response?.data);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

testWithLoginFlow().then(result => {
  if (result.success) {
    console.log('\n🏆 SUCCESS: Team creation works with proper JWT!');
    console.log('🔧 The issue is that we need to login first to get a JWT token.');
    console.log('🎯 The frontend should use the JWT token from login, not userId.');
  } else {
    console.log('\n⚠️  ISSUE: Even with JWT token, team creation fails.');
    console.log('🔍 There might be a deeper issue with the authentication system.');
  }
}).catch(console.error);
