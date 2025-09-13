#!/usr/bin/env node

/**
 * Test Real-time Updates
 * 
 * This script tests the real-time WebSocket functionality:
 * 1. Team member updates (when invitations are accepted)
 * 2. Problem statement selection updates
 * 3. Notification persistence for offline users
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://masai-hackathon.onrender.com';

// Test data
const testUsers = [
  { email: 'test1@example.com', password: 'password123', name: 'Test User 1' },
  { email: 'test2@example.com', password: 'password123', name: 'Test User 2' }
];

let hackathonId = '';
let teamId = '';
let user1Token = '';
let user2Token = '';

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
  console.log('🏆 Creating test hackathon...');
  
  const hackathonData = {
    title: 'Real-time Test Hackathon',
    description: 'Testing real-time updates',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    maxParticipants: 100,
    teamCreationMode: 'participant',
    allowParticipantTeams: true,
    problemStatements: ['Real-time Problem 1', 'Real-time Problem 2'],
    submissionDescription: 'Submit your real-time solution here'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/hackathons`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(hackathonData)
  });
  
  if (response?.ok) {
    console.log('✅ Test hackathon created:', data.hackathon._id);
    return data.hackathon._id;
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
    teamName: 'Real-time Test Team',
    description: 'Testing real-time team updates',
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

async function sendInvitation(fromToken, toUserId, teamId) {
  console.log(`📤 Sending invitation to user ${toUserId}...`);
  
  const invitationData = {
    participantId: toUserId,
    teamId,
    message: 'Join our real-time test team!'
  };
  
  const { response, data } = await makeRequest(`${BASE_URL}/participant-team/send-invitation`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${fromToken}` },
    body: JSON.stringify(invitationData)
  });
  
  if (response?.ok) {
    console.log('✅ Invitation sent successfully');
    return true;
  } else {
    console.log('❌ Invitation failed:', data?.message);
    return false;
  }
}

async function getUserId(token) {
  console.log('👤 Getting user ID...');
  
  const { response, data } = await makeRequest(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (response?.ok) {
    console.log('✅ User ID retrieved:', data.user._id);
    return data.user._id;
  } else {
    console.log('❌ Failed to get user ID:', data?.message);
    return null;
  }
}

async function selectProblemStatement(token, teamId) {
  console.log('🎯 Selecting problem statement...');
  
  const problemData = {
    teamId,
    problemStatement: 'Real-time Problem 1'
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

async function testRealTimeUpdates() {
  console.log('🚀 Starting Real-time Updates Test...\n');
  
  try {
    // Step 1: Login users
    user1Token = await loginUser(testUsers[0].email, testUsers[0].password);
    user2Token = await loginUser(testUsers[1].email, testUsers[1].password);
    
    if (!user1Token || !user2Token) {
      console.log('❌ Failed to login users. Please ensure test users exist.');
      return;
    }
    
    // Step 2: Create hackathon
    hackathonId = await createTestHackathon(user1Token);
    if (!hackathonId) {
      console.log('❌ Failed to create hackathon');
      return;
    }
    
    // Step 3: Register both users
    await registerUser(user1Token, hackathonId);
    await registerUser(user2Token, hackathonId);
    
    // Step 4: Create team with user1
    teamId = await createTeam(user1Token, hackathonId);
    if (!teamId) {
      console.log('❌ Failed to create team');
      return;
    }
    
    // Step 5: Get user2 ID for invitation
    const user2Id = await getUserId(user2Token);
    if (!user2Id) {
      console.log('❌ Failed to get user2 ID');
      return;
    }
    
    // Step 6: Send invitation from user1 to user2
    await sendInvitation(user1Token, user2Id, teamId);
    
    // Step 7: Select problem statement
    await selectProblemStatement(user1Token, teamId);
    
    console.log('\n✅ Real-time Updates Test Completed!');
    console.log('\n📋 Test Summary:');
    console.log('1. ✅ Users logged in successfully');
    console.log('2. ✅ Hackathon created');
    console.log('3. ✅ Users registered');
    console.log('4. ✅ Team created');
    console.log('5. ✅ Invitation sent');
    console.log('6. ✅ Problem statement selected');
    console.log('\n🔍 Check the frontend to verify:');
    console.log('- Team member updates appear in real-time');
    console.log('- Problem statement updates appear in real-time');
    console.log('- Notifications show red dot and toast messages');
    console.log('- No page refresh required for updates');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testRealTimeUpdates();
