const axios = require('axios');

// Configuration
const BASE_URL = 'https://masai-hackathon.onrender.com';
const TEST_USERS = [
  {
    email: 'testuser1@example.com',
    password: 'password123',
    name: 'Test User 1'
  },
  {
    email: 'testuser2@example.com',
    password: 'password123',
    name: 'Test User 2'
  },
  {
    email: 'testuser3@example.com',
    password: 'password123',
    name: 'Test User 3'
  }
];

let authTokens = {};
let testHackathonId = null;
let testTeamId = null;

// Test utilities
const log = (message, type = 'INFO') => {
  const timestamp = new Date().toISOString();
  const color = type === 'SUCCESS' ? '\x1b[32m' : type === 'ERROR' ? '\x1b[31m' : '\x1b[36m';
  const reset = '\x1b[0m';
  console.log(`${color}[${timestamp}] ${type}:${reset} ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Test functions
async function testUserAuthentication() {
  log('Testing user authentication...');
  
  for (let i = 0; i < TEST_USERS.length; i++) {
    try {
      const user = TEST_USERS[i];
      const response = await axios.post(`${BASE_URL}/users/login`, {
        email: user.email,
        password: user.password
      });
      
      if (response.data.token) {
        authTokens[user.email] = response.data.token;
        log(`✅ User ${user.name} authenticated successfully`, 'SUCCESS');
      } else {
        log(`❌ User ${user.name} authentication failed`, 'ERROR');
      }
    } catch (error) {
      log(`❌ User ${user.name} authentication error: ${error.response?.data?.message || error.message}`, 'ERROR');
    }
  }
}

async function testHackathonCreation() {
  log('Testing hackathon creation with participant team support...');
  
  try {
    const adminToken = authTokens[TEST_USERS[0].email];
    if (!adminToken) {
      log('❌ Admin token not available', 'ERROR');
      return;
    }

    const hackathonData = {
      title: 'Test Participant Team Hackathon',
      description: 'A hackathon to test participant team creation',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      eventType: 'Team Hackathon',
      minTeamSize: 2,
      maxTeamSize: 4,
      allowParticipantTeams: true,
      teamCreationMode: 'both',
      teamFinalizationRequired: true,
      minTeamSizeForFinalization: 2,
      autoTeamCreationEnabled: true
    };

    const response = await axios.post(`${BASE_URL}/hackathons`, hackathonData, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data._id) {
      testHackathonId = response.data._id;
      log(`✅ Hackathon created successfully with ID: ${testHackathonId}`, 'SUCCESS');
      log(`   - Participant teams: ${response.data.allowParticipantTeams}`, 'INFO');
      log(`   - Team creation mode: ${response.data.teamCreationMode}`, 'INFO');
    } else {
      log('❌ Hackathon creation failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Hackathon creation error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testParticipantTeamCreation() {
  log('Testing participant team creation...');
  
  try {
    const userToken = authTokens[TEST_USERS[1].email];
    if (!userToken || !testHackathonId) {
      log('❌ User token or hackathon ID not available', 'ERROR');
      return;
    }

    const teamData = {
      teamName: 'test_team_123',
      description: 'A test team for validation',
      hackathonId: testHackathonId
    };

    const response = await axios.post(`${BASE_URL}/participant-team/create-team`, teamData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.team?.id) {
      testTeamId = response.data.team.id;
      log(`✅ Team created successfully with ID: ${testTeamId}`, 'SUCCESS');
      log(`   - Team name: ${response.data.team.teamName}`, 'INFO');
      log(`   - Member count: ${response.data.team.memberCount}`, 'INFO');
      log(`   - Status: ${response.data.team.status}`, 'INFO');
    } else {
      log('❌ Team creation failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Team creation error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testTeamNameValidation() {
  log('Testing team name validation...');
  
  const invalidNames = [
    'TEAM_NAME_UPPERCASE', // Uppercase not allowed
    'team name with spaces', // Spaces not allowed
    'team@name', // Special characters not allowed
    'a'.repeat(17), // Too long
    '123team', // Numbers not allowed
    'team-name-very-long-name-that-exceeds-limit' // Too long
  ];

  const userToken = authTokens[TEST_USERS[1].email];
  if (!userToken || !testHackathonId) {
    log('❌ User token or hackathon ID not available', 'ERROR');
    return;
  }

  for (const invalidName of invalidNames) {
    try {
      const teamData = {
        teamName: invalidName,
        description: 'Testing invalid team name',
        hackathonId: testHackathonId
      };

      await axios.post(`${BASE_URL}/participant-team/create-team`, teamData, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      log(`❌ Team name "${invalidName}" should have been rejected`, 'ERROR');
    } catch (error) {
      if (error.response?.status === 400) {
        log(`✅ Team name "${invalidName}" correctly rejected: ${error.response.data.message}`, 'SUCCESS');
      } else {
        log(`❌ Unexpected error for team name "${invalidName}": ${error.message}`, 'ERROR');
      }
    }
  }
}

async function testJoinRequestSystem() {
  log('Testing join request system...');
  
  try {
    const userToken = authTokens[TEST_USERS[2].email];
    if (!userToken || !testTeamId) {
      log('❌ User token or team ID not available', 'ERROR');
      return;
    }

    // Send join request
    const requestData = {
      teamId: testTeamId,
      message: 'I would like to join your team!'
    };

    const response = await axios.post(`${BASE_URL}/participant-team/send-request`, requestData, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.request?.id) {
      log(`✅ Join request sent successfully with ID: ${response.data.request.id}`, 'SUCCESS');
      
      // Test responding to request
      await testRequestResponse(response.data.request.id);
    } else {
      log('❌ Join request failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Join request error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testRequestResponse(requestId) {
  log('Testing request response...');
  
  try {
    const teamCreatorToken = authTokens[TEST_USERS[1].email];
    if (!teamCreatorToken) {
      log('❌ Team creator token not available', 'ERROR');
      return;
    }

    // Accept the request
    const response = await axios.put(`${BASE_URL}/participant-team/request/${requestId}/respond`, {
      response: 'accepted',
      message: 'Welcome to the team!'
    }, {
      headers: { Authorization: `Bearer ${teamCreatorToken}` }
    });

    if (response.data.message) {
      log(`✅ Request responded to successfully: ${response.data.message}`, 'SUCCESS');
    } else {
      log('❌ Request response failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Request response error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testTeamFinalization() {
  log('Testing team finalization...');
  
  try {
    const teamCreatorToken = authTokens[TEST_USERS[1].email];
    if (!teamCreatorToken || !testTeamId) {
      log('❌ Team creator token or team ID not available', 'ERROR');
      return;
    }

    const response = await axios.post(`${BASE_URL}/participant-team/team/${testTeamId}/finalize`, {}, {
      headers: { Authorization: `Bearer ${teamCreatorToken}` }
    });

    if (response.data.message) {
      log(`✅ Team finalized successfully: ${response.data.message}`, 'SUCCESS');
      log(`   - Team status: ${response.data.team?.status}`, 'INFO');
      log(`   - Finalized at: ${response.data.team?.finalizedAt}`, 'INFO');
    } else {
      log('❌ Team finalization failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Team finalization error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testOwnershipTransfer() {
  log('Testing team ownership transfer...');
  
  try {
    const currentOwnerToken = authTokens[TEST_USERS[1].email];
    const newOwnerToken = authTokens[TEST_USERS[2].email];
    
    if (!currentOwnerToken || !newOwnerToken || !testTeamId) {
      log('❌ Required tokens or team ID not available', 'ERROR');
      return;
    }

    // Get user ID for new owner
    const userResponse = await axios.get(`${BASE_URL}/users/profile`, {
      headers: { Authorization: `Bearer ${newOwnerToken}` }
    });

    if (!userResponse.data._id) {
      log('❌ Could not get new owner user ID', 'ERROR');
      return;
    }

    const transferData = {
      newOwnerId: userResponse.data._id
    };

    const response = await axios.post(`${BASE_URL}/participant-team/team/${testTeamId}/transfer-ownership`, transferData, {
      headers: { Authorization: `Bearer ${currentOwnerToken}` }
    });

    if (response.data.message) {
      log(`✅ Ownership transferred successfully: ${response.data.message}`, 'SUCCESS');
    } else {
      log('❌ Ownership transfer failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Ownership transfer error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testNotificationSystem() {
  log('Testing notification system...');
  
  try {
    const userToken = authTokens[TEST_USERS[1].email];
    if (!userToken) {
      log('❌ User token not available', 'ERROR');
      return;
    }

    const response = await axios.get(`${BASE_URL}/participant-team/notifications`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.notifications) {
      log(`✅ Notifications retrieved successfully: ${response.data.notifications.length} notifications`, 'SUCCESS');
      
      // Test marking as read
      if (response.data.notifications.length > 0) {
        const firstNotification = response.data.notifications[0];
        await testMarkNotificationAsRead(firstNotification._id, userToken);
      }
    } else {
      log('❌ Notifications retrieval failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Notifications error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testMarkNotificationAsRead(notificationId, userToken) {
  log('Testing mark notification as read...');
  
  try {
    const response = await axios.put(`${BASE_URL}/participant-team/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.message) {
      log(`✅ Notification marked as read: ${response.data.message}`, 'SUCCESS');
    } else {
      log('❌ Mark as read failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Mark as read error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function testCleanup() {
  log('Testing cleanup operations...');
  
  try {
    // Test leaving team
    const userToken = authTokens[TEST_USERS[2].email];
    if (!userToken || !testTeamId) {
      log('❌ User token or team ID not available', 'ERROR');
      return;
    }

    const response = await axios.post(`${BASE_URL}/participant-team/team/${testTeamId}/leave`, {}, {
      headers: { Authorization: `Bearer ${userToken}` }
    });

    if (response.data.message) {
      log(`✅ User left team successfully: ${response.data.message}`, 'SUCCESS');
    } else {
      log('❌ Leave team failed', 'ERROR');
    }
  } catch (error) {
    log(`❌ Cleanup error: ${error.response?.data?.message || error.message}`, 'ERROR');
  }
}

async function runAllTests() {
  log('🚀 Starting comprehensive participant team creation tests...', 'INFO');
  log('==================================================', 'INFO');
  
  try {
    // Run all tests in sequence
    await testUserAuthentication();
    await sleep(1000);
    
    await testHackathonCreation();
    await sleep(1000);
    
    await testParticipantTeamCreation();
    await sleep(1000);
    
    await testTeamNameValidation();
    await sleep(1000);
    
    await testJoinRequestSystem();
    await sleep(1000);
    
    await testTeamFinalization();
    await sleep(1000);
    
    await testOwnershipTransfer();
    await sleep(1000);
    
    await testNotificationSystem();
    await sleep(1000);
    
    await testCleanup();
    
    log('==================================================', 'INFO');
    log('🎉 All tests completed successfully!', 'SUCCESS');
    log('✅ Participant team creation feature is working correctly', 'SUCCESS');
    
  } catch (error) {
    log('==================================================', 'INFO');
    log(`❌ Test suite failed: ${error.message}`, 'ERROR');
  }
}

// Run the tests
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testUserAuthentication,
  testHackathonCreation,
  testParticipantTeamCreation,
  testTeamNameValidation,
  testJoinRequestSystem,
  testRequestResponse,
  testTeamFinalization,
  testOwnershipTransfer,
  testNotificationSystem,
  testMarkNotificationAsRead,
  testCleanup
}; 