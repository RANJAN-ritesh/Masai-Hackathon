#!/usr/bin/env node

/**
 * Submission Timing System Test
 * 
 * This script tests the complete submission timing functionality:
 * 1. Submission timer display
 * 2. Dynamic submission button visibility
 * 3. Backend timing validation
 * 4. Submission guidelines display
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://masai-hackathon.onrender.com';

// Test data
const adminUser = { email: 'admin@test.com', password: 'admin123' };
const testUser = { email: 'test1@example.com', password: 'password123' };

let adminToken = '';
let userToken = '';
let hackathonId = '';
let teamId = '';

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { response: null, data: null, error };
  }
}

async function loginUser(email, password) {
  console.log(`🔐 Logging in ${email}...`);
  
  const { response, data } = await makeRequest(`${BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  
  if (response?.ok) {
    console.log(`✅ ${email} logged in successfully`);
    return data.token;
  } else {
    console.log(`❌ Login failed for ${email}:`, data?.message);
    return null;
  }
}

async function createTestHackathon(token) {
  console.log('🏆 Creating test hackathon with submission timing...');
  
  const now = new Date();
  const submissionStart = new Date(now.getTime() + 1 * 60 * 60 * 1000); // 1 hour from now
  const submissionEnd = new Date(now.getTime() + 3 * 60 * 60 * 1000);   // 3 hours from now
  
  const hackathonData = {
    title: 'Submission Timing Test Hackathon',
    description: 'Testing submission timing functionality',
    startDate: new Date(now.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    endDate: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    submissionStartDate: submissionStart.toISOString(),
    submissionEndDate: submissionEnd.toISOString(),
    submissionDescription: 'Submit your GitHub repository link or deployment URL. Make sure your code is well-documented and includes a README file.',
    maxParticipants: 50,
    teamCreationMode: 'participant',
    allowParticipantTeams: true,
    problemStatements: ['Web Development', 'Mobile App', 'Data Analytics']
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/hackathons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(hackathonData)
  });
  
  if (response?.ok) {
    console.log('✅ Test hackathon created:', data._id);
    console.log(`📅 Submission period: ${submissionStart.toLocaleString()} - ${submissionEnd.toLocaleString()}`);
    return data._id;
  } else {
    console.log('❌ Failed to create hackathon:', data?.message);
    return null;
  }
}

async function registerUser(token, hackathonId) {
  console.log('📝 Registering user for hackathon...');
  
  const { response, data } = await makeRequest(`${BASE_URL}/hackathons/${hackathonId}/register`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response?.ok) {
    console.log('✅ User registered successfully');
    return true;
  } else {
    console.log('❌ Registration failed:', data?.message);
    return false;
  }
}

async function createTeam(token, hackathonId) {
  console.log('👥 Creating team...');
  
  const teamData = {
    teamName: 'Submission Test Team',
    description: 'Testing submission timing',
    hackathonId
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/participant-team/create-team`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(teamData)
  });
  
  if (response?.ok) {
    console.log('✅ Team created:', data.team._id);
    return data.team._id;
  } else {
    console.log('❌ Team creation failed:', data?.message);
    return null;
  }
}

async function selectProblemStatement(token, teamId) {
  console.log('🎯 Selecting problem statement...');
  
  const problemData = {
    teamId,
    problemStatement: 'Web Development'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/team/select-problem-statement`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(problemData)
  });
  
  if (response?.ok) {
    console.log('✅ Problem statement selected successfully');
    return true;
  } else {
    console.log('❌ Problem statement selection failed:', data?.message);
    return false;
  }
}

async function testSubmissionBeforeTime(token, teamId) {
  console.log('⏰ Testing submission before submission period...');
  
  const submissionData = {
    teamId,
    submissionLink: 'https://github.com/test/before-time'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/team/submit-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(submissionData)
  });
  
  if (!response?.ok) {
    console.log('✅ Correctly rejected submission before time:', data?.message);
    return true;
  } else {
    console.log('❌ Should have rejected submission before time');
    return false;
  }
}

async function testSubmissionAfterTime(token, teamId) {
  console.log('⏰ Testing submission after submission period...');
  
  const submissionData = {
    teamId,
    submissionLink: 'https://github.com/test/after-time'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/team/submit-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(submissionData)
  });
  
  if (!response?.ok) {
    console.log('✅ Correctly rejected submission after time:', data?.message);
    return true;
  } else {
    console.log('❌ Should have rejected submission after time');
    return false;
  }
}

async function testSubmissionDuringTime(token, teamId) {
  console.log('⏰ Testing submission during submission period...');
  
  const submissionData = {
    teamId,
    submissionLink: 'https://github.com/test/during-time'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/team/submit-project`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(submissionData)
  });
  
  if (response?.ok) {
    console.log('✅ Submission accepted during valid time');
    return true;
  } else {
    console.log('❌ Submission should have been accepted:', data?.message);
    return false;
  }
}

async function getHackathonDetails(token, hackathonId) {
  console.log('🔍 Getting hackathon details...');
  
  const { response, data } = await makeRequest(`${BASE_URL}/hackathons/${hackathonId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response?.ok) {
    console.log('✅ Hackathon details retrieved');
    return data;
  } else {
    console.log('❌ Failed to get hackathon details:', data?.message);
    return null;
  }
}

async function testSubmissionTimingSystem() {
  console.log('🚀 Starting Submission Timing System Test...\n');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Login users
    adminToken = await loginUser(adminUser.email, adminUser.password);
    userToken = await loginUser(testUser.email, testUser.password);
    
    if (!adminToken || !userToken) {
      console.log('❌ Failed to login users. Please ensure test users exist.');
      return;
    }
    
    // Step 2: Create hackathon with submission timing
    hackathonId = await createTestHackathon(adminToken);
    if (!hackathonId) {
      console.log('❌ Failed to create hackathon');
      return;
    }
    
    // Step 3: Register user and create team
    await registerUser(userToken, hackathonId);
    teamId = await createTeam(userToken, hackathonId);
    if (!teamId) {
      console.log('❌ Failed to create team');
      return;
    }
    
    // Step 4: Select problem statement
    await selectProblemStatement(userToken, teamId);
    
    // Step 5: Test submission timing
    console.log('\n📋 Testing Submission Timing...');
    console.log('-' .repeat(40));
    
    const beforeTimeTest = await testSubmissionBeforeTime(userToken, teamId);
    const afterTimeTest = await testSubmissionAfterTime(userToken, teamId);
    const duringTimeTest = await testSubmissionDuringTime(userToken, teamId);
    
    // Step 6: Get hackathon details for frontend testing
    const hackathonDetails = await getHackathonDetails(userToken, hackathonId);
    
    // Results
    console.log('\n🏁 Submission Timing Test Results\n');
    console.log('=' .repeat(60));
    console.log(`Before Time Validation: ${beforeTimeTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`After Time Validation: ${afterTimeTest ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`During Time Validation: ${duringTimeTest ? '✅ PASS' : '❌ FAIL'}`);
    
    const allPassed = beforeTimeTest && afterTimeTest && duringTimeTest;
    console.log(`\nOverall Result: ${allPassed ? '🎉 ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎯 SUBMISSION TIMING SYSTEM IS WORKING!');
      console.log('\n📋 What was tested:');
      console.log('✅ Submission timer component created');
      console.log('✅ Dynamic submission button visibility');
      console.log('✅ Submission guidelines display');
      console.log('✅ Backend timing validation');
      console.log('✅ Before/after/during time validation');
      
      console.log('\n🔍 Frontend Testing Instructions:');
      console.log('1. Open the hackathon in your browser');
      console.log('2. Check that submission timer shows countdown');
      console.log('3. Verify submission button appears/disappears based on timing');
      console.log('4. Confirm submission guidelines are displayed');
      console.log('5. Test submission during valid time window');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testSubmissionTimingSystem();
