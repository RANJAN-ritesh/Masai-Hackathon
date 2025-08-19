#!/usr/bin/env node

/**
 * 🔍 TEAMS FEATURE ANALYSIS & VALIDATION
 * 
 * This script analyzes the current teams functionality and documents:
 * 1. Current behavior (what's working vs. what's broken)
 * 2. Expected behavior after fixes
 * 3. Test cases for validation
 * 4. Deployment requirements
 */

const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

// Utility functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const analyzeCurrentState = async () => {
  console.log('\n🔍 ANALYZING CURRENT TEAMS FUNCTIONALITY\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Check backend health
    log('Checking backend health...', 'info');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    log(`Backend is healthy: ${healthResponse.data.status}`, 'success');
    
    // 2. Get existing hackathons
    log('Fetching existing hackathons...', 'info');
    const hackathonsResponse = await axios.get(`${BASE_URL}/hackathons`);
    const hackathons = hackathonsResponse.data;
    log(`Found ${hackathons.length} hackathons`, 'success');
    
    // 3. Analyze each hackathon's teams
    for (const hackathon of hackathons.slice(0, 3)) { // Analyze first 3
      log(`\n📊 Analyzing hackathon: ${hackathon.title}`, 'info');
      
      // Get teams for this hackathon
      const teamsResponse = await axios.get(`${BASE_URL}/team/hackathon/${hackathon._id}`);
      const teams = teamsResponse.data.teams;
      
      log(`   Found ${teams.length} teams`, 'info');
      
      // Analyze each team
      teams.forEach((team, index) => {
        const memberCount = team.teamMembers?.length || 0;
        const hasLeader = !!team.createdBy;
        const expectedSize = team.memberLimit || 4;
        
        log(`   Team ${index + 1}: ${team.teamName}`, 'info');
        log(`     Members: ${memberCount}/${expectedSize}`, memberCount === expectedSize ? 'success' : 'error');
        log(`     Has Leader: ${hasLeader}`, hasLeader ? 'success' : 'error');
        log(`     Hackathon ID: ${team.hackathonId === hackathon._id ? '✅' : '❌'}`);
        
        if (memberCount !== expectedSize) {
          log(`     ⚠️  ISSUE: Team should have ${expectedSize} members but only has ${memberCount}`, 'error');
        }
      });
    }
    
    // 4. Test team creation with current backend
    log('\n🧪 Testing team creation with current backend...', 'info');
    const testHackathon = hackathons[0];
    const participantsResponse = await axios.get(`${BASE_URL}/users/hackathon/${testHackathon._id}/participants`);
    const participants = participantsResponse.data.participants;
    
    if (participants.length >= 4) {
      log(`Found ${participants.length} participants for testing`, 'success');
      
      // Create a test team
      const teamData = {
        teamName: `Analysis Test Team ${Date.now()}`,
        createdBy: participants[0]._id,
        hackathonId: testHackathon._id,
        memberLimit: 4,
        teamMembers: participants.slice(0, 4).map(p => p._id),
        description: "Testing current backend behavior"
      };
      
      const teamResponse = await axios.post(`${BASE_URL}/team/create-team`, teamData);
      const newTeam = teamResponse.data;
      
      log(`Created test team: ${newTeam._id}`, 'success');
      
      // Analyze the created team
      const createdTeamResponse = await axios.get(`${BASE_URL}/team/hackathon/${testHackathon._id}`);
      const createdTeams = createdTeamResponse.data.teams;
      const createdTeam = createdTeams.find(t => t._id === newTeam._id);
      
      if (createdTeam) {
        const actualMemberCount = createdTeam.teamMembers?.length || 0;
        const expectedMemberCount = 4;
        
        log(`   Expected members: ${expectedMemberCount}`, 'info');
        log(`   Actual members: ${actualMemberCount}`, actualMemberCount === expectedMemberCount ? 'success' : 'error');
        
        if (actualMemberCount !== expectedMemberCount) {
          log(`   ❌ CRITICAL ISSUE: Backend fix not deployed!`, 'error');
          log(`   Current backend only creates teams with 1 member instead of ${expectedMemberCount}`, 'error');
        } else {
          log(`   ✅ Backend fix is working correctly!`, 'success');
        }
      }
      
      // Cleanup test team
      try {
        await axios.post(`${BASE_URL}/team/delete-team`, { teamId: newTeam._id });
        log('Cleaned up test team', 'success');
      } catch (error) {
        log(`Failed to cleanup test team: ${error.message}`, 'error');
      }
    } else {
      log(`Not enough participants (${participants.length}) for testing`, 'error');
    }
    
  } catch (error) {
    log(`Analysis error: ${error.message}`, 'error');
  }
};

const documentExpectedBehavior = () => {
  console.log('\n📋 EXPECTED BEHAVIOR AFTER FIXES\n');
  console.log('='.repeat(60));
  
  console.log('🎯 TEAM CREATION:');
  console.log('   ✅ Upload CSV with 8 participants');
  console.log('   ✅ Click "Create Teams"');
  console.log('   ✅ System creates 2 teams of 4 members each');
  console.log('   ✅ Each team has proper leader and member distribution');
  
  console.log('\n🎯 TEAM DISPLAY:');
  console.log('   ✅ Click "Teams" button');
  console.log('   ✅ Modal shows all teams with proper hierarchy');
  console.log('   ✅ Team Leader section (highlighted)');
  console.log('   ✅ All Members section (4 members per team)');
  console.log('   ✅ CSV export functionality');
  
  console.log('\n🎯 DATA INTEGRITY:');
  console.log('   ✅ Each team has exactly 4 members');
  console.log('   ✅ Team leader is properly assigned');
  console.log('   ✅ All members have correct teamId');
  console.log('   ✅ Hackathon association is maintained');
  
  console.log('\n🎯 CSV EXPORT:');
  console.log('   ✅ Individual team export (4 rows per team)');
  console.log('   ✅ All teams export (8 rows total)');
  console.log('   ✅ Proper CSV format with headers');
  console.log('   ✅ Leader listed first, then members');
};

const deploymentRequirements = () => {
  console.log('\n🚀 DEPLOYMENT REQUIREMENTS\n');
  console.log('='.repeat(60));
  
  console.log('🔧 BACKEND FIXES REQUIRED:');
  console.log('   ✅ Team creation includes all teamMembers (not just createdBy)');
  console.log('   ✅ All team members get teamId updated');
  console.log('   ✅ Team leader role assignment');
  console.log('   ✅ Proper validation of team member IDs');
  
  console.log('\n🔧 FRONTEND FIXES REQUIRED:');
  console.log('   ✅ Teams modal UI redesign (COMPLETED)');
  console.log('   ✅ CSV export functionality (COMPLETED)');
  console.log('   ✅ Proper team hierarchy display (COMPLETED)');
  
  console.log('\n🔧 DEPLOYMENT STEPS:');
  console.log('   1. ✅ Fixes implemented in devOn branch');
  console.log('   2. ✅ Frontend UI redesigned and tested');
  console.log('   3. ⏳ Backend fixes need production deployment');
  console.log('   4. ⏳ Comprehensive testing with production backend');
  console.log('   5. ⏳ Move to main branch after validation');
  
  console.log('\n🔧 TESTING CHECKLIST:');
  console.log('   ⏳ CSV upload with 8 participants');
  console.log('   ⏳ Team creation (should create 2 teams of 4)');
  console.log('   ⏳ Team display (should show all members)');
  console.log('   ⏳ CSV export (should export all data)');
  console.log('   ⏳ Data integrity (teams should have 4 members)');
};

// Main execution
const main = async () => {
  try {
    await analyzeCurrentState();
    documentExpectedBehavior();
    deploymentRequirements();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 ANALYSIS COMPLETE');
    console.log('='.repeat(60));
    console.log('Next steps:');
    console.log('1. Deploy backend fixes to production');
    console.log('2. Run comprehensive testing');
    console.log('3. Validate all functionality works');
    console.log('4. Move to main branch');
    
  } catch (error) {
    log(`Main execution error: ${error.message}`, 'error');
  }
};

if (require.main === module) {
  main();
}

module.exports = { analyzeCurrentState, documentExpectedBehavior, deploymentRequirements }; 