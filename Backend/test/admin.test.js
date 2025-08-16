const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';
const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123'
};

let adminToken = null;
let createdHackathonId = null;
let createdTeamId = null;

describe('Admin Functionality Tests', () => {
  
  // Test 1: Admin Login
  test('Admin can login successfully', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/users/verify-user`, ADMIN_CREDENTIALS);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Login Successful');
      expect(response.data.user.role).toBe('admin');
      
      // Store user data for subsequent tests
      adminToken = response.data.user._id;
      console.log('✅ Admin login successful');
    } catch (error) {
      console.error('❌ Admin login failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 2: Admin can create hackathon
  test('Admin can create a new hackathon', async () => {
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
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Hackathon created successfully');
      expect(response.data.hackathon.title).toBe(hackathonData.title);
      
      createdHackathonId = response.data.hackathon._id;
      console.log('✅ Hackathon created successfully:', createdHackathonId);
    } catch (error) {
      console.error('❌ Hackathon creation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 3: Admin can view all hackathons
  test('Admin can view all hackathons', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hackathons`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      
      // Check if our created hackathon is in the list
      const ourHackathon = response.data.find(h => h._id === createdHackathonId);
      expect(ourHackathon).toBeDefined();
      expect(ourHackathon.title).toBe('Test Hackathon 2025');
      
      console.log('✅ Hackathons list retrieved successfully');
    } catch (error) {
      console.error('❌ Hackathons list retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 4: Admin can view specific hackathon
  test('Admin can view specific hackathon by ID', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
      expect(response.status).toBe(200);
      expect(response.data._id).toBe(createdHackathonId);
      expect(response.data.title).toBe('Test Hackathon 2025');
      
      console.log('✅ Specific hackathon retrieved successfully');
    } catch (error) {
      console.error('❌ Specific hackathon retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 5: Admin can edit hackathon
  test('Admin can edit an existing hackathon', async () => {
    try {
      const updateData = {
        title: 'Updated Test Hackathon 2025',
        description: 'Updated description for admin testing',
        status: 'active'
      };

      const response = await axios.put(`${BASE_URL}/hackathons/${createdHackathonId}`, updateData);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Hackathon updated successfully');
      
      // Verify the update
      const getResponse = await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
      expect(getResponse.data.title).toBe(updateData.title);
      expect(getResponse.data.description).toBe(updateData.description);
      expect(getResponse.data.status).toBe(updateData.status);
      
      console.log('✅ Hackathon updated successfully');
    } catch (error) {
      console.error('❌ Hackathon update failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 6: Admin can create a team
  test('Admin can create a new team', async () => {
    try {
      const teamData = {
        teamName: 'Test Team Alpha',
        hackathonId: createdHackathonId,
        maxMembers: 4,
        description: 'A test team created by admin'
      };

      const response = await axios.post(`${BASE_URL}/team/create-team`, teamData);
      expect(response.status).toBe(201);
      expect(response.data.message).toBe('Team created successfully');
      
      createdTeamId = response.data.team._id;
      console.log('✅ Team created successfully:', createdTeamId);
    } catch (error) {
      console.error('❌ Team creation failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 7: Admin can view all teams
  test('Admin can view all teams', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/team/get-teams`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Check if our created team is in the list
      const ourTeam = response.data.find(t => t._id === createdTeamId);
      expect(ourTeam).toBeDefined();
      expect(ourTeam.teamName).toBe('Test Team Alpha');
      
      console.log('✅ Teams list retrieved successfully');
    } catch (error) {
      console.error('❌ Teams list retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 8: Admin can view teams by hackathon
  test('Admin can view teams by hackathon ID', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/team/${createdHackathonId}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Should find our team in this hackathon
      const ourTeam = response.data.find(t => t._id === createdTeamId);
      expect(ourTeam).toBeDefined();
      
      console.log('✅ Teams by hackathon retrieved successfully');
    } catch (error) {
      console.error('❌ Teams by hackathon retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 9: Admin can delete a team
  test('Admin can delete a team', async () => {
    try {
      const response = await axios.post(`${BASE_URL}/team/delete-team`, {
        teamId: createdTeamId
      });
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Team deleted successfully');
      
      console.log('✅ Team deleted successfully');
    } catch (error) {
      console.error('❌ Team deletion failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 10: Admin can delete a hackathon
  test('Admin can delete a hackathon', async () => {
    try {
      const response = await axios.delete(`${BASE_URL}/hackathons/${createdHackathonId}`);
      expect(response.status).toBe(200);
      expect(response.data.message).toBe('Hackathon deleted successfully');
      
      // Verify deletion
      try {
        await axios.get(`${BASE_URL}/hackathons/${createdHackathonId}`);
        throw new Error('Hackathon should not exist after deletion');
      } catch (getError) {
        expect(getError.response.status).toBe(404);
      }
      
      console.log('✅ Hackathon deleted successfully');
    } catch (error) {
      console.error('❌ Hackathon deletion failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 11: Admin can manage team requests
  test('Admin can view and manage team requests', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/team-request/get-requests`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      console.log('✅ Team requests retrieved successfully');
    } catch (error) {
      console.error('❌ Team requests retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Test 12: Admin can view all users
  test('Admin can view all users in the system', async () => {
    try {
      const response = await axios.get(`${BASE_URL}/users/getAllUsers`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      
      // Should find our admin user
      const adminUser = response.data.find(u => u.email === 'admin@test.com');
      expect(adminUser).toBeDefined();
      expect(adminUser.role).toBe('admin');
      
      console.log('✅ Users list retrieved successfully');
    } catch (error) {
      console.error('❌ Users list retrieval failed:', error.response?.data || error.message);
      throw error;
    }
  });
});

// Cleanup function to run after all tests
afterAll(async () => {
  console.log('\n🧹 Cleaning up test data...');
  
  // Clean up any remaining test data
  if (createdTeamId) {
    try {
      await axios.post(`${BASE_URL}/team/delete-team`, { teamId: createdTeamId });
      console.log('✅ Test team cleaned up');
    } catch (error) {
      console.log('⚠️ Test team cleanup failed:', error.message);
    }
  }
  
  if (createdHackathonId) {
    try {
      await axios.delete(`${BASE_URL}/hackathons/${createdHackathonId}`);
      console.log('✅ Test hackathon cleaned up');
    } catch (error) {
      console.log('⚠️ Test hackathon cleanup failed:', error.message);
    }
  }
  
  console.log('🎉 All tests completed!');
}); 