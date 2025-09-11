const { MongoClient } = require('mongodb');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test configuration
const BASE_URL = 'https://hackathon-backend-7x8h.onrender.com';
const TEST_USERS = [
  { email: 'testleader@example.com', password: 'password123', name: 'Test Leader' },
  { email: 'testmember1@example.com', password: 'password123', name: 'Test Member 1' },
  { email: 'testmember2@example.com', password: 'password123', name: 'Test Member 2' }
];

let authTokens = {};
let testTeamId = null;
let testHackathonId = null;

// Utility functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const makeRequest = async (method, url, data = null, token = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test user creation and authentication
const createTestUsers = async () => {
  console.log('🔧 Creating test users...');
  
  for (const user of TEST_USERS) {
    const result = await makeRequest('POST', '/auth/register', user);
    if (result.success) {
      console.log(`✅ Created user: ${user.email}`);
    } else {
      console.log(`⚠️ User might already exist: ${user.email}`);
    }
  }
};

const authenticateUsers = async () => {
  console.log('🔐 Authenticating test users...');
  
  for (const user of TEST_USERS) {
    const result = await makeRequest('POST', '/auth/login', {
      email: user.email,
      password: user.password
    });
    
    if (result.success) {
      authTokens[user.email] = result.data.token;
      console.log(`✅ Authenticated: ${user.email}`);
    } else {
      console.log(`❌ Failed to authenticate: ${user.email}`, result.error);
    }
  }
};

// Test hackathon creation
const createTestHackathon = async () => {
  console.log('🏆 Creating test hackathon...');
  
  const hackathonData = {
    title: 'Chat & Polling Test Hackathon',
    description: 'Testing chat and polling features',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    maxParticipants: 100,
    problemStatements: [
      { track: 'AI/ML', description: 'Build an AI-powered solution' },
      { track: 'Web Dev', description: 'Create a web application' },
      { track: 'Mobile', description: 'Develop a mobile app' }
    ]
  };
  
  const result = await makeRequest('POST', '/hackathons', hackathonData, authTokens['testleader@example.com']);
  
  if (result.success) {
    testHackathonId = result.data.hackathon._id;
    console.log(`✅ Created hackathon: ${testHackathonId}`);
  } else {
    console.log('❌ Failed to create hackathon:', result.error);
  }
};

// Test team creation
const createTestTeam = async () => {
  console.log('👥 Creating test team...');
  
  const teamData = {
    teamName: 'Chat Test Team',
    hackathonId: testHackathonId,
    teamMembers: [TEST_USERS[1].email, TEST_USERS[2].email]
  };
  
  const result = await makeRequest('POST', '/participant-team', teamData, authTokens['testleader@example.com']);
  
  if (result.success) {
    testTeamId = result.data.team._id;
    console.log(`✅ Created team: ${testTeamId}`);
  } else {
    console.log('❌ Failed to create team:', result.error);
  }
};

// Test polling system
const testPollingSystem = async () => {
  console.log('\n🗳️ Testing Polling System...');
  
  const leaderToken = authTokens['testleader@example.com'];
  const memberToken = authTokens['testmember1@example.com'];
  
  // 1. Start a poll
  console.log('1. Starting poll...');
  const startPollResult = await makeRequest('POST', '/simple-polling/start-poll', {
    teamId: testTeamId,
    problemStatementId: 'AI/ML',
    hackathonId: testHackathonId,
    pollDuration: 2 // 2 minutes for testing
  }, leaderToken);
  
  if (!startPollResult.success) {
    console.log('❌ Failed to start poll:', startPollResult.error);
    return false;
  }
  console.log('✅ Poll started successfully');
  
  // 2. Check poll status
  console.log('2. Checking poll status...');
  const statusResult = await makeRequest('GET', `/simple-polling/poll-status/${testTeamId}`, null, memberToken);
  
  if (!statusResult.success) {
    console.log('❌ Failed to get poll status:', statusResult.error);
    return false;
  }
  console.log('✅ Poll status retrieved:', statusResult.data.pollActive);
  
  // 3. Vote from member
  console.log('3. Member voting...');
  const voteResult = await makeRequest('POST', '/simple-polling/vote', {
    teamId: testTeamId,
    problemStatementId: 'AI/ML'
  }, memberToken);
  
  if (!voteResult.success) {
    console.log('❌ Failed to vote:', voteResult.error);
    return false;
  }
  console.log('✅ Vote recorded successfully');
  
  // 4. Check vote count
  console.log('4. Checking vote count...');
  const voteStatusResult = await makeRequest('GET', `/simple-polling/poll-status/${testTeamId}`, null, leaderToken);
  
  if (!voteStatusResult.success) {
    console.log('❌ Failed to get vote status:', voteStatusResult.error);
    return false;
  }
  console.log('✅ Vote count:', voteStatusResult.data.voteCounts);
  
  // 5. Conclude poll
  console.log('5. Concluding poll...');
  const concludeResult = await makeRequest('POST', '/simple-polling/conclude-poll', {
    teamId: testTeamId
  }, leaderToken);
  
  if (!concludeResult.success) {
    console.log('❌ Failed to conclude poll:', concludeResult.error);
    return false;
  }
  console.log('✅ Poll concluded successfully');
  
  return true;
};

// Test chat system
const testChatSystem = async () => {
  console.log('\n💬 Testing Chat System...');
  
  const leaderToken = authTokens['testleader@example.com'];
  const memberToken = authTokens['testmember1@example.com'];
  
  // 1. Send text message
  console.log('1. Sending text message...');
  const textMessageResult = await makeRequest('POST', '/chat/send-message', {
    teamId: testTeamId,
    message: 'Hello team! This is a test message.'
  }, leaderToken);
  
  if (!textMessageResult.success) {
    console.log('❌ Failed to send text message:', textMessageResult.error);
    return false;
  }
  console.log('✅ Text message sent successfully');
  
  // 2. Get messages
  console.log('2. Retrieving messages...');
  const getMessagesResult = await makeRequest('GET', `/chat/messages/${testTeamId}`, null, memberToken);
  
  if (!getMessagesResult.success) {
    console.log('❌ Failed to get messages:', getMessagesResult.error);
    return false;
  }
  console.log('✅ Messages retrieved:', getMessagesResult.data.messages.length);
  
  // 3. Send another message from member
  console.log('3. Member sending message...');
  const memberMessageResult = await makeRequest('POST', '/chat/send-message', {
    teamId: testTeamId,
    message: 'Hi leader! Testing chat functionality.'
  }, memberToken);
  
  if (!memberMessageResult.success) {
    console.log('❌ Failed to send member message:', memberMessageResult.error);
    return false;
  }
  console.log('✅ Member message sent successfully');
  
  // 4. Edit message
  console.log('4. Editing message...');
  const messageId = memberMessageResult.data.chatMessage._id;
  const editResult = await makeRequest('PUT', `/chat/edit-message/${messageId}`, {
    message: 'Hi leader! Testing chat functionality - EDITED.'
  }, memberToken);
  
  if (!editResult.success) {
    console.log('❌ Failed to edit message:', editResult.error);
    return false;
  }
  console.log('✅ Message edited successfully');
  
  // 5. Test file upload (create a small test file)
  console.log('5. Testing file upload...');
  const testFileContent = 'This is a test file for chat upload.';
  const testFilePath = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFilePath, testFileContent);
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('teamId', testTeamId);
    formData.append('message', 'Test file upload');
    
    const uploadResult = await axios.post(`${BASE_URL}/chat/upload-file`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${memberToken}`
      }
    });
    
    console.log('✅ File uploaded successfully');
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
  } catch (error) {
    console.log('❌ Failed to upload file:', error.response?.data || error.message);
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    return false;
  }
  
  // 6. Test large file upload (should fail)
  console.log('6. Testing large file upload (should fail)...');
  const largeFileContent = 'x'.repeat(3 * 1024 * 1024); // 3MB file
  const largeFilePath = path.join(__dirname, 'large-test-file.txt');
  fs.writeFileSync(largeFilePath, largeFileContent);
  
  try {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(largeFilePath));
    formData.append('teamId', testTeamId);
    
    await axios.post(`${BASE_URL}/chat/upload-file`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${memberToken}`
      }
    });
    
    console.log('❌ Large file upload should have failed but succeeded');
    fs.unlinkSync(largeFilePath);
    return false;
  } catch (error) {
    if (error.response?.status === 413 || error.response?.data?.message?.includes('File too large')) {
      console.log('✅ Large file upload correctly rejected');
    } else {
      console.log('❌ Unexpected error for large file:', error.response?.data || error.message);
    }
    fs.unlinkSync(largeFilePath);
  }
  
  // 7. Delete message
  console.log('7. Deleting message...');
  const deleteResult = await makeRequest('DELETE', `/chat/delete-message/${messageId}`, null, memberToken);
  
  if (!deleteResult.success) {
    console.log('❌ Failed to delete message:', deleteResult.error);
    return false;
  }
  console.log('✅ Message deleted successfully');
  
  return true;
};

// Test unauthorized access
const testSecurity = async () => {
  console.log('\n🔒 Testing Security...');
  
  const unauthorizedToken = 'invalid-token';
  
  // 1. Try to access team chat without proper token
  console.log('1. Testing unauthorized chat access...');
  const unauthorizedChatResult = await makeRequest('GET', `/chat/messages/${testTeamId}`, null, unauthorizedToken);
  
  if (unauthorizedChatResult.success) {
    console.log('❌ Unauthorized access to chat should have failed');
    return false;
  }
  console.log('✅ Unauthorized chat access correctly rejected');
  
  // 2. Try to access poll without proper token
  console.log('2. Testing unauthorized poll access...');
  const unauthorizedPollResult = await makeRequest('GET', `/simple-polling/poll-status/${testTeamId}`, null, unauthorizedToken);
  
  if (unauthorizedPollResult.success) {
    console.log('❌ Unauthorized access to poll should have failed');
    return false;
  }
  console.log('✅ Unauthorized poll access correctly rejected');
  
  return true;
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Comprehensive Chat & Polling Tests...\n');
  
  try {
    // Setup
    await createTestUsers();
    await authenticateUsers();
    await createTestHackathon();
    await createTestTeam();
    
    // Wait a bit for team creation to propagate
    await delay(2000);
    
    // Run tests
    const pollingSuccess = await testPollingSystem();
    const chatSuccess = await testChatSystem();
    const securitySuccess = await testSecurity();
    
    // Results
    console.log('\n📊 Test Results:');
    console.log(`🗳️ Polling System: ${pollingSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`💬 Chat System: ${chatSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🔒 Security: ${securitySuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = pollingSuccess && chatSuccess && securitySuccess;
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎉 Chat and Polling systems are working perfectly!');
    } else {
      console.log('\n⚠️ Some issues detected. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
  }
};

// Run the tests
runTests();
