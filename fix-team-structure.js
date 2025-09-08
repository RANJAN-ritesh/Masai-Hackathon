// Fix team data structure issues
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function fixTeamDataStructure() {
  console.log('🔧 FIXING TEAM DATA STRUCTURE ISSUES...\n');
  
  // First, let's create a user and make them a team leader
  console.log('1️⃣ Creating user with leader role...');
  try {
    const userResponse = await axios.post(`${BASE_URL}/users/create-user`, {
      userId: 'LEADER_' + Date.now(),
      name: 'Team Leader',
      code: 'LEADER' + Date.now(),
      course: 'Full Stack',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: '1234567890',
      email: 'leader' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    const leaderId = userResponse.data.user._id;
    console.log('✅ Leader created:', leaderId);
    
    // Login as the leader
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Leader login successful');
    
    // Create a team with proper leader assignment
    console.log('\n2️⃣ Creating team with proper leader...');
    const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Test Team with Leader',
      description: 'Test team with proper leader assignment',
      memberLimit: 4
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Team created:', teamResponse.data._id);
    console.log('Team leader:', teamResponse.data.teamLeader);
    console.log('Team created by:', teamResponse.data.createdBy);
    
    // Test polling with this properly structured team
    await testPollingWithProperTeam(token, teamResponse.data._id, leaderId);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status);
    console.log('Error details:', error.response?.data);
  }
}

async function testPollingWithProperTeam(token, teamId, leaderId) {
  console.log('\n🗳️ TESTING POLLING WITH PROPER TEAM STRUCTURE...');
  console.log('Team ID:', teamId);
  console.log('Leader ID:', leaderId);
  
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

async function runTeamFix() {
  console.log('🚀 STARTING TEAM DATA STRUCTURE FIX...\n');
  
  await fixTeamDataStructure();
  
  console.log('\n🏁 TEAM DATA STRUCTURE FIX COMPLETE');
}

runTeamFix().catch(console.error);
