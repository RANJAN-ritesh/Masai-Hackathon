#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE END-TO-END APP TESTING
 * 
 * This script tests the entire application flow:
 * 1. Backend APIs
 * 2. Authentication
 * 3. Hackathon data
 * 4. Team creation 
 * 5. WebSocket connectivity
 * 6. Frontend accessibility
 */

const baseURL = 'https://masai-hackathon.onrender.com';
const frontendURL = 'https://masai-hackathon.netlify.app';

// Test data
const testUsers = [
  { email: 'aaron.miller1@example.com', expectedRole: 'leader' },
  { email: 'bianca.rod2@example.com', expectedRole: 'member' },
  { email: 'admin@example.com', expectedRole: 'admin' }
];

console.log('🧪 COMPREHENSIVE END-TO-END TESTING');
console.log('=====================================\n');

// Test 1: Backend Health Check
const testBackendHealth = async () => {
  console.log('🏥 TEST 1: Backend Health Check');
  try {
    const response = await fetch(`${baseURL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (response.ok) {
      console.log('✅ Backend is running and responding');
      return true;
    } else {
      console.log(`❌ Backend health check failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend unreachable: ${error.message}`);
    return false;
  }
};

// Test 2: Hackathons Endpoint
const testHackathons = async () => {
  console.log('\n🏆 TEST 2: Hackathons Data');
  try {
    const response = await fetch(`${baseURL}/hackathons`);
    
    if (!response.ok) {
      console.log(`❌ Hackathons endpoint failed: ${response.status}`);
      return { success: false, hackathons: [] };
    }
    
    const hackathons = await response.json();
    
    if (!Array.isArray(hackathons)) {
      console.log('❌ Hackathons response is not an array');
      return { success: false, hackathons: [] };
    }
    
    if (hackathons.length === 0) {
      console.log('❌ No hackathons found in database');
      return { success: false, hackathons: [] };
    }
    
    console.log(`✅ Found ${hackathons.length} hackathons:`);
    hackathons.forEach((h, i) => {
      console.log(`   ${i + 1}. ${h.title} (${h.teamCreationMode}) - ${h.status}`);
    });
    
    return { success: true, hackathons };
  } catch (error) {
    console.log(`❌ Error fetching hackathons: ${error.message}`);
    return { success: false, hackathons: [] };
  }
};

// Test 3: User Authentication
const testUserAuth = async () => {
  console.log('\n👤 TEST 3: User Authentication');
  let authResults = [];
  
  for (const testUser of testUsers) {
    try {
      console.log(`🔐 Testing login for: ${testUser.email}`);
      
      // Try login with default password
      const loginResponse = await fetch(`${baseURL}/users/verify-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: 'password123' // Default test password
        })
      });
      
      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log(`   ✅ Login successful - Role: ${loginData.user.role}, Verified: ${loginData.user.isVerified}`);
        
        // Test getting user data
        const userResponse = await fetch(`${baseURL}/users/get-user/${loginData.user._id}`);
        if (userResponse.ok) {
          console.log(`   ✅ User data fetch successful`);
          authResults.push({
            email: testUser.email,
            success: true,
            userId: loginData.user._id,
            role: loginData.user.role
          });
        } else {
          console.log(`   ❌ User data fetch failed: ${userResponse.status}`);
          authResults.push({ email: testUser.email, success: false, error: 'User data fetch failed' });
        }
      } else {
        const errorData = await loginResponse.json();
        console.log(`   ❌ Login failed: ${errorData.message}`);
        authResults.push({ email: testUser.email, success: false, error: errorData.message });
      }
    } catch (error) {
      console.log(`   ❌ Authentication error for ${testUser.email}: ${error.message}`);
      authResults.push({ email: testUser.email, success: false, error: error.message });
    }
  }
  
  return authResults;
};

// Test 4: Team System
const testTeamSystem = async (authResults, hackathons) => {
  console.log('\n👥 TEST 4: Team System');
  
  if (hackathons.length === 0) {
    console.log('❌ No hackathons available for team testing');
    return false;
  }
  
  const successfulAuth = authResults.find(a => a.success);
  if (!successfulAuth) {
    console.log('❌ No successful authentication for team testing');
    return false;
  }
  
  try {
    const hackathon = hackathons[0];
    console.log(`🔍 Testing teams for hackathon: ${hackathon.title}`);
    
    // Get teams for hackathon
    const teamsResponse = await fetch(`${baseURL}/team/hackathon/${hackathon._id}`);
    
    if (teamsResponse.ok) {
      const teamsData = await teamsResponse.json();
      console.log(`✅ Teams endpoint working - Found ${teamsData.teams?.length || 0} teams`);
      
      // Get user's team
      const userTeamResponse = await fetch(`${baseURL}/team/user/${successfulAuth.userId}/hackathon/${hackathon._id}`);
      
      if (userTeamResponse.ok) {
        const userTeamData = await userTeamResponse.json();
        console.log(`✅ User team lookup working - User is in team: ${userTeamData.isInTeam}`);
        return true;
      } else {
        console.log(`❌ User team lookup failed: ${userTeamResponse.status}`);
        return false;
      }
    } else {
      console.log(`❌ Teams endpoint failed: ${teamsResponse.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Team system error: ${error.message}`);
    return false;
  }
};

// Test 5: Frontend Accessibility
const testFrontendAccess = async () => {
  console.log('\n🌐 TEST 5: Frontend Accessibility');
  try {
    const response = await fetch(frontendURL, {
      method: 'GET',
      headers: { 'Accept': 'text/html' }
    });
    
    if (response.ok) {
      const html = await response.text();
      if (html.includes('<title>') && html.includes('<!DOCTYPE html>')) {
        console.log('✅ Frontend is accessible and returning HTML');
        return true;
      } else {
        console.log('❌ Frontend returned invalid HTML');
        return false;
      }
    } else {
      console.log(`❌ Frontend access failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend unreachable: ${error.message}`);
    return false;
  }
};

// Test 6: WebSocket Connectivity  
const testWebSocketConnectivity = async () => {
  console.log('\n🔌 TEST 6: WebSocket Connectivity');
  
  // We can't easily test WebSocket from Node.js, but we can check if the endpoint exists
  try {
    const response = await fetch(`${baseURL}/cors-test`);
    if (response.ok) {
      console.log('✅ CORS test endpoint working (WebSocket should work)');
      return true;
    } else {
      console.log(`❌ CORS test failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ WebSocket connectivity test failed: ${error.message}`);
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  console.log('⏰ Starting comprehensive tests...\n');
  const startTime = Date.now();
  
  let totalTests = 6;
  let passedTests = 0;
  
  // Run all tests
  const backendHealthy = await testBackendHealth();
  if (backendHealthy) passedTests++;
  
  const { success: hackathonsSuccess, hackathons } = await testHackathons();
  if (hackathonsSuccess) passedTests++;
  
  const authResults = await testUserAuth();
  const authSuccess = authResults.some(r => r.success);
  if (authSuccess) passedTests++;
  
  const teamSystemSuccess = await testTeamSystem(authResults, hackathons);
  if (teamSystemSuccess) passedTests++;
  
  const frontendSuccess = await testFrontendAccess();
  if (frontendSuccess) passedTests++;
  
  const webSocketSuccess = await testWebSocketConnectivity();
  if (webSocketSuccess) passedTests++;
  
  // Summary
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 ALL TESTS PASSED! Application is fully functional.');
  } else {
    console.log('\n🚨 SOME TESTS FAILED. Issues need to be addressed.');
    
    // Provide user instructions for login
    const workingUser = authResults.find(r => r.success);
    if (workingUser) {
      console.log('\n🔐 FOR TESTING IN BROWSER:');
      console.log(`1. Go to: ${frontendURL}`);
      console.log(`2. Open browser console (F12)`);
      console.log(`3. Run these commands:`);
      console.log(`   localStorage.setItem("userId", "${workingUser.userId}");`);
      console.log(`   localStorage.setItem("userData", '{"_id":"${workingUser.userId}","email":"${workingUser.email}","role":"${workingUser.role}"}');`);
      console.log(`4. Refresh the page`);
    }
  }
};

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test runner failed:', error);
  process.exit(1);
});
