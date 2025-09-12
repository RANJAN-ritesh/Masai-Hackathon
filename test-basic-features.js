import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5009';

async function testBasicFeatures() {
  console.log('🧪 Testing Basic Features');
  
  // Test 1: Health Check
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data.status);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }
  
  // Test 2: CORS Test
  try {
    const response = await fetch(`${BASE_URL}/cors-test`);
    const data = await response.json();
    console.log('✅ CORS Test:', data.message);
  } catch (error) {
    console.log('❌ CORS Test Failed:', error.message);
  }
  
  // Test 3: User Registration
  try {
    const userData = {
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      userId: 'TEST001',
      code: 'TST001',
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
      console.log('✅ User Registration:', data.message);
      
      // Test 4: User Login
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ User Login:', loginData.message);
        
        // Test 5: Token Validation
        const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${loginData.token}`
          }
        });
        
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log('✅ Token Validation:', profileData.user.name);
        } else {
          const errorText = await profileResponse.text();
          console.log('❌ Token Validation Failed:', errorText);
        }
      } else {
        const errorText = await loginResponse.text();
        console.log('❌ User Login Failed:', errorText);
      }
    } else {
      const errorText = await response.text();
      console.log('❌ User Registration Failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Registration Test Error:', error.message);
  }
  
  // Test 6: Hackathon Creation (if we have a valid token)
  try {
    const hackathonData = {
      name: 'Test Hackathon',
      description: 'A test hackathon',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      maxParticipants: 50,
      problemStatements: [
        {
          track: 'Software Development',
          description: 'https://github.com/test-problem'
        }
      ]
    };
    
    // First get a token by logging in
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
      
      const hackathonResponse = await fetch(`${BASE_URL}/hackathons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify(hackathonData)
      });
      
      if (hackathonResponse.ok) {
        const hackathonData = await hackathonResponse.json();
        console.log('✅ Hackathon Creation:', hackathonData.hackathon.name);
      } else {
        const errorText = await hackathonResponse.text();
        console.log('❌ Hackathon Creation Failed:', errorText);
      }
    } else {
      console.log('❌ Could not login as admin for hackathon test');
    }
  } catch (error) {
    console.log('❌ Hackathon Test Error:', error.message);
  }
  
  console.log('\n🎯 Basic Feature Test Complete');
}

testBasicFeatures();

