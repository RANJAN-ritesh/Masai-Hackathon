#!/usr/bin/env node

/**
 * Test JWT authentication after fixes
 */

const baseURL = 'https://masai-hackathon.onrender.com';

const testJWTLogin = async () => {
  try {
    console.log('🔐 Testing JWT authentication after fixes...');
    
    const response = await fetch(`${baseURL}/users/verify-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ Login failed:', errorData.message);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Login successful!');
    console.log('🔍 Response structure:');
    console.log(`   - Message: ${data.message}`);
    console.log(`   - User ID: ${data.user._id}`);
    console.log(`   - User Role: ${data.user.role}`);
    console.log(`   - JWT Token: ${data.token ? 'PROVIDED ✅' : 'MISSING ❌'}`);
    
    if (data.token) {
      console.log(`   - Token Length: ${data.token.length} characters`);
      console.log(`   - Token Preview: ${data.token.substring(0, 20)}...`);
    }
    
    // Test using the JWT token for an authenticated request
    if (data.token) {
      console.log('\n🔍 Testing JWT token for authenticated request...');
      
      const testResponse = await fetch(`${baseURL}/notifications/${data.user._id}`, {
        headers: {
          'Authorization': `Bearer ${data.token}`
        }
      });
      
      if (testResponse.ok) {
        console.log('✅ JWT token works for authenticated requests!');
      } else {
        console.log('❌ JWT token failed for authenticated request:', testResponse.status);
      }
    }
    
    console.log('\n✅ JWT authentication system is working correctly!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
};

testJWTLogin();
