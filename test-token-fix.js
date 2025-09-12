import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5009';

async function testTokenValidation() {
  console.log('🔑 Testing Token Validation Fix');
  
  try {
    // Test with existing user
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
      console.log('✅ Login successful:', loginData.user.name);
      console.log('🔑 Token received:', loginData.token.substring(0, 20) + '...');
      
      // Test token validation
      const profileResponse = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${loginData.token}`
        }
      });
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('✅ Token validation SUCCESSFUL!');
        console.log('👤 User profile:', profileData.user.name, profileData.user.email);
        
        // Test hackathon creation with valid token
        const hackathonData = {
          title: 'Test Hackathon',
          description: 'A test hackathon for validation',
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
        
        const hackathonResponse = await fetch(`${BASE_URL}/hackathons`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginData.token}`
          },
          body: JSON.stringify(hackathonData)
        });
        
        if (hackathonResponse.ok) {
          const hackathonResult = await hackathonResponse.json();
          console.log('✅ Hackathon creation SUCCESSFUL!');
          console.log('🏆 Created hackathon:', hackathonResult.hackathon.title);
        } else {
          const errorText = await hackathonResponse.text();
          console.log('❌ Hackathon creation failed:', errorText);
        }
        
      } else {
        const errorText = await profileResponse.text();
        console.log('❌ Token validation STILL FAILING:', errorText);
      }
    } else {
      const errorText = await loginResponse.text();
      console.log('❌ Login failed:', errorText);
    }
  } catch (error) {
    console.log('❌ Test error:', error.message);
  }
  
  console.log('\n🎯 Token Validation Test Complete');
}

testTokenValidation();

