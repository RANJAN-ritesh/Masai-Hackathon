import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5009';

async function debugJWT() {
  console.log('🔍 Debugging JWT Token Issue');
  
  try {
    // Login to get token
    const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@test.com',
        password: 'admin123'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      const token = loginData.token;
      
      console.log('🔑 Token received:', token.substring(0, 50) + '...');
      
      // Try to decode the token with different secrets
      const secrets = [
        'your-super-secret-jwt-key-change-in-production',
        'fallback-secret',
        'your-super-secret-jwt-key-change-in-production'
      ];
      
      for (const secret of secrets) {
        try {
          const decoded = jwt.verify(token, secret);
          console.log('✅ Token decoded successfully with secret:', secret);
          console.log('📋 Decoded payload:', decoded);
          break;
        } catch (error) {
          console.log('❌ Failed to decode with secret:', secret);
        }
      }
      
      // Test the actual endpoint
      console.log('\n🧪 Testing actual endpoint...');
      const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('📊 Profile response status:', profileResponse.status);
      const responseText = await profileResponse.text();
      console.log('📋 Profile response:', responseText);
      
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.log('❌ Debug error:', error.message);
  }
}

debugJWT();

