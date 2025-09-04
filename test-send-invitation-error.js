// Test send invitation functionality to identify 500 error
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 TESTING SEND INVITATION - IDENTIFYING 500 ERROR\n');

async function testSendInvitation() {
  try {
    // Login as Umair (team leader)
    console.log('\n🔐 Logging in as Umair...');
    const umairResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'umair.h1@example.com',
      password: 'password123'
    });
    const umairToken = umairResponse.data.token;
    console.log('✅ Umair login successful');

    // Get Umair's team
    console.log('\n👥 Getting Umair\'s team...');
    const teamsResponse = await axios.get(`${BASE_URL}/team/hackathon/68b84011987ec2d1f411088c`, {
      headers: { 'Authorization': `Bearer ${umairToken}` }
    });
    
    const teams = teamsResponse.data.teams || [];
    const umairTeam = teams.find(team => 
      team.teamMembers.some(member => member.email === 'umair.h1@example.com')
    );
    
    if (!umairTeam) {
      console.log('❌ Umair is not in any team');
      return;
    }
    
    console.log(`✅ Found Umair's team: ${umairTeam.teamName} (ID: ${umairTeam._id})`);

    // Get hackathon participants
    console.log('\n📋 Getting hackathon participants...');
    const participantsResponse = await axios.get(`${BASE_URL}/participant-team/participants/68b84011987ec2d1f411088c`, {
      headers: { 'Authorization': `Bearer ${umairToken}` }
    });
    
    const participants = participantsResponse.data.participants || [];
    const availableParticipants = participants.filter(p => p.status === 'Available');
    console.log(`✅ Found ${availableParticipants.length} available participants`);
    
    if (availableParticipants.length === 0) {
      console.log('❌ No available participants to invite');
      return;
    }

    const targetParticipant = availableParticipants[0];
    console.log(`\n📨 Target participant: ${targetParticipant.name} (${targetParticipant.email})`);

    // Try to send invitation
    console.log('\n✅ Attempting to send invitation...');
    console.log(`URL: ${BASE_URL}/participant-team/send-invitation`);
    console.log('Payload:', {
      teamId: umairTeam._id,
      participantId: targetParticipant._id,
      message: 'You are invited to join our team!'
    });
    
    const inviteResponse = await axios.post(`${BASE_URL}/participant-team/send-invitation`, {
      teamId: umairTeam._id,
      participantId: targetParticipant._id,
      message: 'You are invited to join our team!'
    }, {
      headers: { 
        'Authorization': `Bearer ${umairToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS: Invitation sent!');
    console.log('Response:', inviteResponse.data);

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
    
    // Try to get more details about the error
    if (error.response?.status === 500) {
      console.log('\n🔍 500 Error Analysis:');
      console.log('- This indicates a server-side error');
      console.log('- Could be due to missing dependencies or compilation issues');
      console.log('- Need to check server logs for more details');
    }
  }
}

testSendInvitation();
