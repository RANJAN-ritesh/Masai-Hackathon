import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'https://masai-hackathon.onrender.com';

describe('Participant Management Test Suite', () => {
  let adminToken = null;
  let createdHackathonId = null;
  let testParticipants = [];

  // Setup: Login as admin and create test hackathon
  beforeAll(async () => {
    console.log('🔐 Setting up participant management tests...');
    
    try {
      // Login as admin
      const loginResponse = await axios.post(`${BASE_URL}/users/verify-user`, {
        email: 'admin@test.com',
        password: 'admin123'
      });
      
      if (loginResponse.status === 200) {
        adminToken = loginResponse.data.token;
        console.log('✅ Admin login successful');
      } else {
        throw new Error('Admin login failed');
      }

      // Create test hackathon
      const hackathonData = {
        title: "Participant Management Test Hackathon",
        description: "Test hackathon for participant management features",
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        eventType: "Team Hackathon",
        minTeamSize: 2,
        maxTeamSize: 4,
        status: "upcoming"
      };

      const hackathonResponse = await axios.post(`${BASE_URL}/hackathons`, hackathonData);
      if (hackathonResponse.status === 201) {
        createdHackathonId = hackathonResponse.data.hackathon._id;
        console.log('✅ Test hackathon created:', createdHackathonId);
      } else {
        throw new Error('Failed to create test hackathon');
      }

    } catch (error) {
      console.error('❌ Setup failed:', error.response?.data || error.message);
      throw error;
    }
  });

  describe('CSV Participant Upload', () => {
    test('Should upload new participants successfully', async () => {
      const participants = [
        {
          "First Name": "John",
          "Last Name": "Doe",
          "Email": "john.doe@test.com",
          "Phone": "+91-9876543210",
          "Course": "Computer Science",
          "Skills": "React, Node.js, Python",
          "Vertical": "Full Stack",
          "Role": "member"
        },
        {
          "First Name": "Jane",
          "Last Name": "Smith",
          "Email": "jane.smith@test.com",
          "Phone": "+91-9876543211",
          "Course": "Data Science",
          "Skills": "Python, Machine Learning, SQL",
          "Vertical": "Data Science",
          "Role": "leader"
        }
      ];

      const response = await axios.post(`${BASE_URL}/users/upload-participants`, {
        participants,
        hackathonId: createdHackathonId
      });

      expect(response.status).toBe(200);
      expect(response.data.uploadedCount).toBe(2);
      expect(response.data.existingCount).toBe(0);
      expect(response.data.summary.total).toBe(2);
      expect(response.data.summary.newUsers).toBe(2);
      
      console.log('✅ New participant upload test passed');
      testParticipants = participants;
    });

    test('Should handle existing users correctly', async () => {
      // Try to upload the same participants again
      const response = await axios.post(`${BASE_URL}/users/upload-participants`, {
        participants: testParticipants,
        hackathonId: createdHackathonId
      });

      expect(response.status).toBe(200);
      expect(response.data.uploadedCount).toBe(0); // No new users created
      expect(response.data.existingCount).toBe(2); // Both users already exist
      expect(response.data.summary.alreadyInHackathon).toBe(2); // Both already in hackathon
      
      console.log('✅ Existing user handling test passed');
    });

    test('Should add existing users to new hackathon', async () => {
      // Create another test hackathon
      const hackathon2Data = {
        title: "Second Test Hackathon",
        description: "Another test hackathon",
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString(),
        eventType: "Team Hackathon",
        minTeamSize: 2,
        maxTeamSize: 4,
        status: "upcoming"
      };

      const hackathon2Response = await axios.post(`${BASE_URL}/hackathons`, hackathon2Data);
      const hackathon2Id = hackathon2Response.data.hackathon._id;

      // Upload existing users to new hackathon
      const response = await axios.post(`${BASE_URL}/users/upload-participants`, {
        participants: testParticipants,
        hackathonId: hackathon2Id
      });

      expect(response.status).toBe(200);
      expect(response.data.uploadedCount).toBe(0); // No new users created
      expect(response.data.updatedCount).toBe(2); // Both users added to new hackathon
      
      console.log('✅ Cross-hackathon user addition test passed');

      // Clean up second hackathon
      await axios.delete(`${BASE_URL}/hackathons/${hackathon2Id}`);
    });
  });

  describe('Participant Retrieval', () => {
    test('Should retrieve participants for specific hackathon', async () => {
      const response = await axios.get(`${BASE_URL}/users/hackathon/${createdHackathonId}/participants`);
      
      expect(response.status).toBe(200);
      expect(response.data.participants).toBeDefined();
      expect(Array.isArray(response.data.participants)).toBe(true);
      expect(response.data.count).toBeGreaterThanOrEqual(2);
      
      // Verify participant data structure
      const participant = response.data.participants[0];
      expect(participant).toHaveProperty('name');
      expect(participant).toHaveProperty('email');
      expect(participant).toHaveProperty('role');
      expect(participant).toHaveProperty('hackathonIds');
      expect(Array.isArray(participant.hackathonIds)).toBe(true);
      expect(participant.hackathonIds).toContain(createdHackathonId);
      
      console.log('✅ Participant retrieval test passed');
      console.log(`👥 Found ${response.data.count} participants in hackathon`);
    });

    test('Should verify hackathon association in user data', async () => {
      const usersResponse = await axios.get(`${BASE_URL}/users/getAllUsers`);
      expect(usersResponse.status).toBe(200);
      
      const users = usersResponse.data;
      const hackathonParticipants = users.filter(user => 
        user.hackathonIds && user.hackathonIds.includes(createdHackathonId)
      );
      
      expect(hackathonParticipants.length).toBeGreaterThanOrEqual(2);
      
      // Verify each participant has correct hackathon association
      hackathonParticipants.forEach(participant => {
        expect(participant.hackathonIds).toBeDefined();
        expect(Array.isArray(participant.hackathonIds)).toBe(true);
        expect(participant.hackathonIds).toContain(createdHackathonId);
      });
      
      console.log('✅ Hackathon association verification test passed');
    });
  });

  describe('Error Handling', () => {
    test('Should handle invalid hackathon ID', async () => {
      try {
        await axios.post(`${BASE_URL}/users/upload-participants`, {
          participants: testParticipants,
          hackathonId: 'invalid-id'
        });
        throw new Error('Should have failed with invalid hackathon ID');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Valid hackathon ID is required');
        console.log('✅ Invalid hackathon ID handling test passed');
      }
    });

    test('Should handle missing participant data', async () => {
      try {
        await axios.post(`${BASE_URL}/users/upload-participants`, {
          participants: [],
          hackathonId: createdHackathonId
        });
        throw new Error('Should have failed with empty participants');
      } catch (error) {
        expect(error.response.status).toBe(400);
        expect(error.response.data.message).toContain('Invalid participants data');
        console.log('✅ Missing participant data handling test passed');
      }
    });

    test('Should handle participants with missing required fields', async () => {
      const invalidParticipants = [
        {
          "First Name": "Invalid",
          "Last Name": "User",
          // Missing email
          "Phone": "+91-9876543210",
          "Course": "Computer Science",
          "Skills": "React",
          "Vertical": "Tech",
          "Role": "member"
        }
      ];

      const response = await axios.post(`${BASE_URL}/users/upload-participants`, {
        participants: invalidParticipants,
        hackathonId: createdHackathonId
      });

      expect(response.status).toBe(200);
      expect(response.data.errorCount).toBeGreaterThan(0);
      expect(response.data.errors).toBeDefined();
      expect(response.data.errors.length).toBeGreaterThan(0);
      
      console.log('✅ Invalid participant data handling test passed');
    });
  });

  // Cleanup - Only clean up users, preserve hackathon for verification
  afterAll(async () => {
    console.log('\n🧹 Cleaning up participant management test data...');
    
    try {
      // Clean up test participants (optional - they can remain for verification)
      // This is commented out to preserve test data for manual verification
      // const usersResponse = await axios.get(`${BASE_URL}/users/getAllUsers`);
      // const testUsers = usersResponse.data.filter(user => 
      //   testParticipants.some(p => p.Email === user.email)
      // );
      // 
      // for (const user of testUsers) {
      //   await axios.delete(`${BASE_URL}/users/${user._id}`);
      // }
      
      console.log('⚠️ Test participants preserved for manual verification');
      console.log('⚠️ Test hackathon preserved for manual verification');
      console.log('🎯 Participant management tests completed successfully!');
      
    } catch (error) {
      console.log('⚠️ Cleanup failed (data preserved for verification):', error.message);
    }
  });
}); 