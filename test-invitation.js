#!/usr/bin/env node

const https = require('https');

const BASE_URL = 'https://masai-hackathon.onrender.com';

// Test user credentials
const testUser = {
  email: 'aaron.miller1@example.com',
  password: 'password123'
};

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testInvitationFlow() {
  console.log('🧪 TESTING TEAM INVITATION FLOW');
  console.log('=' .repeat(50));

  try {
    // Step 1: Authenticate user
    console.log('1️⃣ Authenticating user...');
    const auth = await makeRequest(`${BASE_URL}/users/verify-user`, {
      method: 'POST',
      body: testUser
    });

    if (auth.status !== 200) {
      console.log('❌ Authentication failed:', auth.data);
      return;
    }

    const userId = auth.data.user._id;
    const userToken = userId; // Using userId as token (matches backend auth)

    console.log('✅ Authentication successful:', auth.data.user.name);

    // Step 2: Get hackathons
    console.log('\n2️⃣ Getting hackathons...');
    const hackathons = await makeRequest(`${BASE_URL}/hackathons`);
    
    if (hackathons.status !== 200 || !hackathons.data.length) {
      console.log('❌ No hackathons found');
      return;
    }

    const hackathon = hackathons.data[0];
    console.log('✅ Found hackathon:', hackathon.title);

    // Step 3: Get participants
    console.log('\n3️⃣ Getting participants...');
    const participants = await makeRequest(`${BASE_URL}/participants/${hackathon._id}`);
    
    if (participants.status !== 200 || !participants.data.participants.length) {
      console.log('❌ No participants found');
      return;
    }

    console.log(`✅ Found ${participants.data.participants.length} participants`);

    // Step 4: Get teams
    console.log('\n4️⃣ Getting teams...');
    const teams = await makeRequest(`${BASE_URL}/team/hackathon/${hackathon._id}`);
    
    if (teams.status !== 200) {
      console.log('❌ Failed to get teams');
      return;
    }

    console.log(`✅ Found ${teams.data.teams?.length || 0} teams`);

    // Step 5: Find user's team
    console.log('\n5️⃣ Finding user\'s team...');
    const userTeam = teams.data.teams?.find(team => 
      team.teamMembers.some(member => member._id === userId) ||
      team.createdBy?._id === userId
    );

    if (!userTeam) {
      console.log('❌ User is not in any team');
      return;
    }

    console.log('✅ User is in team:', userTeam.teamName);

    // Step 6: Find a participant to invite (someone not in a team)
    console.log('\n6️⃣ Finding participant to invite...');
    const availableParticipant = participants.data.participants.find(p => 
      !p.currentTeamId && p._id !== userId
    );

    if (!availableParticipant) {
      console.log('❌ No available participants to invite');
      return;
    }

    console.log('✅ Found participant to invite:', availableParticipant.name);

    // Step 7: Send invitation
    console.log('\n7️⃣ Sending invitation...');
    const invitation = await makeRequest(`${BASE_URL}/participant-team/send-invitation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: {
        participantId: availableParticipant._id,
        teamId: userTeam._id,
        message: 'You are invited to join our team!'
      }
    });

    console.log('📤 Invitation Response:', {
      status: invitation.status,
      data: invitation.data
    });

    if (invitation.status === 201) {
      console.log('✅ Invitation sent successfully!');
    } else {
      console.log('❌ Invitation failed:', invitation.data);
    }

    // Step 8: Test notification service
    console.log('\n8️⃣ Testing notification service...');
    const notifications = await makeRequest(`${BASE_URL}/notifications/${userId}`, {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });

    console.log('📨 Notifications Response:', {
      status: notifications.status,
      count: notifications.data.notifications?.length || 0
    });

    if (notifications.status === 200) {
      console.log('✅ Notification service working');
    } else {
      console.log('❌ Notification service failed:', notifications.data);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testInvitationFlow().then(() => {
  console.log('\n🎯 INVITATION FLOW TEST COMPLETE');
  console.log('=' .repeat(50));
}).catch(error => {
  console.error('❌ Test runner failed:', error);
});
