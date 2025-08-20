#!/usr/bin/env node

/**
 * 🧪 COMPREHENSIVE TEAM FUNCTIONALITY TEST FOR JOE PATEL
 * 
 * This script tests the complete team functionality specifically for Joe Patel
 * to ensure he can see his team members properly.
 */

const baseURL = 'https://masai-hackathon.onrender.com';

console.log('🚀 Starting comprehensive team test for Joe Patel...\n');

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  console.log(`${emoji} [${timestamp}] ${message}`);
};

const makeRequest = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${baseURL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data, success: response.ok, status: response.status };
  } catch (error) {
    return { response: null, data: null, success: false, error: error.message };
  }
};

// Test 1: Find Joe Patel's user data
const findJoePatel = async () => {
  log('Finding Joe Patel in the system...');
  
  const { success, data } = await makeRequest('/users/getAllUsers');
  
  if (success) {
    const joePatel = data.find(user => user.name === 'Joe Patel');
    if (joePatel) {
      log(`✅ Found Joe Patel: ${joePatel.email}`, 'success');
      log(`   • User ID: ${joePatel._id}`, 'info');
      log(`   • Team ID: ${joePatel.teamId || 'None'}`, 'info');
      log(`   • Hackathon IDs: ${joePatel.hackathonIds?.join(', ') || 'None'}`, 'info');
      log(`   • Role: ${joePatel.role}`, 'info');
      return joePatel;
    } else {
      log('❌ Joe Patel not found in the system', 'error');
      return null;
    }
  } else {
    log('❌ Failed to fetch users', 'error');
    return null;
  }
};

// Test 2: Test Joe Patel's login
const testJoeLogin = async (joePatel) => {
  log('Testing Joe Patel\'s login...');
  
  const { success, data, status } = await makeRequest('/users/verify-user', {
    method: 'POST',
    body: JSON.stringify({
      email: joePatel.email,
      password: 'password123'
    })
  });

  if (success) {
    log(`✅ Joe Patel can login successfully`, 'success');
    log(`   • Login response: ${data.message || 'Success'}`, 'info');
    return data.user;
  } else {
    log(`❌ Joe Patel cannot login: ${data.message} (Status: ${status})`, 'error');
    return null;
  }
};

// Test 3: Get Joe's hackathon details
const getJoeHackathon = async (joePatel) => {
  if (!joePatel.hackathonIds || joePatel.hackathonIds.length === 0) {
    log('❌ Joe Patel has no hackathons assigned', 'error');
    return null;
  }

  const hackathonId = joePatel.hackathonIds[0];
  log(`Getting hackathon details for: ${hackathonId}`);
  
  const { success, data } = await makeRequest(`/hackathons/${hackathonId}`);
  
  if (success) {
    log(`✅ Found hackathon: ${data.title}`, 'success');
    log(`   • Hackathon ID: ${data._id}`, 'info');
    log(`   • Start Date: ${data.startDate}`, 'info');
    log(`   • Team Size: ${data.minTeamSize}-${data.maxTeamSize}`, 'info');
    return data;
  } else {
    log(`❌ Failed to get hackathon details`, 'error');
    return null;
  }
};

// Test 4: Get teams for Joe's hackathon
const getHackathonTeams = async (hackathon) => {
  log(`Getting teams for hackathon: ${hackathon.title}`);
  
  const { success, data, status } = await makeRequest(`/team/hackathon/${hackathon._id}`);
  
  if (success) {
    log(`✅ Found ${data.count} teams for hackathon`, 'success');
    data.teams.forEach((team, index) => {
      log(`   Team ${index + 1}: ${team.teamName}`, 'info');
      log(`     • Team ID: ${team._id}`, 'info');
      log(`     • Leader: ${team.createdBy?.name || 'Unknown'}`, 'info');
      log(`     • Members: ${team.teamMembers?.length || 0}`, 'info');
      if (team.teamMembers?.length > 0) {
        team.teamMembers.forEach(member => {
          log(`       - ${member.name} (${member.role})`, 'info');
        });
      }
    });
    return data.teams;
  } else {
    log(`❌ Failed to get teams: ${data.message} (Status: ${status})`, 'error');
    return [];
  }
};

// Test 5: Find Joe's specific team
const findJoeTeam = async (teams, joePatel) => {
  log(`Looking for Joe Patel's team (Team ID: ${joePatel.teamId})`);
  
  const joeTeam = teams.find(team => team._id === joePatel.teamId);
  
  if (joeTeam) {
    log(`✅ Found Joe's team: ${joeTeam.teamName}`, 'success');
    log(`   • Team Leader: ${joeTeam.createdBy?.name || 'Unknown'}`, 'info');
    log(`   • Team Members (${joeTeam.teamMembers?.length || 0}):`, 'info');
    
    if (joeTeam.teamMembers?.length > 0) {
      joeTeam.teamMembers.forEach(member => {
        const isJoe = member.name === 'Joe Patel';
        log(`     ${isJoe ? '👤' : '•'} ${member.name} (${member.role})${isJoe ? ' ← JOE' : ''}`, 'info');
      });
    }
    
    // Check if Joe is actually in the team members
    const joeInTeam = joeTeam.teamMembers?.some(member => member.name === 'Joe Patel');
    if (joeInTeam) {
      log(`✅ Joe Patel is correctly listed as a team member`, 'success');
    } else {
      log(`❌ Joe Patel is NOT found in the team members list`, 'error');
    }
    
    return joeTeam;
  } else {
    log(`❌ Joe's team (ID: ${joePatel.teamId}) not found in hackathon teams`, 'error');
    return null;
  }
};

// Test 6: Test all teams endpoint
const testAllTeamsEndpoint = async () => {
  log('Testing the /team/get-teams endpoint...');
  
  const { success, data } = await makeRequest('/team/get-teams');
  
  if (success) {
    log(`✅ Found ${data.length} total teams in the system`, 'success');
    
    // Find teams that have Joe Patel
    const teamsWithJoe = data.filter(team => 
      team.teamMembers?.some(member => member.name === 'Joe Patel')
    );
    
    if (teamsWithJoe.length > 0) {
      log(`✅ Found ${teamsWithJoe.length} team(s) containing Joe Patel:`, 'success');
      teamsWithJoe.forEach(team => {
        log(`   • ${team.teamName} (${team._id})`, 'info');
      });
    } else {
      log(`⚠️ No teams found containing Joe Patel`, 'warning');
    }
    
    return data;
  } else {
    log(`❌ Failed to get all teams`, 'error');
    return [];
  }
};

// Test 7: Simulate frontend team fetching
const simulateFrontendTeamFetch = async (hackathon) => {
  log('Simulating frontend team fetching logic...');
  
  try {
    // Simulate the exact request the frontend makes
    const teamEndpoint = `${baseURL}/team/hackathon/${hackathon._id}`;
    console.log(`🔍 Frontend would fetch from: ${teamEndpoint}`);
    
    const response = await fetch(teamEndpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log(`📡 Response status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      log(`✅ Frontend simulation successful`, 'success');
      log(`   • Teams loaded: ${data.teams?.length || 0}`, 'info');
      log(`   • API message: ${data.message}`, 'info');
      return true;
    } else {
      const errorData = await response.json();
      log(`❌ Frontend simulation failed: ${errorData.message}`, 'error');
      return false;
    }
  } catch (error) {
    log(`❌ Frontend simulation error: ${error.message}`, 'error');
    return false;
  }
};

// Main test execution
const runComprehensiveTeamTest = async () => {
  try {
    log('🧪 COMPREHENSIVE TEAM TEST FOR JOE PATEL STARTED', 'info');
    log('=' * 60, 'info');

    // Test 1: Find Joe Patel
    const joePatel = await findJoePatel();
    if (!joePatel) {
      log('❌ Cannot continue without Joe Patel data', 'error');
      return;
    }

    // Test 2: Test login
    const loginResult = await testJoeLogin(joePatel);
    if (!loginResult) {
      log('⚠️ Login failed but continuing with team tests', 'warning');
    }

    // Test 3: Get hackathon
    const hackathon = await getJoeHackathon(joePatel);
    if (!hackathon) {
      log('❌ Cannot continue without hackathon data', 'error');
      return;
    }

    // Test 4: Get teams for hackathon
    const teams = await getHackathonTeams(hackathon);
    
    // Test 5: Find Joe's specific team
    if (joePatel.teamId) {
      const joeTeam = await findJoeTeam(teams, joePatel);
    } else {
      log('⚠️ Joe Patel has no team assigned', 'warning');
    }

    // Test 6: Test all teams endpoint
    await testAllTeamsEndpoint();

    // Test 7: Simulate frontend
    await simulateFrontendTeamFetch(hackathon);

    // Final summary
    log('\n📊 FINAL TEST SUMMARY', 'info');
    log('=' * 25, 'info');
    
    log(`✅ Joe Patel found: ${joePatel.name} (${joePatel.email})`, 'success');
    log(`✅ Hackathon found: ${hackathon.title}`, 'success');
    log(`✅ Teams in hackathon: ${teams.length}`, 'success');
    log(`${joePatel.teamId ? '✅' : '❌'} Joe has team assigned: ${joePatel.teamId || 'No'}`, joePatel.teamId ? 'success' : 'error');

    log('\n🎉 COMPREHENSIVE TEAM TEST COMPLETED!', 'success');
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
    console.error('Full error:', error);
  }
};

// Run the test
runComprehensiveTeamTest(); 