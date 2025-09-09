// Test the invitation acceptance directly
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 TESTING INVITATION ACCEPTANCE - DIRECT APPROACH\n');

async function testDirectAcceptance() {
  try {
    // Login as Valerie
    console.log('\n🔐 Logging in as Valerie...');
    const valerieResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'valerie.m2@example.com',
      password: 'password123'
    });
    const valerieToken = valerieResponse.data.token;
    console.log('✅ Valerie login successful');

    // Get Valerie's invitations
    console.log('\n📬 Getting Valerie\'s invitations...');
    const invitationsResponse = await axios.get(`${BASE_URL}/participant-team/requests`, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    const requests = invitationsResponse.data.requests || [];
    const invitations = requests.filter(r => r.requestType === 'invite' && r.status === 'pending');
    console.log(`✅ Found ${invitations.length} pending invitations`);
    
    if (invitations.length === 0) {
      console.log('❌ No pending invitations to accept');
      return;
    }

    const invitation = invitations[0];
    console.log(`\n📨 Invitation details:`);
    console.log(`   ID: ${invitation._id}`);
    console.log(`   From: ${invitation.fromUserId?.name || 'Unknown'}`);
    console.log(`   Team: ${invitation.teamId?.teamName || 'Unknown'}`);
    console.log(`   Status: ${invitation.status}`);

    // Try to accept the invitation
    console.log('\n✅ Attempting to accept invitation...');
    console.log(`URL: ${BASE_URL}/participant-team/respond-invitation/${invitation._id}`);
    
    const acceptResponse = await axios.put(`${BASE_URL}/participant-team/respond-invitation/${invitation._id}`, {
      response: 'accepted',
      message: 'I accept your invitation!'
    }, {
      headers: { 
        'Authorization': `Bearer ${valerieToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ SUCCESS: Invitation accepted!');
    console.log('Response:', acceptResponse.data);

    // Wait a moment for database update
    console.log('\n⏳ Waiting for database update...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check Valerie's team status
    console.log('\n👥 Checking Valerie\'s team status...');
    const teamsResponse = await axios.get(`${BASE_URL}/team/hackathon/68b84011987ec2d1f411088c`, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    const teams = teamsResponse.data.teams || [];
    const valerieTeam = teams.find(team => 
      team.teamMembers.some(member => member.email === 'valerie.m2@example.com')
    );
    
    if (valerieTeam) {
      console.log(`✅ SUCCESS: Valerie is now in team: ${valerieTeam.teamName}`);
      console.log(`   Team members: ${valerieTeam.teamMembers.map(m => m.name).join(', ')}`);
      console.log(`   Team size: ${valerieTeam.teamMembers.length}/${valerieTeam.memberLimit}`);
    } else {
      console.log('❌ FAILURE: Valerie is still not in any team');
    }

    console.log('\n🎉 INVITATION ACCEPTANCE TEST COMPLETED!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    console.log('Status:', error.response?.status);
    console.log('URL:', error.config?.url);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

testDirectAcceptance();
