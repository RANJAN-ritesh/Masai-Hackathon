const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 CHECKING CURRENT INVITATION STATE\n');

async function checkCurrentState() {
  try {
    // Login as Valerie
    console.log('\n🔐 Logging in as Valerie...');
    const valerieResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'valerie.m2@example.com',
      password: 'password123'
    });
    const valerieToken = valerieResponse.data.token;
    console.log('✅ Valerie login successful');

    // Check Valerie's invitations
    console.log('\n📬 Checking Valerie\'s invitations...');
    const invitationsResponse = await axios.get(`${BASE_URL}/participant-team/requests`, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    const requests = invitationsResponse.data.requests || [];
    const invitations = requests.filter(r => r.requestType === 'invite');
    console.log(`✅ Valerie has ${invitations.length} invitations`);
    
    invitations.forEach((inv, index) => {
      console.log(`\n   Invitation ${index + 1}:`);
      console.log(`   From: ${inv.fromUser?.name} (${inv.fromUser?.email})`);
      console.log(`   To: ${inv.toUser?.name} (${inv.toUser?.email})`);
      console.log(`   Status: ${inv.status}`);
      console.log(`   Message: ${inv.message}`);
      console.log(`   Created: ${inv.createdAt}`);
      console.log(`   ID: ${inv._id}`);
    });

    // Check Valerie's team status
    console.log('\n👥 Checking Valerie\'s team status...');
    const teamsResponse = await axios.get(`${BASE_URL}/team/hackathon/65f1a2b3c4d5e6f7g8h9i0j1`, {
      headers: { 'Authorization': `Bearer ${valerieToken}` }
    });
    
    const teams = teamsResponse.data.teams || [];
    const valerieTeam = teams.find(team => 
      team.teamMembers.some(member => member.email === 'valerie.m2@example.com')
    );
    
    if (valerieTeam) {
      console.log(`✅ Valerie is in team: ${valerieTeam.teamName}`);
      console.log(`   Team members: ${valerieTeam.teamMembers.map(m => m.name).join(', ')}`);
    } else {
      console.log('❌ Valerie is not in any team');
    }

    console.log('\n🎉 STATE CHECK COMPLETED!');
    
  } catch (error) {
    console.log('❌ Check failed:', error.response?.data?.message || error.message);
  }
}

checkCurrentState();
