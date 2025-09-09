// QUICK TEAM CREATION TEST
const axios = require('axios');

const BACKEND_URL = 'https://masai-hackathon.onrender.com';

async function testTeamCreation() {
  console.log('🧪 TESTING TEAM CREATION AFTER AUTH FIX...\n');
  
  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const timestamp = Date.now();
    const userResponse = await axios.post(`${BACKEND_URL}/users/create-user`, {
      userId: `TEST_TEAM_${timestamp}`,
      name: `Test Team User ${timestamp}`,
      code: `TEST${timestamp}`,
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: `987654321${timestamp % 1000}`,
      email: `testteam${timestamp}@example.com`,
      password: 'password123'
    });
    
    console.log('✅ User created:', userResponse.data.user.email);
    
    // Step 2: Login to get token
    console.log('2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BACKEND_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');
    
    // Step 3: Create a hackathon
    console.log('3️⃣ Creating test hackathon...');
    const hackathonResponse = await axios.post(`${BACKEND_URL}/hackathons`, {
      title: `Team Creation Test ${timestamp}`,
      description: 'Testing team creation after auth fix',
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
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const hackathonId = hackathonResponse.data._id;
    console.log('✅ Hackathon created:', hackathonId);
    
    // Step 4: Create a team
    console.log('4️⃣ Testing team creation...');
    const teamResponse = await axios.post(`${BACKEND_URL}/team/create-team`, {
      teamName: `Test Team ${timestamp}`,
      description: 'Testing team creation with auth',
      hackathonId: hackathonId,
      memberLimit: 4
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team created successfully:', teamResponse.data.teamName);
    console.log('🎉 TEAM CREATION TEST PASSED!');
    
    return {
      success: true,
      user: userResponse.data.user,
      hackathon: hackathonResponse.data,
      team: teamResponse.data
    };
    
  } catch (error) {
    console.log('❌ TEAM CREATION TEST FAILED:');
    console.log('Error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('Details:', error.response?.data);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

testTeamCreation().then(result => {
  if (result.success) {
    console.log('\n🏆 SUCCESS: Team creation is working properly!');
    console.log('🔧 The authentication fix resolved the 401 errors.');
  } else {
    console.log('\n⚠️  ISSUE: Team creation still has problems.');
    console.log('🔍 Further investigation needed.');
  }
}).catch(console.error);
