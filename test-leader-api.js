// Test team leader verification via API
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function testLeaderVerification() {
  console.log('🔍 Testing Team Leader Verification via API...\n');
  
  try {
    // Test 1: Check if backend is accessible
    console.log('1️⃣ Testing backend accessibility...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is accessible\n');

    // Test 2: Login as Bianca to get token
    console.log('2️⃣ Logging in as Bianca...');
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'bianca.rod2@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token length:', token.length);
    console.log('Token preview:', token.substring(0, 50) + '...\n');

    // Test 3: Get team data
    console.log('3️⃣ Getting team data...');
    const teamResponse = await axios.get(`${BASE_URL}/team/get-teams`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const teams = teamResponse.data;
    console.log('✅ Teams retrieved:', teams.length);
    
    // Find Team 1
    const team1 = teams.find(team => team.teamName === 'Team 1');
    if (!team1) {
      console.log('❌ Team 1 not found');
      return;
    }
    
    console.log('Team 1 ID:', team1._id);
    console.log('Team 1 Leader:', team1.teamLeader);
    console.log('Team 1 Created By:', team1.createdBy);
    console.log('Team 1 Members:', team1.teamMembers?.length || 0);
    console.log('');

    // Test 4: Test poll status endpoint
    console.log('4️⃣ Testing poll status endpoint...');
    try {
      const pollStatusResponse = await axios.get(`${BASE_URL}/team-polling/poll-status/${team1._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('✅ Poll status retrieved successfully');
      console.log('Poll active:', pollStatusResponse.data.pollActive);
    } catch (error) {
      console.log('❌ Poll status failed:', error.response?.status, error.response?.data?.message);
    }

    // Test 5: Test start poll endpoint
    console.log('\n5️⃣ Testing start poll endpoint...');
    try {
      const startPollResponse = await axios.post(`${BASE_URL}/team-polling/start-poll`, {
        teamId: team1._id,
        problemStatementId: 'DA',
        duration: 90
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Start poll successful!');
      console.log('Response:', startPollResponse.data);
    } catch (error) {
      console.log('❌ Start poll failed:', error.response?.status, error.response?.data?.message);
      
      if (error.response?.status === 403) {
        console.log('\n🔍 DEBUGGING 403 ERROR:');
        console.log('Team ID:', team1._id);
        console.log('Team Leader:', team1.teamLeader);
        console.log('Team Created By:', team1.createdBy);
        console.log('Token User ID (from JWT):', 'Need to decode JWT');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testLeaderVerification().catch(console.error);
