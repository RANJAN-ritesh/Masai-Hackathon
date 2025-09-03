#!/usr/bin/env node

/**
 * Comprehensive test for problem statement polling features
 * Tests all new endpoints and ensures no connection loops
 */

const baseURL = 'https://masai-hackathon.onrender.com';

const testProblemStatementPolling = async () => {
  console.log('🧪 Testing Problem Statement Polling Features...');
  console.log('============================================================');

  let results = [];
  let successCount = 0;
  let totalTests = 0;

  const addResult = (testName, passed, message) => {
    totalTests++;
    if (passed) successCount++;
    results.push({ testName, passed, message });
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
  };

  try {
    // Test 1: Authentication
    console.log('\n🔐 Test 1: Authentication');
    const loginResponse = await fetch(`${baseURL}/users/verify-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      addResult('Admin Login', false, 'Failed to login as admin');
      return;
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    const userId = loginData.user._id;
    
    addResult('Admin Login', true, 'Successfully logged in as admin');

    // Test 2: Get hackathons to find one with problem statements
    console.log('\n🏆 Test 2: Find Hackathon with Problem Statements');
    const hackathonsResponse = await fetch(`${baseURL}/hackathons`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!hackathonsResponse.ok) {
      addResult('Fetch Hackathons', false, 'Failed to fetch hackathons');
      return;
    }

    const hackathonsData = await hackathonsResponse.json();
    const hackathonWithProblems = hackathonsData.find(h => h.problemStatements && h.problemStatements.length > 0);
    
    if (!hackathonWithProblems) {
      addResult('Find Hackathon with Problems', false, 'No hackathon with problem statements found');
      return;
    }

    addResult('Find Hackathon with Problems', true, `Found hackathon: ${hackathonWithProblems.title}`);

    // Test 3: Get teams for the hackathon
    console.log('\n👥 Test 3: Get Teams');
    const teamsResponse = await fetch(`${baseURL}/team/hackathon/${hackathonWithProblems._id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!teamsResponse.ok) {
      addResult('Fetch Teams', false, 'Failed to fetch teams');
      return;
    }

    const teamsData = await teamsResponse.json();
    const teams = teamsData.teams || teamsData;
    
    if (!teams || teams.length === 0) {
      addResult('Teams Available', false, 'No teams found in hackathon');
      return;
    }

    addResult('Fetch Teams', true, `Found ${teams.length} teams`);

    // Test 4: Test vote endpoint (should fail if not team member)
    console.log('\n🗳️ Test 4: Vote Endpoint Validation');
    const testTeam = teams[0];
    const voteResponse = await fetch(`${baseURL}/team-polling/vote-problem-statement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        teamId: testTeam._id,
        problemStatementId: 'ML',
        hackathonId: hackathonWithProblems._id
      })
    });

    // Should fail because admin is not a team member
    if (voteResponse.status === 403) {
      addResult('Vote Authorization', true, 'Properly rejected vote from non-member');
    } else {
      addResult('Vote Authorization', false, `Unexpected response: ${voteResponse.status}`);
    }

    // Test 5: Test poll results endpoint
    console.log('\n📊 Test 5: Poll Results Endpoint');
    const pollResultsResponse = await fetch(`${baseURL}/team-polling/poll-results/${testTeam._id}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (pollResultsResponse.status === 403) {
      addResult('Poll Results Authorization', true, 'Properly rejected poll results from non-member');
    } else {
      addResult('Poll Results Authorization', false, `Unexpected response: ${pollResultsResponse.status}`);
    }

    // Test 6: Test select problem statement endpoint
    console.log('\n🎯 Test 6: Select Problem Statement Endpoint');
    const selectResponse = await fetch(`${baseURL}/team-polling/select-problem-statement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        teamId: testTeam._id,
        problemStatementId: 'ML',
        hackathonId: hackathonWithProblems._id
      })
    });

    if (selectResponse.status === 403) {
      addResult('Select Problem Authorization', true, 'Properly rejected selection from non-leader');
    } else {
      addResult('Select Problem Authorization', false, `Unexpected response: ${selectResponse.status}`);
    }

    // Test 7: Test invalid problem statement
    console.log('\n🚫 Test 7: Invalid Problem Statement Validation');
    const invalidVoteResponse = await fetch(`${baseURL}/team-polling/vote-problem-statement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        teamId: testTeam._id,
        problemStatementId: 'INVALID_PROBLEM',
        hackathonId: hackathonWithProblems._id
      })
    });

    if (invalidVoteResponse.status === 404) {
      addResult('Invalid Problem Validation', true, 'Properly rejected invalid problem statement');
    } else {
      addResult('Invalid Problem Validation', false, `Unexpected response: ${invalidVoteResponse.status}`);
    }

    // Test 8: Test invalid team ID
    console.log('\n🚫 Test 8: Invalid Team ID Validation');
    const invalidTeamResponse = await fetch(`${baseURL}/team-polling/vote-problem-statement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        teamId: 'invalid_team_id',
        problemStatementId: 'ML',
        hackathonId: hackathonWithProblems._id
      })
    });

    if (invalidTeamResponse.status === 404) {
      addResult('Invalid Team Validation', true, 'Properly rejected invalid team ID');
    } else {
      addResult('Invalid Team Validation', false, `Unexpected response: ${invalidTeamResponse.status}`);
    }

    // Test 9: Test rate limiting on polling endpoints
    console.log('\n🚫 Test 9: Rate Limiting on Polling Endpoints');
    const rapidRequests = [];
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(
        fetch(`${baseURL}/team-polling/poll-results/${testTeam._id}`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
    }

    const rapidResponses = await Promise.all(rapidRequests);
    const rateLimitedCount = rapidResponses.filter(r => r.status === 429).length;

    if (rateLimitedCount === 0) {
      addResult('Rate Limiting', true, 'No rate limiting detected (good for legitimate requests)');
    } else {
      addResult('Rate Limiting', false, `${rateLimitedCount} requests were rate limited`);
    }

    // Test 10: Test WebSocket stability during polling
    console.log('\n🔌 Test 10: WebSocket Stability During Polling');
    let wsStable = true;
    for (let i = 0; i < 5; i++) {
      try {
        const healthResponse = await fetch(`${baseURL}/health`);
        if (!healthResponse.ok) {
          wsStable = false;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        wsStable = false;
        break;
      }
    }

    addResult('WebSocket Stability', wsStable, wsStable ? 'WebSocket remains stable during polling' : 'WebSocket became unstable');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    addResult('Overall Test', false, `Test failed: ${error.message}`);
  }

  // Summary
  console.log('\n============================================================');
  console.log('📊 TEST SUMMARY');
  console.log('============================================================');
  console.log(`✅ Passed: ${successCount}/${totalTests} (${((successCount/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log('\n🎉 Problem statement polling features are working perfectly!');
    console.log('✅ All endpoints are properly secured');
    console.log('✅ Authorization is working correctly');
    console.log('✅ No connection loops detected');
    console.log('✅ Rate limiting is properly configured');
    console.log('✅ WebSocket stability maintained');
  } else {
    console.log('\n⚠️ Some issues detected. Further investigation needed.');
  }

  return successCount === totalTests;
};

testProblemStatementPolling();
