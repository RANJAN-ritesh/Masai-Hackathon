// Debug team creation issue
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function debugTeamCreation() {
  console.log('🔍 DEBUGGING TEAM CREATION ISSUE...\n');
  
  // Create a user with unique credentials
  const timestamp = Date.now();
  try {
    console.log('1️⃣ Creating user...');
    const userResponse = await axios.post(`${BASE_URL}/users/create-user`, {
      userId: `DEBUG_${timestamp}`,
      name: 'Debug User',
      code: `DEBUG${timestamp}`,
      course: 'Full Stack',
      skills: ['JavaScript'],
      vertical: 'Web Development',
      phoneNumber: `123456789${timestamp % 10}`,
      email: `debug${timestamp}@example.com`,
      password: 'password123'
    });
    
    console.log('✅ User created:', userResponse.data.user._id);
    
    // Login as the user
    console.log('\n2️⃣ Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token length:', token.length);
    console.log('User from token:', loginResponse.data.user._id);
    
    // Test team creation
    console.log('\n3️⃣ Testing team creation...');
    const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Debug Team ' + timestamp,
      description: 'Debug team for testing',
      memberLimit: 4
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Team creation successful!');
    console.log('Team ID:', teamResponse.data._id);
    console.log('Team Leader:', teamResponse.data.teamLeader);
    console.log('Created By:', teamResponse.data.createdBy);
    
    // Test polling with this team
    console.log('\n4️⃣ Testing polling...');
    const pollStatusResponse = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamResponse.data._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Poll status retrieved');
    console.log('Poll active:', pollStatusResponse.data.pollActive);
    
    // Test starting poll
    console.log('\n5️⃣ Testing start poll...');
    const startPollResponse = await axios.post(`${BASE_URL}/team-polling/start-poll`, {
      teamId: teamResponse.data._id,
      problemStatementId: 'ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Start poll successful!');
    console.log('Response:', startPollResponse.data);
    
    // Test concluding poll
    console.log('\n6️⃣ Testing conclude poll...');
    const concludePollResponse = await axios.post(`${BASE_URL}/team-polling/conclude-poll`, {
      teamId: teamResponse.data._id
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('✅ Conclude poll successful!');
    console.log('Winning problem statement:', concludePollResponse.data.winningProblemStatement);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.status);
    console.log('Error details:', error.response?.data);
    
    if (error.response?.data?.debug) {
      console.log('Debug info:', error.response.data.debug);
    }
  }
}

debugTeamCreation().catch(console.error);
