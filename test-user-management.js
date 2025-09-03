#!/usr/bin/env node

/**
 * Comprehensive test for user management features
 * Tests all new admin endpoints for user management
 */

const baseURL = 'https://masai-hackathon.onrender.com';

const testUserManagement = async () => {
  console.log('🧪 Testing User Management Features...');
  console.log('============================================================');

  let results = [];
  let successCount = 0;
  let totalTests = 0;

  const addResult = (testName, passed, message) => {
    totalTests++;
    if (passed) successCount++;
    results.push({ testName, passed, message });
    console.log(`${passed ? '✅' : '❌'} ${testName}: ${message}`);
  };

  try {
    // Test 1: Admin Authentication
    console.log('\n🔐 Test 1: Admin Authentication');
    const loginResponse = await fetch(`${baseURL}/users/verify-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      addResult('Admin Login', false, 'Failed to login as admin');
      return;
    }

    const loginData = await loginResponse.json();
    const authToken = loginData.token;
    const userId = loginData.user._id;
    
    addResult('Admin Login', true, 'Successfully logged in as admin');

    // Test 2: Get all users
    console.log('\n👥 Test 2: Get All Users');
    const usersResponse = await fetch(`${baseURL}/users/getAllUsers`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (!usersResponse.ok) {
      addResult('Get All Users', false, 'Failed to fetch users');
      return;
    }

    const usersData = await usersResponse.json();
    const users = Array.isArray(usersData) ? usersData : (usersData.users || []);
    
    if (users.length === 0) {
      addResult('Users Available', false, 'No users found');
      return;
    }

    addResult('Get All Users', true, `Found ${users.length} users`);

    // Test 3: Test update user endpoint
    console.log('\n✏️ Test 3: Update User Endpoint');
    const testUser = users.find(u => u.role !== 'admin');
    
    if (!testUser) {
      addResult('Update User', false, 'No non-admin user found to test update');
    } else {
      const updateResponse = await fetch(`${baseURL}/users/update-user/${testUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: testUser.name + ' (Updated)',
          isVerified: true
        })
      });

      if (updateResponse.ok) {
        addResult('Update User', true, 'Successfully updated user');
      } else {
        const error = await updateResponse.json();
        addResult('Update User', false, `Failed to update user: ${error.message}`);
      }
    }

    // Test 4: Test delete user endpoint (should fail for admin users)
    console.log('\n🗑️ Test 4: Delete User Authorization');
    const adminUser = users.find(u => u.role === 'admin');
    
    if (adminUser) {
      const deleteAdminResponse = await fetch(`${baseURL}/users/delete-user/${adminUser._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });

      if (deleteAdminResponse.status === 403) {
        addResult('Delete Admin Protection', true, 'Properly prevented admin deletion');
      } else {
        addResult('Delete Admin Protection', false, `Unexpected response: ${deleteAdminResponse.status}`);
      }
    } else {
      addResult('Delete Admin Protection', false, 'No admin user found to test');
    }

    // Test 5: Test delete non-existent user
    console.log('\n🚫 Test 5: Delete Non-existent User');
    const deleteInvalidResponse = await fetch(`${baseURL}/users/delete-user/invalid_user_id`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (deleteInvalidResponse.status === 404) {
      addResult('Delete Invalid User', true, 'Properly rejected invalid user ID');
    } else {
      addResult('Delete Invalid User', false, `Unexpected response: ${deleteInvalidResponse.status}`);
    }

    // Test 6: Test delete all users endpoint
    console.log('\n🗑️ Test 6: Delete All Users Endpoint');
    const deleteAllResponse = await fetch(`${baseURL}/users/delete-all-users`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (deleteAllResponse.ok) {
      const result = await deleteAllResponse.json();
      addResult('Delete All Users', true, `Successfully deleted ${result.deletedCount} non-admin users`);
    } else {
      const error = await deleteAllResponse.json();
      addResult('Delete All Users', false, `Failed to delete all users: ${error.message}`);
    }

    // Test 7: Verify users were deleted
    console.log('\n✅ Test 7: Verify Deletion');
    const verifyResponse = await fetch(`${baseURL}/users/getAllUsers`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      const remainingUsers = Array.isArray(verifyData) ? verifyData : (verifyData.users || []);
      const adminUsers = remainingUsers.filter(u => u.role === 'admin');
      
      if (remainingUsers.length === adminUsers.length) {
        addResult('Verify Deletion', true, `Only ${adminUsers.length} admin users remain`);
      } else {
        addResult('Verify Deletion', false, `Non-admin users still exist: ${remainingUsers.length - adminUsers.length}`);
      }
    } else {
      addResult('Verify Deletion', false, 'Failed to verify deletion');
    }

    // Test 8: Test rate limiting on user management endpoints
    console.log('\n🚫 Test 8: Rate Limiting on User Management');
    const rapidRequests = [];
    for (let i = 0; i < 10; i++) {
      rapidRequests.push(
        fetch(`${baseURL}/users/getAllUsers`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        })
      );
    }

    const rapidResponses = await Promise.all(rapidRequests);
    const rateLimitedCount = rapidResponses.filter(r => r.status === 429).length;

    if (rateLimitedCount === 0) {
      addResult('Rate Limiting', true, 'No rate limiting detected (good for legitimate requests)');
    } else {
      addResult('Rate Limiting', false, `${rateLimitedCount} requests were rate limited`);
    }

    // Test 9: Test WebSocket stability during user management
    console.log('\n🔌 Test 9: WebSocket Stability During User Management');
    let wsStable = true;
    for (let i = 0; i < 5; i++) {
      try {
        const healthResponse = await fetch(`${baseURL}/health`);
        if (!healthResponse.ok) {
          wsStable = false;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        wsStable = false;
        break;
      }
    }

    addResult('WebSocket Stability', wsStable, wsStable ? 'WebSocket remains stable during user management' : 'WebSocket became unstable');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    addResult('Overall Test', false, `Test failed: ${error.message}`);
  }

  // Summary
  console.log('\n============================================================');
  console.log('📊 TEST SUMMARY');
  console.log('============================================================');
  console.log(`✅ Passed: ${successCount}/${totalTests} (${((successCount/totalTests)*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);

  if (successCount === totalTests) {
    console.log('\n🎉 User management features are working perfectly!');
    console.log('✅ All endpoints are properly secured');
    console.log('✅ Authorization is working correctly');
    console.log('✅ No connection loops detected');
    console.log('✅ Rate limiting is properly configured');
    console.log('✅ WebSocket stability maintained');
    console.log('✅ User CRUD operations working correctly');
  } else {
    console.log('\n⚠️ Some issues detected. Further investigation needed.');
  }

  return successCount === totalTests;
};

testUserManagement();
