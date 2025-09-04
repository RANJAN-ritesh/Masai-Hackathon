// Manual test of invitation acceptance
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 MANUAL TEST: Direct invitation acceptance\n');

async function manualTest() {
  try {
    // Login as Valerie
    console.log('\n🔐 Logging in as Valerie...');
    const valerieResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'valerie.m2@example.com',
      password: 'password123'
    });
    const valerieToken = valerieResponse.data.token;
    console.log('✅ Valerie login successful');

    // Try a different approach - use the team-request endpoint
    console.log('\n📨 Trying alternative endpoint...');
    
    // First, let's check what endpoints are available
    console.log('Testing different endpoints:');
    
    // Test 1: Try the team-request endpoint
    try {
      const response1 = await axios.put(`${BASE_URL}/team-request/respond/68b86e843acbd7d7a0067f01`, {
        response: 'accepted',
        message: 'I accept your invitation!'
      }, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      console.log('✅ Team-request endpoint worked:', response1.data);
    } catch (error) {
      console.log('❌ Team-request endpoint failed:', error.response?.status);
    }

    // Test 2: Try without the /participant-team prefix
    try {
      const response2 = await axios.put(`${BASE_URL}/respond-invitation/68b86e843acbd7d7a0067f01`, {
        response: 'accepted',
        message: 'I accept your invitation!'
      }, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      console.log('✅ Direct endpoint worked:', response2.data);
    } catch (error) {
      console.log('❌ Direct endpoint failed:', error.response?.status);
    }

    // Test 3: Try with different HTTP method
    try {
      const response3 = await axios.post(`${BASE_URL}/participant-team/respond-invitation/68b86e843acbd7d7a0067f01`, {
        response: 'accepted',
        message: 'I accept your invitation!'
      }, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      console.log('✅ POST method worked:', response3.data);
    } catch (error) {
      console.log('❌ POST method failed:', error.response?.status);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

manualTest();
