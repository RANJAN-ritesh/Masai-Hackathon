import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';

const BASE_URL = 'http://localhost:5009';

async function testJWTComprehensive() {
  console.log('🔑 COMPREHENSIVE JWT TESTING');
  console.log('================================');
  
  // Test 1: Health Check
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data.status);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
    return;
  }
  
  // Test 2: User Registration
  let token = null;
  try {
    const userData = {
      name: 'JWT Test User',
      email: 'jwttest@example.com',
      password: 'password123',
      userId: 'JWT001',
      code: 'JWT001',
      course: 'Computer Science',
      skills: ['JavaScript', 'React'],
      vertical: 'Technology',
      phoneNumber: '1234567890'
    };
    
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    if (response.ok) {
      const data = await response.json();
      token = data.token;
      console.log('✅ User Registration:', data.message);
      console.log('🔑 Token received:', token.substring(0, 50) + '...');
    } else {
      const errorText = await response.text();
      console.log('❌ User Registration Failed:', errorText);
      return;
    }
  } catch (error) {
    console.log('❌ Registration Error:', error.message);
    return;
  }
  
  // Test 3: Token Validation
  if (token) {
    try {
      const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token Validation SUCCESS!');
        console.log('👤 User:', data.user.name, data.user.email);
      } else {
        const errorText = await response.text();
        console.log('❌ Token Validation FAILED:', errorText);
      }
    } catch (error) {
      console.log('❌ Token Validation Error:', error.message);
    }
  }
  
  // Test 4: JWT Secret Consistency Check
  console.log('\n🔍 JWT SECRET CONSISTENCY CHECK');
  console.log('================================');
  
  const secrets = [
    'masai-hackathon-jwt-secret-key-2025',
    'your-super-secret-jwt-key-change-in-production',
    'fallback-secret'
  ];
  
  for (const secret of secrets) {
    try {
      const decoded = jwt.verify(token, secret);
      console.log(`✅ Token decoded with secret: ${secret}`);
      console.log('📋 Decoded payload:', decoded);
      break;
    } catch (error) {
      console.log(`❌ Failed with secret: ${secret}`);
    }
  }
  
  // Test 5: Hackathon Creation (Authenticated Endpoint)
  console.log('\n🏆 TESTING AUTHENTICATED ENDPOINT');
  console.log('==================================');
  
  try {
    const hackathonData = {
      title: 'JWT Test Hackathon',
      description: 'Testing JWT authentication',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      problemStatements: [
        {
          track: 'Software Development',
          description: 'https://github.com/jwt-test-problem'
        }
      ]
    };
    
    const response = await fetch(`${BASE_URL}/hackathons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(hackathonData)
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Hackathon Creation SUCCESS!');
      console.log('🏆 Created:', data.hackathon.title);
    } else {
      const errorText = await response.text();
      console.log('❌ Hackathon Creation Failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Hackathon Creation Error:', error.message);
  }
  
  // Test 6: Token Verification Endpoint
  console.log('\n🔐 TESTING TOKEN VERIFICATION ENDPOINT');
  console.log('=====================================');
  
  try {
    const response = await fetch(`${BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Token Verification SUCCESS!');
      console.log('👤 Verified User:', data.user.name);
    } else {
      const errorText = await response.text();
      console.log('❌ Token Verification Failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Token Verification Error:', error.message);
  }
  
  console.log('\n🎯 JWT COMPREHENSIVE TEST COMPLETE');
  console.log('==================================');
}

testJWTComprehensive();

