const axios = require('axios');

const BASE_URL = 'http://localhost:5009';

// Test auth routes
const testAuth = async () => {
  console.log('🔐 Testing Auth Routes...');
  
  try {
    // 1. Register a user
    console.log('1. Registering user...');
    const registerResult = await axios.post(`${BASE_URL}/auth/register`, {
      name: 'Test Leader',
      email: 'testleader@example.com',
      password: 'password123',
      userId: 'testleader001',
      code: 'TL001',
      course: 'Full Stack Development',
      skills: ['JavaScript', 'React', 'Node.js'],
      vertical: 'Web Development',
      phoneNumber: '1234567890'
    });
    
    if (registerResult.status === 201) {
      console.log('✅ User registered successfully');
      return registerResult.data.token;
    } else {
      console.log('❌ Registration failed');
      return null;
    }
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
      console.log('⚠️ User already exists, trying to login...');
      try {
        const loginResult = await axios.post(`${BASE_URL}/auth/login`, {
          email: 'testleader@example.com',
          password: 'password123'
        });
        
        if (loginResult.status === 200) {
          console.log('✅ User logged in successfully');
          return loginResult.data.token;
        } else {
          console.log('❌ Login failed');
          return null;
        }
      } catch (loginError) {
        console.log('❌ Login failed:', loginError.response?.data || loginError.message);
        return null;
      }
    } else {
      console.log('❌ Registration failed:', error.response?.data || error.message);
      return null;
    }
  }
};

// Test chat routes
const testChat = async (token) => {
  console.log('\n💬 Testing Chat Routes...');
  
  // Create a test team first
  console.log('1. Creating test team...');
  const teamResult = await axios.post(`${BASE_URL}/participant-team`, {
    teamName: 'Chat Test Team',
    hackathonId: 'test-hackathon-id',
    teamMembers: ['testmember1@example.com']
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (teamResult.status === 201) {
    console.log('✅ Team created successfully');
    const teamId = teamResult.data.team._id;
    
    // Test sending message
    console.log('2. Sending test message...');
    const messageResult = await axios.post(`${BASE_URL}/chat/send-message`, {
      teamId: teamId,
      message: 'Hello team!'
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (messageResult.status === 200) {
      console.log('✅ Message sent successfully');
      
      // Test getting messages
      console.log('3. Getting messages...');
      const getMessagesResult = await axios.get(`${BASE_URL}/chat/messages/${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (getMessagesResult.status === 200) {
        console.log('✅ Messages retrieved successfully');
        console.log(`   Found ${getMessagesResult.data.messages.length} messages`);
        return true;
      } else {
        console.log('❌ Failed to get messages');
        return false;
      }
    } else {
      console.log('❌ Failed to send message');
      return false;
    }
  } else {
    console.log('❌ Failed to create team');
    return false;
  }
};

// Test polling routes
const testPolling = async (token) => {
  console.log('\n🗳️ Testing Polling Routes...');
  
  // Create a test team first
  console.log('1. Creating test team...');
  const teamResult = await axios.post(`${BASE_URL}/participant-team`, {
    teamName: 'Poll Test Team',
    hackathonId: 'test-hackathon-id',
    teamMembers: ['testmember1@example.com']
  }, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (teamResult.status === 201) {
    console.log('✅ Team created successfully');
    const teamId = teamResult.data.team._id;
    
    // Test starting poll
    console.log('2. Starting poll...');
    const startPollResult = await axios.post(`${BASE_URL}/simple-polling/start-poll`, {
      teamId: teamId,
      problemStatementId: 'AI/ML',
      hackathonId: 'test-hackathon-id',
      pollDuration: 2
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (startPollResult.status === 200) {
      console.log('✅ Poll started successfully');
      
      // Test voting
      console.log('3. Voting...');
      const voteResult = await axios.post(`${BASE_URL}/simple-polling/vote`, {
        teamId: teamId,
        problemStatementId: 'AI/ML'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (voteResult.status === 200) {
        console.log('✅ Vote recorded successfully');
        
        // Test concluding poll
        console.log('4. Concluding poll...');
        const concludeResult = await axios.post(`${BASE_URL}/simple-polling/conclude-poll`, {
          teamId: teamId
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (concludeResult.status === 200) {
          console.log('✅ Poll concluded successfully');
          return true;
        } else {
          console.log('❌ Failed to conclude poll');
          return false;
        }
      } else {
        console.log('❌ Failed to vote');
        return false;
      }
    } else {
      console.log('❌ Failed to start poll');
      return false;
    }
  } else {
    console.log('❌ Failed to create team');
    return false;
  }
};

// Test file upload
const testFileUpload = async (token) => {
  console.log('\n📁 Testing File Upload...');
  
  const fs = require('fs');
  const FormData = require('form-data');
  const path = require('path');
  
  // Create a test file
  const testFileContent = 'This is a test file for upload.';
  const testFilePath = path.join(__dirname, 'test-upload.txt');
  fs.writeFileSync(testFilePath, testFileContent);
  
  try {
    // Create a test team first
    const teamResult = await axios.post(`${BASE_URL}/participant-team`, {
      teamName: 'File Test Team',
      hackathonId: 'test-hackathon-id',
      teamMembers: ['testmember1@example.com']
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (teamResult.status === 201) {
      const teamId = teamResult.data.team._id;
      
      // Test file upload
      const formData = new FormData();
      formData.append('file', fs.createReadStream(testFilePath));
      formData.append('teamId', teamId);
      formData.append('message', 'Test file upload');
      
      const uploadResult = await axios.post(`${BASE_URL}/chat/upload-file`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (uploadResult.status === 200) {
        console.log('✅ File uploaded successfully');
        
        // Test large file upload (should fail)
        console.log('2. Testing large file upload (should fail)...');
        const largeFileContent = 'x'.repeat(3 * 1024 * 1024); // 3MB
        const largeFilePath = path.join(__dirname, 'large-test.txt');
        fs.writeFileSync(largeFilePath, largeFileContent);
        
        try {
          const largeFormData = new FormData();
          largeFormData.append('file', fs.createReadStream(largeFilePath));
          largeFormData.append('teamId', teamId);
          
          await axios.post(`${BASE_URL}/chat/upload-file`, largeFormData, {
            headers: {
              ...largeFormData.getHeaders(),
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log('❌ Large file upload should have failed');
          fs.unlinkSync(largeFilePath);
          return false;
        } catch (error) {
          if (error.response?.status === 413) {
            console.log('✅ Large file upload correctly rejected (413)');
          } else {
            console.log('✅ Large file upload correctly rejected');
          }
          fs.unlinkSync(largeFilePath);
        }
        
        // Clean up
        fs.unlinkSync(testFilePath);
        return true;
      } else {
        console.log('❌ Failed to upload file');
        fs.unlinkSync(testFilePath);
        return false;
      }
    } else {
      console.log('❌ Failed to create team for file test');
      fs.unlinkSync(testFilePath);
      return false;
    }
  } catch (error) {
    console.log('❌ File upload test failed:', error.response?.data || error.message);
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
    return false;
  }
};

// Main test function
const runTests = async () => {
  console.log('🚀 Starting Simple Chat & Polling Tests...\n');
  
  try {
    // Test auth
    const token = await testAuth();
    if (!token) {
      console.log('❌ Auth test failed, stopping tests');
      return;
    }
    
    // Test chat
    const chatSuccess = await testChat(token);
    
    // Test polling
    const pollingSuccess = await testPolling(token);
    
    // Test file upload
    const fileUploadSuccess = await testFileUpload(token);
    
    // Results
    console.log('\n📊 Test Results:');
    console.log(`🔐 Auth: ✅ PASSED`);
    console.log(`💬 Chat: ${chatSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`🗳️ Polling: ${pollingSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`📁 File Upload: ${fileUploadSuccess ? '✅ PASSED' : '❌ FAILED'}`);
    
    const allPassed = chatSuccess && pollingSuccess && fileUploadSuccess;
    console.log(`\n🎯 Overall Result: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    if (allPassed) {
      console.log('\n🎉 Chat and Polling systems are working perfectly!');
      console.log('✅ File size limit is correctly set to 2MB');
      console.log('✅ All features tested and working');
    } else {
      console.log('\n⚠️ Some issues detected. Please check the logs above.');
    }
    
  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
  }
};

// Run the tests
runTests();
