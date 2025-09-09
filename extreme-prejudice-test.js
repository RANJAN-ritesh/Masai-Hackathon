// EXTREME PREJUDICE TESTING SUITE - COMPLETE WORKFLOW TESTING
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: [],
  criticalIssues: [],
  warnings: []
};

function logTest(testName, passed, error = null, critical = false) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    const errorObj = { test: testName, error: error?.message || error };
    testResults.errors.push(errorObj);
    if (critical) {
      testResults.criticalIssues.push(errorObj);
    }
    console.log(`❌ ${testName}: ${error?.message || error}`);
  }
}

function logWarning(message) {
  testResults.warnings.push(message);
  console.log(`⚠️  WARNING: ${message}`);
}

async function createUniqueUser(prefix) {
  const timestamp = Date.now() + Math.random() * 1000;
  try {
    const userResponse = await axios.post(`${BASE_URL}/users/create-user`, {
      userId: `TEST_${prefix}_${timestamp}`,
      name: `Test ${prefix} ${timestamp}`,
      code: `TEST${prefix}${timestamp}`,
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React', 'Node.js'],
      vertical: 'Web Development',
      phoneNumber: `987654321${Math.floor(timestamp % 1000)}`,
      email: `test${prefix}${timestamp}@example.com`,
      password: 'password123'
    });
    
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: userResponse.data.user.email,
      password: 'password123'
    });
    
    return {
      user: userResponse.data.user,
      token: loginResponse.data.token,
      email: userResponse.data.user.email
    };
  } catch (error) {
    throw new Error(`Failed to create ${prefix} user: ${error.response?.data?.message || error.message}`);
  }
}

async function testCompleteLoginWorkflow() {
  console.log('\n🔐 TESTING COMPLETE LOGIN WORKFLOW...\n');
  
  try {
    // Test 1: User Creation
    console.log('1️⃣ Testing user creation...');
    const user = await createUniqueUser('LOGIN');
    logTest('User Creation', true);
    
    // Test 2: Login with correct credentials
    console.log('2️⃣ Testing login with correct credentials...');
    const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: user.email,
      password: 'password123'
    });
    logTest('Login with Correct Credentials', loginResponse.status === 200);
    
    // Test 3: Login with wrong password
    console.log('3️⃣ Testing login with wrong password...');
    try {
      await axios.post(`${BASE_URL}/users/verify-user`, {
        email: user.email,
        password: 'wrongpassword'
      });
      logTest('Login with Wrong Password', false, 'Should have been rejected');
    } catch (error) {
      logTest('Login with Wrong Password', error.response?.status === 401, null, true);
    }
    
    // Test 4: Login with non-existent email
    console.log('4️⃣ Testing login with non-existent email...');
    try {
      await axios.post(`${BASE_URL}/users/verify-user`, {
        email: 'nonexistent@example.com',
        password: 'password123'
      });
      logTest('Login with Non-existent Email', false, 'Should have been rejected');
    } catch (error) {
      logTest('Login with Non-existent Email', error.response?.status === 404, null, true);
    }
    
    // Test 5: Token validation
    console.log('5️⃣ Testing token validation...');
    const protectedResponse = await axios.get(`${BASE_URL}/team/get-teams`, {
      headers: { 'Authorization': `Bearer ${user.token}` }
    });
    logTest('Token Validation', protectedResponse.status === 200);
    
    return user;
    
  } catch (error) {
    logTest('Complete Login Workflow', false, error.message, true);
    return null;
  }
}

async function testAdminHackathonCreation(adminUser) {
  console.log('\n🏢 TESTING ADMIN HACKATHON CREATION...\n');
  
  try {
    // Test 1: Create hackathon with all fields
    console.log('1️⃣ Testing hackathon creation with all fields...');
    const hackathonResponse = await axios.post(`${BASE_URL}/hackathons`, {
      title: 'Extreme Test Hackathon',
      description: 'Comprehensive testing hackathon',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      submissionStartDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      submissionEndDate: new Date(Date.now() + 71 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      allowParticipantTeams: true,
      teamCreationMode: 'participant',
      problemStatements: [
        { track: 'AI/ML', description: 'Build an AI-powered solution' },
        { track: 'Web Dev', description: 'Create a modern web application' },
        { track: 'Mobile', description: 'Develop a mobile app' }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${adminUser.token}` }
    });
    
    logTest('Hackathon Creation with All Fields', hackathonResponse.status === 201);
    const hackathonId = hackathonResponse.data._id;
    
    // Test 2: Verify hackathon data
    console.log('2️⃣ Verifying hackathon data...');
    const hackathon = hackathonResponse.data;
    const hasRequiredFields = hackathon.title && hackathon.description && hackathon.startDate && hackathon.endDate;
    logTest('Hackathon Data Verification', hasRequiredFields);
    
    // Test 3: Create admin-only hackathon
    console.log('3️⃣ Testing admin-only hackathon creation...');
    const adminOnlyHackathon = await axios.post(`${BASE_URL}/hackathons`, {
      title: 'Admin Only Hackathon',
      description: 'Admin-only team creation',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      submissionStartDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      submissionEndDate: new Date(Date.now() + 71 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      allowParticipantTeams: false,
      teamCreationMode: 'admin'
    }, {
      headers: { 'Authorization': `Bearer ${adminUser.token}` }
    });
    
    logTest('Admin-Only Hackathon Creation', adminOnlyHackathon.status === 201);
    
    return { participantHackathon: hackathonId, adminHackathon: adminOnlyHackathon.data._id };
    
  } catch (error) {
    logTest('Admin Hackathon Creation', false, error.response?.data?.message || error.message, true);
    return null;
  }
}

async function testParticipantTeamCreation(participantUser, hackathonId) {
  console.log('\n👥 TESTING PARTICIPANT TEAM CREATION...\n');
  
  try {
    // Test 1: Create team
    console.log('1️⃣ Testing team creation...');
    const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Extreme Test Team',
      description: 'Team for comprehensive testing',
      memberLimit: 4,
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${participantUser.token}` }
    });
    
    logTest('Team Creation', teamResponse.status === 201);
    const teamId = teamResponse.data._id;
    
    // Test 2: Verify team leader assignment
    console.log('2️⃣ Verifying team leader assignment...');
    const team = teamResponse.data;
    const hasTeamLeader = team.teamLeader && team.createdBy;
    logTest('Team Leader Assignment', hasTeamLeader);
    
    // Test 3: Test duplicate team name
    console.log('3️⃣ Testing duplicate team name prevention...');
    try {
      await axios.post(`${BASE_URL}/team/create-team`, {
        teamName: 'Extreme Test Team',
        description: 'Duplicate team name test',
        memberLimit: 4,
        hackathonId: hackathonId
      }, {
        headers: { 'Authorization': `Bearer ${participantUser.token}` }
      });
      logTest('Duplicate Team Name Prevention', false, 'Should have been rejected');
    } catch (error) {
      logTest('Duplicate Team Name Prevention', error.response?.status === 400, null, true);
    }
    
    // Test 4: Test team without hackathon ID
    console.log('4️⃣ Testing team creation without hackathon ID...');
    try {
      await axios.post(`${BASE_URL}/team/create-team`, {
        teamName: 'No Hackathon Team',
        description: 'Team without hackathon',
        memberLimit: 4
      }, {
        headers: { 'Authorization': `Bearer ${participantUser.token}` }
      });
      logTest('Team Creation Without Hackathon', true); // Should work
    } catch (error) {
      logTest('Team Creation Without Hackathon', false, error.response?.data?.message);
    }
    
    return teamId;
    
  } catch (error) {
    logTest('Participant Team Creation', false, error.response?.data?.message || error.message, true);
    return null;
  }
}

async function testProblemStatementPolling(leaderUser, teamId, hackathonId) {
  console.log('\n🗳️ TESTING PROBLEM STATEMENT POLLING SYSTEM...\n');
  
  try {
    // Test 1: Get initial poll status
    console.log('1️⃣ Testing initial poll status...');
    const initialStatus = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    logTest('Initial Poll Status', initialStatus.status === 200);
    logTest('Initial Poll Inactive', !initialStatus.data.pollActive);
    
    // Test 2: Start poll
    console.log('2️⃣ Testing poll start...');
    const startPollResponse = await axios.post(`${BASE_URL}/team-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    
    logTest('Start Poll', startPollResponse.status === 200);
    
    // Test 3: Verify poll is active
    console.log('3️⃣ Verifying poll is active...');
    const activeStatus = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    logTest('Poll Active Status', activeStatus.data.pollActive === true);
    
    // Test 4: Vote on problem statement
    console.log('4️⃣ Testing voting on problem statement...');
    const voteResponse = await axios.post(`${BASE_URL}/team-polling/vote-problem-statement`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    
    logTest('Vote on Problem Statement', voteResponse.status === 200);
    
    // Test 5: Conclude poll
    console.log('5️⃣ Testing poll conclusion...');
    const concludeResponse = await axios.post(`${BASE_URL}/team-polling/conclude-poll`, {
      teamId: teamId
    }, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    
    logTest('Conclude Poll', concludeResponse.status === 200);
    
    // Test 6: Verify poll is concluded
    console.log('6️⃣ Verifying poll conclusion...');
    const concludedStatus = await axios.get(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    logTest('Poll Concluded Status', concludedStatus.data.pollActive === false);
    
    // Test 7: Test voting after poll conclusion
    console.log('7️⃣ Testing voting after poll conclusion...');
    try {
      await axios.post(`${BASE_URL}/team-polling/vote-problem-statement`, {
        teamId: teamId,
        problemStatementId: 'Web Dev',
        hackathonId: hackathonId
      }, {
        headers: { 'Authorization': `Bearer ${leaderUser.token}` }
      });
      logTest('Vote After Poll Conclusion', false, 'Should have been rejected');
    } catch (error) {
      logTest('Vote After Poll Conclusion', error.response?.status === 400, null, true);
    }
    
    return true;
    
  } catch (error) {
    logTest('Problem Statement Polling', false, error.response?.data?.message || error.message, true);
    return false;
  }
}

async function testSubmissionSystem(leaderUser, teamId) {
  console.log('\n📤 TESTING SUBMISSION SYSTEM...\n');
  
  try {
    // Test 1: Get submission status
    console.log('1️⃣ Testing submission status...');
    const statusResponse = await axios.get(`${BASE_URL}/submission/submission-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    logTest('Get Submission Status', statusResponse.status === 200);
    logTest('Initial Submission Status', !statusResponse.data.hasSubmitted);
    
    // Test 2: Submit project
    console.log('2️⃣ Testing project submission...');
    const submissionResponse = await axios.post(`${BASE_URL}/submission/submit-project`, {
      teamId: teamId,
      submissionLink: 'https://github.com/test/extreme-test-project'
    }, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    
    logTest('Project Submission', submissionResponse.status === 200);
    
    // Test 3: Verify submission
    console.log('3️⃣ Verifying submission...');
    const verifyResponse = await axios.get(`${BASE_URL}/submission/submission-status/${teamId}`, {
      headers: { 'Authorization': `Bearer ${leaderUser.token}` }
    });
    logTest('Submission Verification', verifyResponse.data.hasSubmitted === true);
    
    // Test 4: Test duplicate submission
    console.log('4️⃣ Testing duplicate submission prevention...');
    try {
      await axios.post(`${BASE_URL}/submission/submit-project`, {
        teamId: teamId,
        submissionLink: 'https://github.com/test/duplicate-submission'
      }, {
        headers: { 'Authorization': `Bearer ${leaderUser.token}` }
      });
      logTest('Duplicate Submission Prevention', false, 'Should have been rejected');
    } catch (error) {
      logTest('Duplicate Submission Prevention', error.response?.status === 400, null, true);
    }
    
    return true;
    
  } catch (error) {
    logTest('Submission System', false, error.response?.data?.message || error.message, true);
    return false;
  }
}

async function testCSVDownload(adminUser, hackathonId) {
  console.log('\n📊 TESTING CSV DOWNLOAD SYSTEM...\n');
  
  try {
    // Test 1: Download CSV
    console.log('1️⃣ Testing CSV download...');
    const csvResponse = await axios.get(`${BASE_URL}/admin/download-hackathon-data/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${adminUser.token}` }
    });
    
    logTest('CSV Download', csvResponse.status === 200);
    
    // Test 2: Verify CSV content
    console.log('2️⃣ Verifying CSV content...');
    const csvContent = csvResponse.data;
    const hasHeaders = csvContent.includes('Team ID') && csvContent.includes('Team Name');
    logTest('CSV Content Verification', hasHeaders);
    
    // Test 3: Get hackathon statistics
    console.log('3️⃣ Testing hackathon statistics...');
    const statsResponse = await axios.get(`${BASE_URL}/admin/hackathon-stats/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${adminUser.token}` }
    });
    
    logTest('Hackathon Statistics', statsResponse.status === 200);
    
    // Test 4: Test unauthorized CSV download
    console.log('4️⃣ Testing unauthorized CSV download...');
    const unauthorizedUser = await createUniqueUser('UNAUTH');
    try {
      await axios.get(`${BASE_URL}/admin/download-hackathon-data/${hackathonId}`, {
        headers: { 'Authorization': `Bearer ${unauthorizedUser.token}` }
      });
      logTest('Unauthorized CSV Download', false, 'Should have been rejected');
    } catch (error) {
      logTest('Unauthorized CSV Download', error.response?.status === 403, null, true);
    }
    
    return true;
    
  } catch (error) {
    logTest('CSV Download System', false, error.response?.data?.message || error.message, true);
    return false;
  }
}

async function testEdgeCases() {
  console.log('\n🔍 TESTING EDGE CASES WITH EXTREME PREJUDICE...\n');
  
  try {
    // Test 1: Invalid token
    console.log('1️⃣ Testing invalid token...');
    try {
      await axios.get(`${BASE_URL}/team/get-teams`, {
        headers: { 'Authorization': 'Bearer invalid-token' }
      });
      logTest('Invalid Token Handling', false, 'Should have been rejected');
    } catch (error) {
      logTest('Invalid Token Handling', error.response?.status === 401, null, true);
    }
    
    // Test 2: Missing token
    console.log('2️⃣ Testing missing token...');
    try {
      await axios.get(`${BASE_URL}/team/get-teams`);
      logTest('Missing Token Handling', false, 'Should have been rejected');
    } catch (error) {
      logTest('Missing Token Handling', error.response?.status === 401, null, true);
    }
    
    // Test 3: Malformed requests
    console.log('3️⃣ Testing malformed requests...');
    try {
      await axios.post(`${BASE_URL}/team/create-team`, {
        // Missing required fields
      }, {
        headers: { 'Authorization': 'Bearer some-token' }
      });
      logTest('Malformed Request Handling', false, 'Should have been rejected');
    } catch (error) {
      logTest('Malformed Request Handling', error.response?.status === 400, null, true);
    }
    
    // Test 4: Non-existent resource access
    console.log('4️⃣ Testing non-existent resource access...');
    try {
      await axios.get(`${BASE_URL}/team-polling/poll-status/non-existent-team-id`, {
        headers: { 'Authorization': 'Bearer some-token' }
      });
      logTest('Non-existent Resource Handling', false, 'Should have been rejected');
    } catch (error) {
      logTest('Non-existent Resource Handling', error.response?.status === 404, null, true);
    }
    
    return true;
    
  } catch (error) {
    logTest('Edge Cases Testing', false, error.message, true);
    return false;
  }
}

async function testCompleteWorkflow() {
  console.log('\n🔄 TESTING COMPLETE END-TO-END WORKFLOW...\n');
  
  try {
    // Create users
    console.log('Creating test users...');
    const admin = await createUniqueUser('ADMIN');
    const participant1 = await createUniqueUser('PARTICIPANT1');
    const participant2 = await createUniqueUser('PARTICIPANT2');
    
    // Create hackathon
    console.log('Creating hackathon...');
    const hackathonResponse = await axios.post(`${BASE_URL}/hackathons`, {
      title: 'Complete Workflow Test Hackathon',
      description: 'End-to-end testing',
      startDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
      submissionStartDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      submissionEndDate: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 100,
      allowParticipantTeams: true,
      teamCreationMode: 'participant',
      problemStatements: [
        { track: 'AI/ML', description: 'AI solution' },
        { track: 'Web Dev', description: 'Web application' }
      ]
    }, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    const hackathonId = hackathonResponse.data._id;
    
    // Create team
    console.log('Creating team...');
    const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, {
      teamName: 'Complete Workflow Team',
      description: 'End-to-end test team',
      memberLimit: 4,
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${participant1.token}` }
    });
    
    const teamId = teamResponse.data._id;
    
    // Start poll
    console.log('Starting poll...');
    await axios.post(`${BASE_URL}/team-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      duration: 60
    }, {
      headers: { 'Authorization': `Bearer ${participant1.token}` }
    });
    
    // Vote
    console.log('Voting...');
    await axios.post(`${BASE_URL}/team-polling/vote-problem-statement`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      hackathonId: hackathonId
    }, {
      headers: { 'Authorization': `Bearer ${participant1.token}` }
    });
    
    // Conclude poll
    console.log('Concluding poll...');
    await axios.post(`${BASE_URL}/team-polling/conclude-poll`, {
      teamId: teamId
    }, {
      headers: { 'Authorization': `Bearer ${participant1.token}` }
    });
    
    // Submit project
    console.log('Submitting project...');
    await axios.post(`${BASE_URL}/submission/submit-project`, {
      teamId: teamId,
      submissionLink: 'https://github.com/complete/workflow-test'
    }, {
      headers: { 'Authorization': `Bearer ${participant1.token}` }
    });
    
    // Download CSV
    console.log('Downloading CSV...');
    const csvResponse = await axios.get(`${BASE_URL}/admin/download-hackathon-data/${hackathonId}`, {
      headers: { 'Authorization': `Bearer ${admin.token}` }
    });
    
    logTest('Complete End-to-End Workflow', csvResponse.status === 200);
    
    console.log('🎉 Complete workflow test successful!');
    
  } catch (error) {
    logTest('Complete End-to-End Workflow', false, error.response?.data?.message || error.message, true);
  }
}

async function runExtremePrejudiceTest() {
  console.log('🔥 EXTREME PREJUDICE TESTING SUITE 🔥');
  console.log('🎯 TREATING CODEBASE AS WRITTEN BY ARDENT RIVAL');
  console.log('⚔️  ELIMINATING ALL POSSIBLE ISSUES WITH EXTREME PREJUDICE\n');
  
  const startTime = Date.now();
  
  // Run all tests
  const loginUser = await testCompleteLoginWorkflow();
  if (!loginUser) {
    console.log('❌ CRITICAL: Login workflow failed. Stopping tests.');
    return;
  }
  
  const hackathons = await testAdminHackathonCreation(loginUser);
  if (!hackathons) {
    console.log('❌ CRITICAL: Hackathon creation failed. Stopping tests.');
    return;
  }
  
  const teamId = await testParticipantTeamCreation(loginUser, hackathons.participantHackathon);
  if (!teamId) {
    console.log('❌ CRITICAL: Team creation failed. Stopping tests.');
    return;
  }
  
  await testProblemStatementPolling(loginUser, teamId, hackathons.participantHackathon);
  await testSubmissionSystem(loginUser, teamId);
  await testCSVDownload(loginUser, hackathons.participantHackathon);
  await testEdgeCases();
  await testCompleteWorkflow();
  
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000;
  
  // Print comprehensive results
  console.log('\n' + '='.repeat(80));
  console.log('🔥 EXTREME PREJUDICE TEST RESULTS 🔥');
  console.log('='.repeat(80));
  console.log(`⏱️  Duration: ${duration.toFixed(2)} seconds`);
  console.log(`📈 Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`🚨 Critical Issues: ${testResults.criticalIssues.length}`);
  console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
  console.log(`📊 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES FOUND:');
    testResults.criticalIssues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue.test}: ${issue.error}`);
    });
  }
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ALL FAILED TESTS:');
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  if (testResults.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    testResults.warnings.forEach((warning, index) => {
      console.log(`${index + 1}. ${warning}`);
    });
  }
  
  console.log('\n🎯 WORKFLOW ANALYSIS:');
  const loginTests = testResults.errors.filter(e => e.test.includes('Login'));
  const hackathonTests = testResults.errors.filter(e => e.test.includes('Hackathon'));
  const teamTests = testResults.errors.filter(e => e.test.includes('Team'));
  const pollingTests = testResults.errors.filter(e => e.test.includes('Poll'));
  const submissionTests = testResults.errors.filter(e => e.test.includes('Submission'));
  const csvTests = testResults.errors.filter(e => e.test.includes('CSV'));
  
  console.log(`Login Workflow: ${loginTests.length === 0 ? '✅ PERFECT' : '❌ ISSUES'}`);
  console.log(`Hackathon Creation: ${hackathonTests.length === 0 ? '✅ PERFECT' : '❌ ISSUES'}`);
  console.log(`Team Management: ${teamTests.length === 0 ? '✅ PERFECT' : '❌ ISSUES'}`);
  console.log(`Polling System: ${pollingTests.length === 0 ? '✅ PERFECT' : '❌ ISSUES'}`);
  console.log(`Submission System: ${submissionTests.length === 0 ? '✅ PERFECT' : '❌ ISSUES'}`);
  console.log(`CSV Download: ${csvTests.length === 0 ? '✅ PERFECT' : '❌ ISSUES'}`);
  
  if (testResults.criticalIssues.length === 0 && testResults.failed === 0) {
    console.log('\n🏆 PERFECT SCORE! NO ISSUES FOUND!');
    console.log('🎉 CODEBASE IS BULLETPROOF!');
  } else if (testResults.criticalIssues.length === 0) {
    console.log('\n✅ NO CRITICAL ISSUES! MINOR ISSUES ONLY.');
    console.log('🎯 CODEBASE IS PRODUCTION READY!');
  } else {
    console.log('\n🚨 CRITICAL ISSUES FOUND! IMMEDIATE ATTENTION REQUIRED!');
    console.log('⚔️  ELIMINATE WITH EXTREME PREJUDICE!');
  }
  
  console.log('\n🔥 EXTREME PREJUDICE TESTING COMPLETE 🔥');
}

runExtremePrejudiceTest().catch(console.error);
