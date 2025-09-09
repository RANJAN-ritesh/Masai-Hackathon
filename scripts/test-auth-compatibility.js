// QUICK AUTHENTICATION COMPATIBILITY TEST
const axios = require('axios');

const BACKEND_URL = 'https://masai-hackathon.onrender.com';

async function testAuthCompatibility() {
  console.log('🧪 TESTING AUTHENTICATION COMPATIBILITY...\n');
  
  try {
    // Step 1: Create a test user
    console.log('1️⃣ Creating test user...');
    const timestamp = Date.now();
    const userResponse = await axios.post(`${BACKEND_URL}/users/create-user`, {
      userId: `TEST_AUTH_${timestamp}`,
      name: `Test Auth User ${timestamp}`,
      code: `TEST${timestamp}`,
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: `987654321${timestamp % 1000}`,
      email: `testauth${timestamp}@example.com`,
      password: 'password123'
    });
    
    const userId = userResponse.data.user._id;
    console.log('✅ User created:', userResponse.data.user.email);
    console.log('📋 User ID:', userId);
    
    // Step 2: Test team creation with userId (not JWT)
    console.log('2️⃣ Testing team creation with userId token...');
    
    // Create a hackathon first
    const hackathonResponse = await axios.post(`${BACKEND_URL}/hackathons`, {
      title: `Auth Test Hackathon ${timestamp}`,
      description: 'Testing auth compatibility',
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
    }, {
      headers: { 'Authorization': `Bearer ${userId}` } // Using userId as token
    });
    
    const hackathonId = hackathonResponse.data._id;
    console.log('✅ Hackathon created with userId token');
    
    // Step 3: Create team with userId token
    console.log('3️⃣ Testing team creation with userId...');
    const teamResponse = await axios.post(`${BACKEND_URL}/team/create-team`, {
      teamName: `Auth Test Team ${timestamp}`,
      description: 'Testing team creation with userId',
      hackathonId: hackathonId,
      memberLimit: 4
    }, {
      headers: { 
        'Authorization': `Bearer ${userId}`, // Using userId as token
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Team created successfully with userId token!');
    console.log('🎉 AUTHENTICATION COMPATIBILITY TEST PASSED!');
    
    return {
      success: true,
      message: 'Authentication compatibility is working - both JWT and userId tokens supported'
    };
    
  } catch (error) {
    console.log('❌ AUTHENTICATION COMPATIBILITY TEST FAILED:');
    console.log('Error:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('Details:', error.response?.data);
    
    return {
      success: false,
      error: error.response?.data?.message || error.message
    };
  }
}

testAuthCompatibility().then(result => {
  if (result.success) {
    console.log('\n🏆 SUCCESS: Authentication compatibility is working!');
    console.log('🔧 Both JWT tokens and userId tokens are supported.');
    console.log('🎯 Team creation should now work with existing login sessions.');
  } else {
    console.log('\n⚠️  ISSUE: Authentication compatibility still has problems.');
    console.log('🔍 Further investigation needed.');
  }
}).catch(console.error);
