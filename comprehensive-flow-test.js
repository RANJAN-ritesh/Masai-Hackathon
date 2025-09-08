// COMPREHENSIVE TEST SUITE - Admin vs Participant Team Selection Flow
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

function logTest(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, error: error?.message || error });
    console.log(`❌ ${testName}: ${error?.message || error}`);
  }
}

async function createTestUser(prefix) {
  const timestamp = Date.now();
  try {
    const userResponse = await axios.post(`${BASE_URL}/users/create-user`, {
      userId: `${prefix}_${timestamp}`,
      name: `Test ${prefix}`,
      code: `${prefix}${timestamp}`,
      course: 'Full Stack',
      skills: ['JavaScript', 'React'],
      vertical: 'Web Development',
      phoneNumber: `123456789${timestamp % 10}`,
      email: `${prefix.toLowerCase()}${timestamp}@example.com`,
      password: 'password123'
    });
    
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    return {
      user: userResponse.data.user,
      token: loginResponse.data.token
    };
  } catch (error) {
    console.log(`❌ Failed to create ${prefix} user:`, error.response?.data?.message);
    return null;
  }
}

async function testAdminBasedTeamFlow() {
  console.log('\n🏢 TESTING ADMIN-BASED TEAM SELECTION FLOW...\n');
  
  // Create admin user
  const admin = await createTestUser('ADMIN');
  if (!admin) {
    logTest('Admin User Creation', false, 'Failed to create admin user');
    return;
  }
  
  logTest('Admin User Creation', true);
  
  // Create hackathon with admin-only teams
  try {
    const hackathonResponse = await axios.post(`${BASE_URL}/hackathons`, {
      title: 'Admin Team Test Hackathon',
      description: 'Test hackathon for admin-based teams',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      allowParticipantTeams: false,
      teamCreationMode: 'admin'
    }, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    logTest('Admin Hackathon Creation', true);
    const hackathonId = hackathonResponse.data._id;
    
    // Create team as admin
    const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Admin Created Team',
      description: 'Team created by admin',
      memberLimit: 4,
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    logTest('Admin Team Creation', true);
    const teamId = teamResponse.data._id;
    
    // Test polling functionality
    await testPollingFlow(admin.token, teamId, 'Admin-Based Team');
    
  } catch (error) {
    logTest('Admin Team Flow', false, error.response?.data?.message);
  }
}

async function testParticipantBasedTeamFlow() {
  console.log('\n👥 TESTING PARTICIPANT-BASED TEAM SELECTION FLOW...\n');
  
  // Create participant user
  const participant = await createTestUser('PARTICIPANT');
  if (!participant) {
    logTest('Participant User Creation', false, 'Failed to create participant user');
    return;
  }
  
  logTest('Participant User Creation', true);
  
  // Create hackathon with participant teams allowed
  try {
    const hackathonResponse = await axios.post(`${BASE_URL}/hackathons`, {
      title: 'Participant Team Test Hackathon',
      description: 'Test hackathon for participant-based teams',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      allowParticipantTeams: true,
      teamCreationMode: 'participant'
    }, {
      headers: { 'Authorization': `Bearer ${participant.token}` }
    });
    
    logTest('Participant Hackathon Creation', true);
    const hackathonId = hackathonResponse.data._id;
    
    // Create team as participant
    const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Participant Created Team',
      description: 'Team created by participant',
      memberLimit: 4,
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${participant.token}` }
    });
    
    logTest('Participant Team Creation', true);
    const teamId = teamResponse.data._id;
    
    // Test polling functionality
    await testPollingFlow(participant.token, teamId, 'Participant-Based Team');
    
  } catch (error) {
    logTest('Participant Team Flow', false, error.response?.data?.message);
  }
}

async function testPollingFlow(token, teamId, teamType) {
  console.log(`\n🗳️ TESTING POLLING FLOW FOR ${teamType}...\n`);
  
  // Test 1: Get poll status
  try {
    const pollStatusResponse = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logTest(`${teamType} - Get Poll Status`, true);
    console.log(`   Poll active: ${pollStatusResponse.data.pollActive}`);
  } catch (error) {
    logTest(`${teamType} - Get Poll Status`, false, error.response?.data?.message);
  }
  
  // Test 2: Start poll
  try {
    const startPollResponse = await axios.post(`${BASE_URL}/team-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logTest(`${teamType} - Start Poll`, true);
    console.log(`   Poll started successfully`);
  } catch (error) {
    logTest(`${teamType} - Start Poll`, false, error.response?.data?.message);
    console.log(`   Debug info:`, error.response?.data?.debug);
  }
  
  // Test 3: Vote on problem statement
  try {
    const voteResponse = await axios.post(`${BASE_URL}/team-polling/vote-problem-statement`, {
      teamId: teamId,
      problemStatementId: 'ML',
      hackathonId: 'test-hackathon-id'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logTest(`${teamType} - Vote on Problem Statement`, true);
  } catch (error) {
    logTest(`${teamType} - Vote on Problem Statement`, false, error.response?.data?.message);
  }
  
  // Test 4: Conclude poll
  try {
    const concludePollResponse = await axios.post(`${BASE_URL}/team-polling/conclude-poll`, {
      teamId: teamId
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logTest(`${teamType} - Conclude Poll`, true);
    console.log(`   Poll concluded successfully`);
    console.log(`   Winning problem statement: ${concludePollResponse.data.winningProblemStatement}`);
  } catch (error) {
    logTest(`${teamType} - Conclude Poll`, false, error.response?.data?.message);
  }
  
  // Test 5: Verify poll is concluded
  try {
    const pollStatusResponse = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    logTest(`${teamType} - Verify Poll Concluded`, !pollStatusResponse.data.pollActive);
    console.log(`   Poll active after conclusion: ${pollStatusResponse.data.pollActive}`);
  } catch (error) {
    logTest(`${teamType} - Verify Poll Concluded`, false, error.response?.data?.message);
  }
}

async function testEdgeCases() {
  console.log('\n🔍 TESTING EDGE CASES...\n');
  
  // Test 1: Try to conclude poll without being team leader
  const nonLeader = await createTestUser('NONLEADER');
  if (nonLeader) {
    try {
      const concludeResponse = await axios.post(`${BASE_URL}/team-polling/conclude-poll`, {
        teamId: 'some-team-id'
      }, {
        headers: { 'Authorization': `Bearer ${nonLeader.token}` }
      });
      logTest('Non-Leader Conclude Poll', false, 'Should have been rejected');
    } catch (error) {
      if (error.response?.status === 403) {
        logTest('Non-Leader Conclude Poll', true, 'Correctly rejected');
      } else {
        logTest('Non-Leader Conclude Poll', false, error.response?.data?.message);
      }
    }
  }
  
  // Test 2: Try to conclude poll when no poll is active
  const leader = await createTestUser('LEADER');
  if (leader) {
    try {
      const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
        teamName: 'Edge Case Team',
        description: 'Team for edge case testing',
        memberLimit: 4
      }, {
        headers: { 'Authorization': `Bearer ${leader.token}` }
      });
      
      const concludeResponse = await axios.post(`${BASE_URL}/team-polling/conclude-poll`, {
        teamId: teamResponse.data._id
      }, {
        headers: { 'Authorization': `Bearer ${leader.token}` }
      });
      logTest('Conclude Non-Active Poll', false, 'Should have been rejected');
    } catch (error) {
      if (error.response?.status === 400) {
        logTest('Conclude Non-Active Poll', true, 'Correctly rejected');
      } else {
        logTest('Conclude Non-Active Poll', false, error.response?.data?.message);
      }
    }
  }
}

async function runComprehensiveTest() {
  console.log('🚀 COMPREHENSIVE TEST SUITE - ADMIN VS PARTICIPANT TEAMS');
  console.log('🎯 EXTREME PREJUDICE TESTING MODE ACTIVATED\n');
  
  const startTime = Date.now();
  
  // Test both flows
  await testAdminBasedTeamFlow();
  await testParticipantBasedTeamFlow();
  await testEdgeCases();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Print results
  console.log('\n' + '='.repeat(60));
  console.log('📊 COMPREHENSIVE TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📈 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🚨 FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  console.log('\n🎯 FLOW ANALYSIS:');
  const adminTests = testResults.errors.filter(e => e.test.includes('Admin'));
  const participantTests = testResults.errors.filter(e => e.test.includes('Participant'));
  
  console.log(`Admin-Based Team Flow: ${adminTests.length === 0 ? '✅ WORKING' : '❌ ISSUES'}`);
  console.log(`Participant-Based Team Flow: ${participantTests.length === 0 ? '✅ WORKING' : '❌ ISSUES'}`);
  
  console.log('\n🏁 COMPREHENSIVE TESTING COMPLETE');
}

runComprehensiveTest().catch(console.error);
