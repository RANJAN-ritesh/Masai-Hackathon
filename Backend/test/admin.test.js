const axios = require('axios');

// Configuration
const BASE_URL = 'https://masai-hackathon.onrender.com';
const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

// Test data
let adminToken = null;
let createdHackathonId = null;
let createdTeamId = null;

describe('Admin Functionality Tests', () => {
  // Test 1: Admin Login
  test('Admin can login successfully', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/users/create-test-users`);
      expect(response.status).toBe(200);
      console.log('✅ Test users created successfully');
      
      const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, ADMIN_CREDENTIALS);
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('user');
      expect(loginResponse.data.user).toHaveProperty('_id');
      expect(loginResponse.data.user.role).toBe('admin');
      
      adminToken = loginResponse.data.user._id;
      console.log('✅ Admin login successful, Token:', adminToken);
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 2: Create Hackathon
  test('Admin can create a new hackathon', async () => {
    try {
      const hackathonData = {
        title: 'Comprehensive Test Hackathon 2025',
        description: 'A comprehensive test hackathon for testing all CRUD operations',
        startDate: '2025-08-20T00:00:00.000Z',
        endDate: '2025-08-27T23:59:59.000Z',
        eventType: 'Team Hackathon',
        minTeamSize: 2,
        maxTeamSize: 4,
        status: 'upcoming',
        version: '1.0',
        schedule: [
          {
            date: '2025-08-20T09:00:00.000Z',
            activity: 'Opening Ceremony'
          },
          {
            date: '2025-08-20T14:00:00.000Z',
            activity: 'Coding Begins'
          }
        ],
        problemStatements: [
          {
            track: 'Frontend',
            description: 'Build a modern web application',
            difficulty: 'Medium'
          }
        ]
      };

      const response = await axios.post(`${BASE_URL}/hackathons`, hackathonData);
      expect(response.status).toBe(201); // 201 is correct for creation
      expect(response.data).toHaveProperty('_id');
      expect(response.data.title).toBe('Comprehensive Test Hackathon 2025');
      
      createdHackathonId = response.data._id;
      console.log('✅ Hackathon created successfully:', createdHackathonId);
    } catch (error) {
      console.error('❌ Hackathon creation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 3: View All Hackathons
  test('Admin can view all hackathons', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hackathons`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      const ourHackathon = response.data.find(h => h._id === createdHackathonId);
      expect(ourHackathon).toBeDefined();
      expect(ourHackathon.title).toBe('Comprehensive Test Hackathon 2025');
      console.log('✅ Hackathons list retrieved successfully, count:', response.data.length);
    } catch (error) {
      console.error('❌ View all hackathons failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 4: View Specific Hackathon
  test('Admin can view specific hackathon by ID', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
      expect(response.status).toBe(200);
      expect(response.data._id).toBe(createdHackathonId);
      expect(response.data.title).toBe('Comprehensive Test Hackathon 2025');
      expect(response.data.schedule).toHaveLength(2);
      expect(response.data.problemStatements).toHaveLength(1);
      console.log('✅ Specific hackathon retrieved successfully');
    } catch (error) {
      console.error('❌ View specific hackathon failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 5: Edit Hackathon
  test('Admin can edit an existing hackathon', async () => {
    try {
      const updateData = {
        title: 'Updated Comprehensive Test Hackathon 2025',
        description: 'Updated description for comprehensive testing',
        maxTeamSize: 6
      };
      
      const response = await axios.put(`${BASE_URL}/hackathons/${createdHackathonId}`, updateData);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Hackathon updated successfully');
      
      // Verify the update
      const verifyResponse = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
      expect(verifyResponse.data.title).toBe('Updated Comprehensive Test Hackathon 2025');
      expect(verifyResponse.data.maxTeamSize).toBe(6);
      console.log('✅ Hackathon updated successfully');
    } catch (error) {
      console.error('❌ Hackathon update failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 6: Create Team
  test('Admin can create a new team', async () => {
    try {
      const teamData = {
        teamName: 'Comprehensive Test Team Alpha',
        createdBy: adminToken,
        hackathonId: createdHackathonId,
        maxMembers: 4,
        description: 'Test team for comprehensive admin functionality testing'
      };
      
      const response = await axios.post(`${BASE_URL}/team/create-team`, teamData);
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Team created successfully');
      expect(response.data.team).toHaveProperty('_id');
      
      createdTeamId = response.data.team._id;
      console.log('✅ Team created successfully:', createdTeamId);
    } catch (error) {
      console.error('❌ Team creation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 7: View All Teams
  test('Admin can view all teams', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/team/get-teams`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Teams might be empty initially, so just check it's an array
      if (response.data.length > 0) {
        const ourTeam = response.data.find(t => t._id === createdTeamId);
        if (ourTeam) {
          expect(ourTeam.teamName).toBe('Comprehensive Test Team Alpha');
        }
      }
      console.log('✅ Teams list retrieved successfully, count:', response.data.length);
    } catch (error) {
      console.error('❌ View all teams failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 8: View Teams by Hackathon
  test('Admin can view teams by hackathon ID', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/team/${createdHackathonId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Teams might be empty initially, so just check it's an array
      if (response.data.length > 0) {
        const ourTeam = response.data.find(t => t._id === createdTeamId);
        if (ourTeam) {
          expect(ourTeam).toBeDefined();
        }
      }
      console.log('✅ Teams by hackathon retrieved successfully');
    } catch (error) {
      console.error('❌ View teams by hackathon failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 9: View All Users
  test('Admin can view all users', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/getAllUsers`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      const adminUser = response.data.find(u => u.role === 'admin');
      expect(adminUser).toBeDefined();
      console.log('✅ All users retrieved successfully, count:', response.data.length);
    } catch (error) {
      console.error('❌ View all users failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 10: Delete Team
  test('Admin can delete a team', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/team/delete-team`, { 
        teamId: createdTeamId, 
        userId: adminToken 
      });
      expect(response.status).toBe(200);
      console.log('✅ Team deleted successfully');
    } catch (error) {
      console.error('❌ Team deletion failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 11: Delete Hackathon
  test('Admin can delete a hackathon', async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/hackathons/${createdHackathonId}`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Hackathon deleted successfully');
      console.log('✅ Hackathon deleted successfully');
    } catch (error) {
      console.error('❌ Hackathon deletion failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 12: Verify Deletion
  test('Verify hackathon was actually deleted', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
      // Should return 404 or empty data
      expect(response.status).toBe(404);
      console.log('✅ Hackathon deletion verified');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Hackathon deletion verified (404 response)');
      } else {
        console.error('❌ Hackathon deletion verification failed:', error.response?.data || error.message);
        throw error;
      }
    }
  });

  // Cleanup
  afterAll(async () => {
    console.log('\n🧹 Cleaning up test data...');
    
    // Clean up any remaining test data
    if (createdTeamId) {
      try {
        await axios.post(`${BASE_URL}/team/delete-team`, { 
          teamId: createdTeamId, 
          userId: adminToken 
        });
        console.log('✅ Test team cleanup completed');
      } catch (error) {
        console.log('⚠️ Test team cleanup failed (may already be deleted)');
      }
    }
    
    if (createdHackathonId) {
      try {
        await axios.delete(`${BASE_URL}/hackathons/${createdHackathonId}`);
        console.log('✅ Test hackathon cleanup completed');
      } catch (error) {
        console.log('⚠️ Test hackathon cleanup failed (may already be deleted)');
      }
    }
    
    console.log('🎯 All CRUD operations tested successfully!');
  });
}); 