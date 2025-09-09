// SIMPLE TEAM CREATION TEST
const axios = require('axios');

const BACKEND_URL = 'https://masai-hackathon.onrender.com';

async function testTeamCreationOnly() {
  console.log('🧪 TESTING TEAM CREATION ONLY...\n');
  
  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const timestamp = Date.now();
    const userResponse = await axios.post(`${BACKEND_URL}/users/create-user`, {
      userId: `TEST_SIMPLE_${timestamp}`,
      name: `Test Simple User ${timestamp}`,
      code: `TEST${timestamp}`,
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: `987654321${timestamp % 1000}`,
      email: `testsimple${timestamp}@example.com`,
      password: 'password123'
    });
    
    const userId = userResponse.data.user._id;
    console.log('✅ User created:', userResponse.data.user.email);
    console.log('📋 User ID:', userId);
    
    // Step 2: Create a hackathon (no auth required)
    console.log('2️⃣ Creating hackathon...');
    const hackathonResponse = await axios.post(`${BACKEND_URL}/hackathons`, {
      title: `Simple Test Hackathon ${timestamp}`,
      description: 'Testing team creation',
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
    
    // Step 3: Test team creation with userId token
    console.log('3️⃣ Testing team creation with userId token...');
    console.log('🔍 Using userId as token:', userId);
    
    const teamResponse = await axios.post(`${BACKEND_URL}/team/create-team`, {
      teamName: `Simple Test Team ${timestamp}`,
      description: 'Testing team creation with userId',
      hackathonId: hackathonId,
      memberLimit: 4
    }, {
      headers: { 
        'Authorization': `Bearer ${userId}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team created successfully!');
    console.log('🎉 TEAM CREATION TEST PASSED!');
    
    return {
      success: true,
      message: 'Team creation is working with userId token'
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

testTeamCreationOnly().then(result => {
  if (result.success) {
    console.log('\n🏆 SUCCESS: Team creation is working!');
    console.log('🔧 The authentication compatibility fix is working.');
    console.log('🎯 Your CSV upload should now work properly.');
  } else {
    console.log('\n⚠️  ISSUE: Team creation still has problems.');
    console.log('🔍 The authentication fix needs more work.');
  }
}).catch(console.error);
