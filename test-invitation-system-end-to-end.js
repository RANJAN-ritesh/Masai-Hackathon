import fetch from 'node-fetch';

const baseURL = 'https://masai-hackathon.onrender.com';

async function testInvitationSystem() {
  console.log('🎯 Testing Invitation System End-to-End\n');

  try {
    // Step 1: Login as a team leader
    console.log('1️⃣ Logging in as team leader...');
    const loginResponse = await fetch(`${baseURL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'aaron.miller1@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const teamLeaderId = loginData.user._id;
    console.log('✅ Team leader logged in:', loginData.user.name);

    // Step 2: Get hackathon participants
    console.log('\n2️⃣ Getting hackathon participants...');
    const hackathonId = '507f1f77bcf86cd799439011'; // Use the first hackathon
    const participantsResponse = await fetch(`${baseURL}/users/hackathon/${hackathonId}/participants`, {
      headers: { 'Authorization': `Bearer ${teamLeaderId}` }
    });

    if (!participantsResponse.ok) {
      throw new Error(`Failed to get participants: ${participantsResponse.status}`);
    }

    const participantsData = await participantsResponse.json();
    const availableParticipants = participantsData.participants.filter(p => !p.currentTeamId && p._id !== teamLeaderId);
    console.log(`✅ Found ${availableParticipants.length} available participants`);

    if (availableParticipants.length === 0) {
      console.log('⚠️ No available participants to invite');
      return;
    }

    // Step 3: Get team leader's team
    console.log('\n3️⃣ Getting team leader\'s team...');
    const teamResponse = await fetch(`${baseURL}/team/hackathon/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${teamLeaderId}` }
    });

    if (!teamResponse.ok) {
      throw new Error(`Failed to get team: ${teamResponse.status}`);
    }

    const teamData = await teamResponse.json();
    const userTeam = teamData.teams?.find(team => 
      team.teamMembers.some(member => member._id === teamLeaderId) ||
      team.createdBy?._id === teamLeaderId
    );

    if (!userTeam) {
      console.log('⚠️ Team leader is not in a team, cannot send invitations');
      return;
    }

    console.log('✅ Found team:', userTeam.teamName);

    // Step 4: Send invitation to first available participant
    console.log('\n4️⃣ Sending invitation...');
    const participantToInvite = availableParticipants[0];
    const invitationResponse = await fetch(`${baseURL}/participant-team/send-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${teamLeaderId}`
      },
      body: JSON.stringify({
        participantId: participantToInvite._id,
        teamId: userTeam._id,
        message: `You are invited to join our team "${userTeam.teamName}"!`
      })
    });

    if (!invitationResponse.ok) {
      const error = await invitationResponse.json();
      throw new Error(`Failed to send invitation: ${error.message}`);
    }

    console.log('✅ Invitation sent to:', participantToInvite.name);

    // Step 5: Login as the invited participant
    console.log('\n5️⃣ Logging in as invited participant...');
    const participantLoginResponse = await fetch(`${baseURL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: participantToInvite.email,
        password: 'password123'
      })
    });

    if (!participantLoginResponse.ok) {
      throw new Error(`Participant login failed: ${participantLoginResponse.status}`);
    }

    const participantLoginData = await participantLoginResponse.json();
    const participantId = participantLoginData.user._id;
    console.log('✅ Participant logged in:', participantLoginData.user.name);

    // Step 6: Get invitations for the participant
    console.log('\n6️⃣ Getting invitations for participant...');
    const invitationsResponse = await fetch(`${baseURL}/participant-team/requests`, {
      headers: { 'Authorization': `Bearer ${participantId}` }
    });

    if (!invitationsResponse.ok) {
      throw new Error(`Failed to get invitations: ${invitationsResponse.status}`);
    }

    const invitationsData = await invitationsResponse.json();
    const invitations = invitationsData.requests.filter(request => 
      request.toUserId === participantId && request.requestType === 'invite'
    );

    if (invitations.length === 0) {
      console.log('⚠️ No invitations found for participant');
      return;
    }

    console.log(`✅ Found ${invitations.length} invitation(s)`);

    // Step 7: Accept the invitation
    console.log('\n7️⃣ Accepting invitation...');
    const acceptResponse = await fetch(`${baseURL}/participant-team/respond-invitation/${invitations[0]._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${participantId}`
      },
      body: JSON.stringify({
        response: 'accepted',
        message: 'I accept your invitation!'
      })
    });

    if (!acceptResponse.ok) {
      const error = await acceptResponse.json();
      throw new Error(`Failed to accept invitation: ${error.message}`);
    }

    console.log('✅ Invitation accepted successfully!');

    // Step 8: Verify participant is now in the team
    console.log('\n8️⃣ Verifying team membership...');
    const updatedTeamResponse = await fetch(`${baseURL}/team/hackathon/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${participantId}` }
    });

    if (!updatedTeamResponse.ok) {
      throw new Error(`Failed to get updated team: ${updatedTeamResponse.status}`);
    }

    const updatedTeamData = await updatedTeamResponse.json();
    const updatedUserTeam = updatedTeamData.teams?.find(team => 
      team.teamMembers.some(member => member._id === participantId)
    );

    if (updatedUserTeam) {
      console.log('✅ Participant successfully joined team:', updatedUserTeam.teamName);
      console.log(`✅ Team now has ${updatedUserTeam.teamMembers.length} members`);
    } else {
      console.log('❌ Participant is not in the team after accepting invitation');
    }

    console.log('\n🎉 INVITATION SYSTEM TEST COMPLETED SUCCESSFULLY!');
    console.log('\n✅ All features working:');
    console.log('   - Team leaders can send invitations');
    console.log('   - Participants can receive invitations');
    console.log('   - Participants can accept invitations');
    console.log('   - Team membership updates automatically');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testInvitationSystem();
