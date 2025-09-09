const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 TESTING INVITATION SYSTEM - SIMPLE VERSION\n');

async function testBasicFlow() {
  try {
    // Step 1: Login as Umair
    console.log('\n🔐 Step 1: Logging in as Umair...');
    const umairResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'umair.h1@example.com',
      password: 'password123'
    });
    const umairToken = umairResponse.data.token;
    console.log('✅ Umair login successful');

    // Step 2: Login as Valerie
    console.log('\n🔐 Step 2: Logging in as Valerie...');
    const valerieResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'valerie.m2@example.com',
      password: 'password123'
    });
    const valerieToken = valerieResponse.data.token;
    console.log('✅ Valerie login successful');

    // Step 3: Get hackathons
    console.log('\n🏆 Step 3: Getting hackathons...');
    const hackathonsResponse = await axios.get(`${BASE_URL}/hackathons`, {
      headers: { 'Authorization': `Bearer ${umairToken}` }
    });
    console.log('Response structure:', Object.keys(hackathonsResponse.data));
    
    const hackathons = hackathonsResponse.data.hackathons || hackathonsResponse.data || [];
    console.log(`✅ Found ${hackathons.length} hackathons`);
    
    if (hackathons.length === 0) {
      console.log('❌ No hackathons available for testing');
      return;
    }

    const hackathon = hackathons[0];
    const hackathonId = hackathon._id;
    console.log(`✅ Using hackathon: ${hackathon.title || hackathon.name}`);

    // Step 4: Get participants
    console.log('\n👤 Step 4: Getting participants...');
    const participantsResponse = await axios.get(`${BASE_URL}/participant-team/participants/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${umairToken}` }
    });
    
    const participants = participantsResponse.data.participants || [];
    console.log(`✅ Found ${participants.length} participants`);
    
    const valerie = participants.find(p => p.email === 'valerie.m2@example.com');
    if (!valerie) {
      console.log('❌ Valerie not found in participants');
      return;
    }
    console.log(`✅ Found Valerie: ${valerie.name} (${valerie.email})`);

    // Step 5: Check if Umair has a team
    console.log('\n👥 Step 5: Checking Umair\'s team...');
    const teamsResponse = await axios.get(`${BASE_URL}/team/hackathon/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${umairToken}` }
    });
    
    const teams = teamsResponse.data.teams || [];
    const umairTeam = teams.find(team => 
      team.teamMembers.some(member => member.email === 'umair.h1@example.com')
    );
    
    if (umairTeam) {
      console.log(`✅ Umair is in team: ${umairTeam.teamName}`);
      console.log(`   Team members: ${umairTeam.teamMembers.map(m => m.name).join(', ')}`);
      
      // Step 6: Send invitation
      console.log('\n📨 Step 6: Sending invitation...');
      const invitationResponse = await axios.post(`${BASE_URL}/participant-team/send-invitation`, {
        participantId: valerie._id,
        teamId: umairTeam._id,
        message: 'You are invited to join our team!'
      }, {
        headers: { 'Authorization': `Bearer ${umairToken}` }
      });
      
      console.log('✅ Invitation sent successfully');
      
      // Step 7: Check Valerie's invitations
      console.log('\n📬 Step 7: Checking Valerie\'s invitations...');
      const invitationsResponse = await axios.get(`${BASE_URL}/participant-team/requests`, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      
      const requests = invitationsResponse.data.requests || [];
      const invitations = requests.filter(r => r.requestType === 'invite');
      console.log(`✅ Valerie has ${invitations.length} invitations`);
      
      if (invitations.length > 0) {
        const invitation = invitations[0];
        console.log(`   Invitation from: ${invitation.fromUser?.name} to ${invitation.toUser?.name}`);
        console.log(`   Status: ${invitation.status}`);
        
        // Step 8: Accept invitation
        console.log('\n✅ Step 8: Accepting invitation...');
        const acceptResponse = await axios.put(`${BASE_URL}/participant-team/respond-invitation/${invitation._id}`, {
          response: 'accepted',
          message: 'I accept your invitation!'
        }, {
          headers: { 'Authorization': `Bearer ${valerieToken}` }
        });
        
        console.log('✅ Invitation accepted successfully');
        
        // Step 9: Verify team membership
        console.log('\n👥 Step 9: Verifying team membership...');
        const updatedTeamsResponse = await axios.get(`${BASE_URL}/team/hackathon/${hackathonId}`, {
          headers: { 'Authorization': `Bearer ${umairToken}` }
        });
        
        const updatedTeams = updatedTeamsResponse.data.teams || [];
        const updatedUmairTeam = updatedTeams.find(team => 
          team.teamMembers.some(member => member.email === 'umair.h1@example.com')
        );
        
        if (updatedUmairTeam) {
          console.log(`✅ Updated team: ${updatedUmairTeam.teamName}`);
          console.log(`   Team members: ${updatedUmairTeam.teamMembers.map(m => m.name).join(', ')}`);
          console.log(`   Team size: ${updatedUmairTeam.teamMembers.length}/${updatedUmairTeam.memberLimit}`);
          
          const valerieInTeam = updatedUmairTeam.teamMembers.some(member => member.email === 'valerie.m2@example.com');
          if (valerieInTeam) {
            console.log('✅ SUCCESS: Valerie is now in the team!');
          } else {
            console.log('❌ FAILURE: Valerie is not in the team');
          }
        }
      }
    } else {
      console.log('❌ Umair is not in any team - cannot send invitations');
    }

    console.log('\n🎉 INVITATION SYSTEM TEST COMPLETED!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testBasicFlow();
