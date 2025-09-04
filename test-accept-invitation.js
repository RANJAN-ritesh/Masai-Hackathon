const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 TESTING INVITATION ACCEPTANCE\n');

async function testInvitationAcceptance() {
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
    console.log(`\n📨 Accepting invitation from ${invitation.fromUser?.name || 'Unknown'}:`);
    console.log(`   Message: ${invitation.message}`);
    console.log(`   ID: ${invitation._id}`);

    // Accept the invitation
    console.log('\n✅ Accepting invitation...');
    const acceptResponse = await axios.put(`${BASE_URL}/participant-team/respond-invitation/${invitation._id}`, {
      response: 'accepted',
      message: 'I accept your invitation!'
    }, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    console.log('✅ Invitation accepted successfully');
    console.log('Response:', acceptResponse.data);

    // Wait a moment for database update
    console.log('\n⏳ Waiting for database update...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check Valerie's team status after acceptance
    console.log('\n👥 Checking Valerie\'s team status after acceptance...');
    const teamsResponse = await axios.get(`${BASE_URL}/team/hackathon/65f1a2b3c4d5e6f7g8h9i0j1`, {
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

    // Check notifications
    console.log('\n🔔 Checking notifications...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications/user`, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    const notifications = notificationsResponse.data.notifications || [];
    console.log(`✅ Valerie has ${notifications.length} notifications`);
    
    notifications.slice(0, 3).forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.type}: ${notif.message}`);
    });

    console.log('\n🎉 INVITATION ACCEPTANCE TEST COMPLETED!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    if (error.response?.data) {
      console.log('Error details:', error.response.data);
    }
  }
}

testInvitationAcceptance();
