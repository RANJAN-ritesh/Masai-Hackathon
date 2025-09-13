#!/usr/bin/env node

const baseURL = 'https://masai-hackathon.onrender.com';

async function testInvitationFlow() {
  console.log('🧪 TESTING INVITATION FLOW');
  console.log('=' .repeat(50));

  try {
    // 1. Login as Aaron Miller
    console.log('\n1. Logging in as Aaron Miller...');
    const loginResponse = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aaron.miller1@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const aaronToken = loginData.token;
    console.log('✅ Aaron Miller logged in');

    // 2. Get Aaron's team
    console.log('\n2. Getting Aaron\'s team...');
    const teamResponse = await fetch(`${baseURL}/team/hackathon/68c589929a06624681ee20b7`, {
      headers: {
        'Authorization': `Bearer ${aaronToken}`
      }
    });

    if (!teamResponse.ok) {
      console.log('❌ Failed to get team');
      return;
    }

    const teamData = await teamResponse.json();
    const aaronTeam = teamData.teams?.find(team => 
      team.teamMembers.some(member => member._id === loginData.userId)
    );

    if (!aaronTeam) {
      console.log('❌ Aaron\'s team not found');
      return;
    }

    console.log('✅ Aaron\'s team found:', aaronTeam.teamName);
    console.log('   Team ID:', aaronTeam._id);
    console.log('   Team Leader:', aaronTeam.teamLeader);
    console.log('   Aaron\'s ID:', loginData.userId);

    // 3. Get participants to find Bianca
    console.log('\n3. Getting participants...');
    const participantsResponse = await fetch(`${baseURL}/participant-team/participants/68c589929a06624681ee20b7`, {
      headers: {
        'Authorization': `Bearer ${aaronToken}`
      }
    });

    if (!participantsResponse.ok) {
      console.log('❌ Failed to get participants');
      return;
    }

    const participantsData = await participantsResponse.json();
    const bianca = participantsData.participants?.find(p => p.email === 'bianca.rod2@example.com');

    if (!bianca) {
      console.log('❌ Bianca not found');
      return;
    }

    console.log('✅ Bianca found:', bianca.name);
    console.log('   Bianca ID:', bianca._id);
    console.log('   Bianca Status:', bianca.status);

    // 4. Send invitation
    console.log('\n4. Sending invitation to Bianca...');
    const inviteResponse = await fetch(`${baseURL}/participant-team/send-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${aaronToken}`
      },
      body: JSON.stringify({
        participantId: bianca._id,
        teamId: aaronTeam._id,
        message: 'You are invited to join our team!'
      })
    });

    if (inviteResponse.ok) {
      const inviteData = await inviteResponse.json();
      console.log('✅ Invitation sent successfully!');
      console.log('   Invitation ID:', inviteData.invitation?.id);
    } else {
      const error = await inviteResponse.json();
      console.log('❌ Failed to send invitation:', error.message);
      console.log('   Status:', inviteResponse.status);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testInvitationFlow();
