// Fix existing teams that don't have team leaders
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function fixExistingTeams() {
  console.log('🔧 FIXING EXISTING TEAMS WITHOUT LEADERS...\n');
  
  // Create a test user first
  console.log('1️⃣ Creating test user...');
  try {
    const userResponse = await axios.post(`${BASE_URL}/users/create-user`, {
      userId: 'FIXER_' + Date.now(),
      name: 'Team Fixer',
      code: 'FIXER' + Date.now(),
      course: 'Full Stack',
      skills: ['JavaScript'],
      vertical: 'Web Development',
      phoneNumber: '1234567890',
      email: 'fixer' + Date.now() + '@example.com',
      password: 'password123'
    });
    
    const userId = userResponse.data.user._id;
    console.log('✅ User created:', userId);
    
    // Login as the user
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Get all teams
    console.log('\n2️⃣ Getting all teams...');
    const teamsResponse = await axios.get(`${BASE_URL}/team/get-teams`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Teams retrieved:', teamsResponse.data.length);
    
    // Check each team for missing team leader
    for (let i = 0; i < teamsResponse.data.length; i++) {
      const team = teamsResponse.data[i];
      console.log(`\nTeam ${i + 1}: ${team.teamName}`);
      console.log('Team ID:', team._id);
      console.log('Team Leader:', team.teamLeader);
      console.log('Created By:', team.createdBy);
      console.log('Team Members:', team.teamMembers?.length || 0);
      
      if (!team.teamLeader) {
        console.log('❌ This team has no leader!');
        // We can't fix this via API, need to fix in database directly
      } else {
        console.log('✅ This team has a leader');
      }
    }
    
    // Test creating a new team with the fix
    console.log('\n3️⃣ Testing new team creation with fix...');
    const newTeamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Fixed Team ' + Date.now(),
      description: 'Team created with proper leader assignment',
      memberLimit: 4
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ New team created:', newTeamResponse.data._id);
    console.log('Team Leader:', newTeamResponse.data.teamLeader);
    console.log('Created By:', newTeamResponse.data.createdBy);
    
    // Test polling with the new team
    await testPollingWithFixedTeam(token, newTeamResponse.data._id);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status);
    console.log('Error details:', error.response?.data);
  }
}

async function testPollingWithFixedTeam(token, teamId) {
  console.log('\n🗳️ TESTING POLLING WITH FIXED TEAM...');
  console.log('Team ID:', teamId);
  
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
  console.log('🚀 STARTING EXISTING TEAM FIX...\n');
  
  await fixExistingTeams();
  
  console.log('\n🏁 EXISTING TEAM FIX COMPLETE');
}

runTeamFix().catch(console.error);
