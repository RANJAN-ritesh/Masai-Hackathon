// Test if the route is accessible
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 TESTING ROUTE ACCESSIBILITY\n');

async function testRouteAccess() {
  try {
    // Login as Valerie
    console.log('\n🔐 Logging in as Valerie...');
    const valerieResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'valerie.m2@example.com',
      password: 'password123'
    });
    const valerieToken = valerieResponse.data.token;
    console.log('✅ Valerie login successful');

    // Test if the route exists by trying to access it
    console.log('\n🔍 Testing route accessibility...');
    
    // Test 1: Try to access the route with a dummy ID
    try {
      const response = await axios.put(`${BASE_URL}/participant-team/respond-invitation/dummy-id`, {
        response: 'accepted',
        message: 'Test'
      }, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      console.log('✅ Route is accessible (unexpected success)');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('❌ Route returns 404 - route not found');
      } else if (error.response?.status === 400) {
        console.log('✅ Route is accessible (400 error expected for invalid ID)');
        console.log('Error details:', error.response.data);
      } else {
        console.log('❌ Route error:', error.response?.status, error.response?.data);
      }
    }

    // Test 2: Check if other participant-team routes work
    console.log('\n🔍 Testing other participant-team routes...');
    try {
      const requestsResponse = await axios.get(`${BASE_URL}/participant-team/requests`, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      console.log('✅ /participant-team/requests route works');
    } catch (error) {
      console.log('❌ /participant-team/requests route failed:', error.response?.status);
    }

    // Test 3: Check if the route is defined in the routes file
    console.log('\n🔍 Checking route definition...');
    try {
      const response = await axios.get(`${BASE_URL}/participant-team/respond-invitation/test`, {
        headers: { 'Authorization': `Bearer ${valerieToken}` }
      });
      console.log('✅ GET route exists (unexpected)');
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('✅ Route exists but method not allowed (expected for PUT route)');
      } else if (error.response?.status === 404) {
        console.log('❌ Route does not exist (404)');
      } else {
        console.log('❌ Route error:', error.response?.status);
      }
    }

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
  }
}

testRouteAccess();
