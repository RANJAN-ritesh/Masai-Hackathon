// Test script to check authentication token
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function testAuthentication() {
  console.log('🔍 Testing Authentication...\n');
  
  // Test 1: Check if backend is accessible
  try {
    console.log('1️⃣ Testing backend accessibility...');
    const response = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Backend is accessible');
  } catch (error) {
    console.log('❌ Backend not accessible:', error.message);
    return;
  }

  // Test 2: Test polling endpoints without auth
  try {
    console.log('\n2️⃣ Testing polling endpoints without auth...');
    const response = await axios.get(`${BASE_URL}/team-polling/test`);
    console.log('✅ Polling endpoints accessible without auth');
  } catch (error) {
    console.log('❌ Polling endpoints error:', error.response?.status, error.message);
  }

  // Test 3: Test with invalid token
  try {
    console.log('\n3️⃣ Testing with invalid token...');
    const response = await axios.get(`${BASE_URL}/team-polling/poll-status/test`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    console.log('❌ Unexpected success with invalid token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid token (401)');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.message);
    }
  }

  // Test 4: Test with null token
  try {
    console.log('\n4️⃣ Testing with null token...');
    const response = await axios.get(`${BASE_URL}/team-polling/poll-status/test`, {
      headers: {
        'Authorization': 'Bearer null'
      }
    });
    console.log('❌ Unexpected success with null token');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected null token (401)');
    } else {
      console.log('❌ Unexpected error:', error.response?.status, error.message);
    }
  }

  console.log('\n📊 Authentication test completed!');
}

testAuthentication().catch(console.error);
