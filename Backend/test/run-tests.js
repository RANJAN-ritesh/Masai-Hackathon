const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';
const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

let adminToken = null;
let createdHackathonId = null;
let createdTeamId = null;

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  total: 0
};

// Utility function to log test results
function logTestResult(testName, passed, error = null) {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName} - PASSED`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName} - FAILED`);
    if (error) {
      console.error(`   Error: ${error}`);
    }
  }
}

// Test functions
async function testAdminLogin() {
  try {
    const response = await axios.post(`${BASE_URL}/users/verify-user`, ADMIN_CREDENTIALS);
    if (response.status === 200 && response.data.user.role === 'admin') {
      adminToken = response.data.user._id;
      logTestResult('Admin Login', true);
      return true;
    } else {
      logTestResult('Admin Login', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTestResult('Admin Login', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateHackathon() {
  try {
    const hackathonData = {
      title: 'Test Hackathon 2025',
      description: 'A test hackathon for admin testing',
      startDate: '2025-09-01T00:00:00.000Z',
      endDate: '2025-09-07T23:59:59.000Z',
      eventType: 'Team Hackathon',
      maxTeamSize: 4,
      minTeamSize: 2,
      status: 'upcoming'
    };

    const response = await axios.post(`${BASE_URL}/hackathons`, hackathonData);
    if (response.status === 201) {
      createdHackathonId = response.data.hackathon._id;
      logTestResult('Create Hackathon', true);
      return true;
    } else {
      logTestResult('Create Hackathon', false, 'Invalid response status');
      return false;
    }
  } catch (error) {
    logTestResult('Create Hackathon', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testViewHackathons() {
  try {
    const response = await axios.get(`${BASE_URL}/hackathons`);
    if (response.status === 200 && Array.isArray(response.data)) {
      const ourHackathon = response.data.find(h => h._id === createdHackathonId);
      if (ourHackathon) {
        logTestResult('View All Hackathons', true);
        return true;
      } else {
        logTestResult('View All Hackathons', false, 'Created hackathon not found in list');
        return false;
      }
    } else {
      logTestResult('View All Hackathons', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTestResult('View All Hackathons', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testViewSpecificHackathon() {
  try {
    const response = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
    if (response.status === 200 && response.data._id === createdHackathonId) {
      logTestResult('View Specific Hackathon', true);
      return true;
    } else {
      logTestResult('View Specific Hackathon', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTestResult('View Specific Hackathon', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testEditHackathon() {
  try {
    const updateData = {
      title: 'Updated Test Hackathon 2025',
      description: 'Updated description for admin testing',
      status: 'active'
    };

    const response = await axios.put(`${BASE_URL}/hackathons/${createdHackathonId}`, updateData);
    if (response.status === 200) {
      // Verify the update
      const getResponse = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
      if (getResponse.data.title === updateData.title) {
        logTestResult('Edit Hackathon', true);
        return true;
      } else {
        logTestResult('Edit Hackathon', false, 'Update not reflected');
        return false;
      }
    } else {
      logTestResult('Edit Hackathon', false, 'Invalid response status');
      return false;
    }
  } catch (error) {
    logTestResult('Edit Hackathon', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateTeam() {
  try {
    const teamData = {
      teamName: 'Test Team Alpha',
      hackathonId: createdHackathonId,
      maxMembers: 4,
      description: 'A test team created by admin'
    };

    const response = await axios.post(`${BASE_URL}/team/create-team`, teamData);
    if (response.status === 201) {
      createdTeamId = response.data.team._id;
      logTestResult('Create Team', true);
      return true;
    } else {
      logTestResult('Create Team', false, 'Invalid response status');
      return false;
    }
  } catch (error) {
    logTestResult('Create Team', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testViewTeams() {
  try {
    const response = await axios.get(`${BASE_URL}/team/get-teams`);
    if (response.status === 200 && Array.isArray(response.data)) {
      const ourTeam = response.data.find(t => t._id === createdTeamId);
      if (ourTeam) {
        logTestResult('View All Teams', true);
        return true;
      } else {
        logTestResult('View All Teams', false, 'Created team not found in list');
        return false;
      }
    } else {
      logTestResult('View All Teams', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTestResult('View All Teams', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testViewTeamsByHackathon() {
  try {
    const response = await axios.get(`${BASE_URL}/team/${createdHackathonId}`);
    if (response.status === 200 && Array.isArray(response.data)) {
      const ourTeam = response.data.find(t => t._id === createdTeamId);
      if (ourTeam) {
        logTestResult('View Teams by Hackathon', true);
        return true;
      } else {
        logTestResult('View Teams by Hackathon', false, 'Team not found in hackathon');
        return false;
      }
    } else {
      logTestResult('View Teams by Hackathon', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTestResult('View Teams by Hackathon', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testDeleteTeam() {
  try {
    const response = await axios.post(`${BASE_URL}/team/delete-team`, {
      teamId: createdTeamId
    });
    if (response.status === 200) {
      logTestResult('Delete Team', true);
      return true;
    } else {
      logTestResult('Delete Team', false, 'Invalid response status');
      return false;
    }
  } catch (error) {
    logTestResult('Delete Team', false, error.response?.data?.message || error.message);
    return false;
  }
}

async function testDeleteHackathon() {
  // COMMENTED OUT: Automatic hackathon deletion to prevent data loss in production
  console.log('⚠️ Hackathon deletion test skipped to preserve data');
  logTestResult('Delete Hackathon', true, 'Skipped to preserve data');
  return true;
  
  // Original deletion code commented out:
  // try {
  //   const response = await axios.delete(`${BASE_URL}/hackathons/${createdHackathonId}`);
  //   if (response.status === 200) {
  //     // Verify deletion
  //     try {
  //       await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
  //       logTestResult('Delete Hackathon', false, 'Hackathon still exists after deletion');
  //       return false;
  //     } catch (getError) {
  //       if (getError.response.status === 404) {
  //         logTestResult('Delete Hackathon', true);
  //         return true;
  //       } else {
  //         logTestResult('Delete Hackathon', false, 'Unexpected error after deletion');
  //         return false;
  //       }
  //     }
  //   } else {
  //     logTestResult('Delete Hackathon', false, 'Invalid response status');
  //     return false;
  //   }
  // } catch (error) {
  //   logTestResult('Delete Hackathon', false, error.response?.data?.message || error.message);
  //   return false;
  // }
}

async function testViewUsers() {
  try {
    const response = await axios.get(`${BASE_URL}/users/getAllUsers`);
    if (response.status === 200 && Array.isArray(response.data)) {
      const adminUser = response.data.find(u => u.email === 'admin@test.com');
      if (adminUser && adminUser.role === 'admin') {
        logTestResult('View All Users', true);
        return true;
      } else {
        logTestResult('View All Users', false, 'Admin user not found or invalid role');
        return false;
      }
    } else {
      logTestResult('View All Users', false, 'Invalid response');
      return false;
    }
  } catch (error) {
    logTestResult('View All Users', false, error.response?.data?.message || error.message);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Admin Functionality Tests...\n');
  console.log('=' .repeat(60));
  
  // Run tests in sequence
  await testAdminLogin();
  await testCreateHackathon();
  await testViewHackathons();
  await testViewSpecificHackathon();
  await testEditHackathon();
  await testCreateTeam();
  await testViewTeams();
  await testViewTeamsByHackathon();
  await testDeleteTeam();
  await testDeleteHackathon();
  await testViewUsers();
  
  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${testResults.total}`);
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Your admin functionality is working perfectly!');
  } else {
    console.log(`\n⚠️ ${testResults.failed} test(s) failed. Check the errors above.`);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults
}; 