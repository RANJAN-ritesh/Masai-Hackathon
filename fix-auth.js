// Fix authentication issues by verifying users and testing with correct data
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function fixAuthenticationIssues() {
  console.log('🔧 FIXING AUTHENTICATION ISSUES...\n');
  
  // Test 1: Create a properly formatted user
  console.log('1️⃣ Creating properly formatted user...');
  try {
    const response = await axios.post(`${BASE_URL}/users/create-user`, {
      userId: 'USER_' + Date.now(),
      name: 'Test User',
      code: 'TEST' + Date.now(),
      course: 'Full Stack',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: '1234567890',
      email: 'testuser' + Date.now() + '@example.com',
      password: 'password123'
    });
    console.log('✅ User creation successful:', response.status);
    console.log('User ID:', response.data.user._id);
    console.log('User verified:', response.data.user.isVerified);
    
    // Test login with this user
    console.log('\n2️⃣ Testing login with created user...');
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: response.data.user.email,
      password: 'password123'
    });
    console.log('✅ Login successful:', loginResponse.status);
    console.log('Token length:', loginResponse.data.token?.length);
    
    return loginResponse.data.token;
  } catch (error) {
    console.log('❌ User creation failed:', error.response?.status);
    console.log('Error:', error.response?.data);
    return null;
  }
}

async function testWithValidToken(token) {
  if (!token) {
    console.log('❌ No valid token available for testing');
    return;
  }
  
  console.log('\n🧪 TESTING WITH VALID TOKEN...\n');
  
  // Test 1: Get teams
  try {
    const teamsResponse = await axios.get(`${BASE_URL}/team/get-teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Get teams successful:', teamsResponse.status);
    console.log('Teams count:', teamsResponse.data?.length || 0);
    
    if (teamsResponse.data && teamsResponse.data.length > 0) {
      const team = teamsResponse.data[0];
      console.log('First team ID:', team._id);
      console.log('Team leader:', team.teamLeader);
      console.log('Team created by:', team.createdBy);
      
      // Test polling with this team
      await testPollingWithTeam(token, team._id);
    }
  } catch (error) {
    console.log('❌ Get teams failed:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

async function testPollingWithTeam(token, teamId) {
  console.log('\n🗳️ TESTING POLLING WITH TEAM:', teamId);
  
  // Test 1: Get poll status
  try {
    const pollStatusResponse = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Get poll status successful:', pollStatusResponse.status);
    console.log('Poll active:', pollStatusResponse.data.pollActive);
  } catch (error) {
    console.log('❌ Get poll status failed:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
  
  // Test 2: Start poll
  try {
    const startPollResponse = await axios.post(`${BASE_URL}/team-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Start poll successful:', startPollResponse.status);
    console.log('Response:', startPollResponse.data);
  } catch (error) {
    console.log('❌ Start poll failed:', error.response?.status);
    console.log('Error:', error.response?.data);
    console.log('Debug info:', error.response?.data?.debug);
  }
}

async function runFix() {
  console.log('🚀 STARTING AUTHENTICATION FIX...\n');
  
  const token = await fixAuthenticationIssues();
  await testWithValidToken(token);
  
  console.log('\n🏁 AUTHENTICATION FIX COMPLETE');
}

runFix().catch(console.error);
