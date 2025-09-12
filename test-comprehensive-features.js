import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'http://localhost:5009';
const FRONTEND_URL = 'http://localhost:3000';

// Test data
const testUsers = {
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    phoneNumber: '9999999999',
    password: 'admin123',
    role: 'admin',
    userId: 'ADMIN001',
    code: 'ADM001',
    course: 'Computer Science',
    skills: ['JavaScript', 'React', 'Node.js'],
    vertical: 'Technology'
  },
  leader: {
    name: 'Test Leader',
    email: 'leader@test.com',
    phoneNumber: '8888888888',
    password: 'leader123',
    role: 'participant',
    userId: 'LEAD001',
    code: 'LEA001',
    course: 'Software Engineering',
    skills: ['Python', 'Django', 'PostgreSQL'],
    vertical: 'Technology'
  },
  member: {
    name: 'Test Member',
    email: 'member@test.com',
    phoneNumber: '7777777777',
    password: 'member123',
    role: 'participant',
    userId: 'MEMB001',
    code: 'MEM001',
    course: 'Data Science',
    skills: ['R', 'Python', 'Machine Learning'],
    vertical: 'Analytics'
  }
};

let authTokens = {};
let hackathonId = null;
let teamId = null;
let testResults = [];

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const test = async (testName, testFunction) => {
  log(`🧪 Testing: ${testName}`);
  try {
    const result = await testFunction();
    testResults.push({ name: testName, status: 'PASS', result });
    log(`✅ PASSED: ${testName}`, 'success');
    return result;
  } catch (error) {
    testResults.push({ name: testName, status: 'FAIL', error: error.message });
    log(`❌ FAILED: ${testName}: ${error.message}`, 'error');
    throw error;
  }
};

const makeRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  
  return response.json();
};

// Test 1: Authentication System
const testAuthentication = async () => {
  log('🔐 Testing Authentication System');
  
  // Test user registration
  await test('User Registration', async () => {
    for (const [role, user] of Object.entries(testUsers)) {
      try {
        // First try to login
        const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
          method: 'POST',
          body: JSON.stringify({
            email: user.email,
            password: user.password
          })
        });
        log(`User ${role} already exists and logged in successfully`);
        authTokens[role] = loginResponse.token;
      } catch (loginError) {
        // If login fails, try to register
        try {
          const response = await makeRequest(`${BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(user)
          });
          log(`Registered ${role}: ${response.message || 'Success'}`);
        } catch (registerError) {
          if (registerError.message.includes('already exists')) {
            log(`User ${role} already exists, trying login with different password...`);
            // Try with a common password
            try {
              const loginResponse = await makeRequest(`${BASE_URL}/auth/login`, {
                method: 'POST',
                body: JSON.stringify({
                  email: user.email,
                  password: 'password123' // Common password
                })
              });
              log(`User ${role} logged in with common password`);
              authTokens[role] = loginResponse.token;
            } catch (finalError) {
              log(`Could not login user ${role}, skipping...`);
            }
          } else {
            throw registerError;
          }
        }
      }
    }
  });
  
  // Test token validation
  await test('Token Validation', async () => {
    if (!authTokens.admin) {
      throw new Error('Admin token not available');
    }
    
    log(`Testing token: ${authTokens.admin.substring(0, 20)}...`);
    
    const response = await makeRequest(`${BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      }
    });
    
    if (response.user.email !== testUsers.admin.email) {
      throw new Error('Token validation failed');
    }
    
    log(`Token validation successful for: ${response.user.name}`);
  });
};

// Test 2: Hackathon Creation and Management
const testHackathonManagement = async () => {
  log('🏆 Testing Hackathon Management');
  
  const hackathonData = {
    name: 'Comprehensive Test Hackathon',
    description: 'Testing all features thoroughly',
    startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Next week
    maxParticipants: 100,
    problemStatements: [
      {
        track: 'Software Development',
        description: 'https://github.com/test-problem-1'
      },
      {
        track: 'Data Analytics',
        description: 'https://github.com/test-problem-2'
      }
    ],
    schedule: [
      {
        date: new Date().toISOString(),
        events: [
          {
            time: '10:00 AM',
            description: 'Kickoff Meeting'
          }
        ]
      }
    ]
  };
  
  // Test hackathon creation
  await test('Create Hackathon', async () => {
    const response = await makeRequest(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.admin}`
      },
      body: JSON.stringify(hackathonData)
    });
    
    hackathonId = response.hackathon._id;
    log(`Created hackathon: ${response.hackathon.name}`);
    return response.hackathon;
  });
  
  // Test hackathon retrieval
  await test('Get Hackathon Details', async () => {
    const response = await makeRequest(`${BASE_URL}/hackathons/${hackathonId}`);
    
    if (response.hackathon.problemStatements.length !== 2) {
      throw new Error('Problem statements not saved correctly');
    }
    
    return response.hackathon;
  });
  
  // Test hackathon list
  await test('Get Hackathon List', async () => {
    const response = await makeRequest(`${BASE_URL}/hackathons`);
    
    if (!response.hackathons.some(h => h._id === hackathonId)) {
      throw new Error('Created hackathon not found in list');
    }
    
    return response.hackathons;
  });
};

// Test 3: Team Management
const testTeamManagement = async () => {
  log('👥 Testing Team Management');
  
  // Test team creation
  await test('Create Team', async () => {
    const teamData = {
      name: 'Test Team Alpha',
      hackathonId: hackathonId,
      problemStatement: 'Software Development'
    };
    
    const response = await makeRequest(`${BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      },
      body: JSON.stringify(teamData)
    });
    
    teamId = response.team._id;
    log(`Created team: ${response.team.name}`);
    return response.team;
  });
  
  // Test team retrieval
  await test('Get Team Details', async () => {
    const response = await makeRequest(`${BASE_URL}/teams/${teamId}`, {
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      }
    });
    
    if (response.team.leaderId !== authTokens.leader) {
      throw new Error('Team leader not set correctly');
    }
    
    return response.team;
  });
  
  // Test team joining
  await test('Join Team', async () => {
    const response = await makeRequest(`${BASE_URL}/teams/${teamId}/join`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.member}`
      }
    });
    
    log(`Member joined team: ${response.message}`);
    return response;
  });
};

// Test 4: Problem Statement Display
const testProblemStatementDisplay = async () => {
  log('📋 Testing Problem Statement Display');
  
  await test('Get Problem Statements', async () => {
    const response = await makeRequest(`${BASE_URL}/hackathons/problems/${hackathonId}`);
    
    if (response.problemStatements.length !== 2) {
      throw new Error('Problem statements count mismatch');
    }
    
    const tracks = response.problemStatements.map(ps => ps.track);
    if (!tracks.includes('Software Development') || !tracks.includes('Data Analytics')) {
      throw new Error('Expected problem statement tracks not found');
    }
    
    return response.problemStatements;
  });
};

// Test 5: Polling System
const testPollingSystem = async () => {
  log('🗳️ Testing Polling System');
  
  // Test start poll
  await test('Start Poll', async () => {
    const pollData = {
      teamId: teamId,
      duration: 30, // 30 minutes
      problemStatements: [
        { track: 'Software Development', description: 'https://github.com/test-problem-1' },
        { track: 'Data Analytics', description: 'https://github.com/test-problem-2' }
      ]
    };
    
    const response = await makeRequest(`${BASE_URL}/team-polling/start-poll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      },
      body: JSON.stringify(pollData)
    });
    
    log(`Started poll: ${response.message}`);
    return response;
  });
  
  // Test poll status
  await test('Get Poll Status', async () => {
    const response = await makeRequest(`${BASE_URL}/team-polling/poll-status/${teamId}`, {
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      }
    });
    
    if (!response.pollActive) {
      throw new Error('Poll should be active');
    }
    
    if (!response.pollProblemStatements || response.pollProblemStatements.length === 0) {
      throw new Error('Poll problem statements not found');
    }
    
    return response;
  });
  
  // Test voting
  await test('Vote on Problem Statement', async () => {
    const voteData = {
      teamId: teamId,
      problemStatementId: 'Software Development'
    };
    
    const response = await makeRequest(`${BASE_URL}/team-polling/vote-problem-statement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      },
      body: JSON.stringify(voteData)
    });
    
    log(`Vote cast: ${response.message}`);
    return response;
  });
  
  // Test member voting
  await test('Member Vote', async () => {
    const voteData = {
      teamId: teamId,
      problemStatementId: 'Data Analytics'
    };
    
    const response = await makeRequest(`${BASE_URL}/team-polling/vote-problem-statement`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.member}`
      },
      body: JSON.stringify(voteData)
    });
    
    log(`Member vote cast: ${response.message}`);
    return response;
  });
  
  // Test poll conclusion
  await test('Conclude Poll', async () => {
    const response = await makeRequest(`${BASE_URL}/team-polling/conclude-poll/${teamId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      }
    });
    
    log(`Poll concluded: ${response.message}`);
    return response;
  });
};

// Test 6: Chat System
const testChatSystem = async () => {
  log('💬 Testing Chat System');
  
  // Test send message
  await test('Send Chat Message', async () => {
    const messageData = {
      teamId: teamId,
      message: 'Hello team! This is a test message.',
      type: 'text'
    };
    
    const response = await makeRequest(`${BASE_URL}/chat/send-message`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      },
      body: JSON.stringify(messageData)
    });
    
    log(`Message sent: ${response.message}`);
    return response;
  });
  
  // Test get messages
  await test('Get Chat Messages', async () => {
    const response = await makeRequest(`${BASE_URL}/chat/messages/${teamId}`, {
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      }
    });
    
    if (response.messages.length === 0) {
      throw new Error('No messages found');
    }
    
    const lastMessage = response.messages[response.messages.length - 1];
    if (lastMessage.message !== 'Hello team! This is a test message.') {
      throw new Error('Message content mismatch');
    }
    
    return response.messages;
  });
  
  // Test file upload (simulate)
  await test('File Upload Simulation', async () => {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for upload');
    
    const formData = new FormData();
    formData.append('file', fs.createReadStream(testFilePath));
    formData.append('teamId', teamId);
    formData.append('message', 'Test file upload');
    
    const response = await fetch(`${BASE_URL}/chat/upload-file`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.member}`,
        ...formData.getHeaders()
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`File upload failed: ${response.status}`);
    }
    
    const result = await response.json();
    log(`File uploaded: ${result.message}`);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    return result;
  });
};

// Test 7: Submission System
const testSubmissionSystem = async () => {
  log('📤 Testing Submission System');
  
  await test('Submit Project', async () => {
    const submissionData = {
      teamId: teamId,
      githubLink: 'https://github.com/test-team/test-project',
      deploymentLink: 'https://test-project.vercel.app',
      teamVideoLink: 'https://youtube.com/watch?v=test'
    };
    
    const response = await makeRequest(`${BASE_URL}/teams/${teamId}/submit`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      },
      body: JSON.stringify(submissionData)
    });
    
    log(`Project submitted: ${response.message}`);
    return response;
  });
  
  await test('Get Submission Status', async () => {
    const response = await makeRequest(`${BASE_URL}/teams/${teamId}/submission`, {
      headers: {
        'Authorization': `Bearer ${authTokens.leader}`
      }
    });
    
    if (!response.submission) {
      throw new Error('Submission not found');
    }
    
    return response.submission;
  });
};

// Test 8: Role-based Access Control
const testRoleBasedAccess = async () => {
  log('🔐 Testing Role-based Access Control');
  
  // Test admin-only hackathon creation
  await test('Admin-only Hackathon Creation', async () => {
    try {
      const hackathonData = {
        name: 'Unauthorized Hackathon',
        description: 'This should fail',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      await makeRequest(`${BASE_URL}/hackathons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.member}`
        },
        body: JSON.stringify(hackathonData)
      });
      
      throw new Error('Non-admin should not be able to create hackathons');
    } catch (error) {
      if (error.message.includes('HTTP 403') || error.message.includes('unauthorized')) {
        log('✅ Non-admin correctly blocked from creating hackathons');
        return true;
      }
      throw error;
    }
  });
  
  // Test leader-only poll operations
  await test('Leader-only Poll Operations', async () => {
    try {
      await makeRequest(`${BASE_URL}/team-polling/start-poll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authTokens.member}`
        },
        body: JSON.stringify({
          teamId: teamId,
          duration: 30
        })
      });
      
      throw new Error('Non-leader should not be able to start polls');
    } catch (error) {
      if (error.message.includes('HTTP 403') || error.message.includes('unauthorized')) {
        log('✅ Non-leader correctly blocked from starting polls');
        return true;
      }
      throw error;
    }
  });
};

// Test 9: Error Handling
const testErrorHandling = async () => {
  log('⚠️ Testing Error Handling');
  
  await test('Invalid Token Handling', async () => {
    try {
      await makeRequest(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      throw new Error('Should have failed with invalid token');
    } catch (error) {
      if (error.message.includes('HTTP 401')) {
        log('✅ Invalid token correctly rejected');
        return true;
      }
      throw error;
    }
  });
  
  await test('Non-existent Resource Handling', async () => {
    try {
      await makeRequest(`${BASE_URL}/hackathons/invalid-id`, {
        headers: {
          'Authorization': `Bearer ${authTokens.admin}`
        }
      });
      throw new Error('Should have failed with non-existent hackathon');
    } catch (error) {
      if (error.message.includes('HTTP 404')) {
        log('✅ Non-existent resource correctly handled');
        return true;
      }
      throw error;
    }
  });
};

// Test 10: Data Validation
const testDataValidation = async () => {
  log('✅ Testing Data Validation');
  
  await test('Required Field Validation', async () => {
    try {
      await makeRequest(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          // Missing email and password
        })
      });
      throw new Error('Should have failed validation');
    } catch (error) {
      if (error.message.includes('HTTP 400')) {
        log('✅ Required field validation working');
        return true;
      }
      throw error;
    }
  });
  
  await test('Email Format Validation', async () => {
    try {
      await makeRequest(`${BASE_URL}/auth/register`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
          phoneNumber: '1234567890'
        })
      });
      throw new Error('Should have failed email validation');
    } catch (error) {
      if (error.message.includes('HTTP 400')) {
        log('✅ Email format validation working');
        return true;
      }
      throw error;
    }
  });
};

// Main test runner
const runComprehensiveTests = async () => {
  log('🚀 Starting Comprehensive Feature Testing');
  log(`Testing against: ${BASE_URL}`);
  
  const startTime = Date.now();
  
  try {
    await testAuthentication();
    await testHackathonManagement();
    await testTeamManagement();
    await testProblemStatementDisplay();
    await testPollingSystem();
    await testChatSystem();
    await testSubmissionSystem();
    await testRoleBasedAccess();
    await testErrorHandling();
    await testDataValidation();
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    log(`🎉 All tests completed in ${duration}s`);
    
    // Generate test report
    const passedTests = testResults.filter(t => t.status === 'PASS').length;
    const failedTests = testResults.filter(t => t.status === 'FAIL').length;
    
    log(`📊 Test Results: ${passedTests} passed, ${failedTests} failed`);
    
    if (failedTests > 0) {
      log('❌ Failed Tests:', 'error');
      testResults.filter(t => t.status === 'FAIL').forEach(test => {
        log(`  - ${test.name}: ${test.error}`, 'error');
      });
    }
    
    return {
      total: testResults.length,
      passed: passedTests,
      failed: failedTests,
      duration: duration,
      results: testResults
    };
    
  } catch (error) {
    log(`💥 Test suite failed: ${error.message}`, 'error');
    throw error;
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runComprehensiveTests()
    .then(results => {
      console.log('\n🎯 COMPREHENSIVE TEST SUMMARY:');
      console.log(`Total Tests: ${results.total}`);
      console.log(`Passed: ${results.passed}`);
      console.log(`Failed: ${results.failed}`);
      console.log(`Duration: ${results.duration}s`);
      console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
      
      if (results.failed === 0) {
        console.log('\n🎉 ALL TESTS PASSED! The application is working perfectly!');
        process.exit(0);
      } else {
        console.log('\n⚠️ Some tests failed. Please review the issues above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test suite crashed:', error.message);
      process.exit(1);
    });
}

export { runComprehensiveTests };
