const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

console.log('🎯 CHECKING AVAILABLE USERS AND CREATING TEST USERS\n');

async function checkExistingUsers() {
  console.log('🔍 Checking existing users...');
  try {
    const response = await axios.get(`${BASE_URL}/users/getAllUsers`);
    const users = response.data;
    console.log(`✅ Found ${users.length} existing users:`);
    users.slice(0, 10).forEach(user => {
      console.log(`   ${user.name} (${user.email}) - Role: ${user.role}`);
    });
    return users;
  } catch (error) {
    console.log('❌ Failed to get users:', error.response?.data?.message || error.message);
    return [];
  }
}

async function createTestUser(email, name, role = 'participant') {
  console.log(`\n👤 Creating test user: ${name} (${email})`);
  try {
    const response = await axios.post(`${BASE_URL}/users/create-user`, {
      name,
      email,
      password: 'password123',
      role,
      course: 'Computer Science',
      year: 2024
    });
    
    console.log(`✅ Created user: ${name}`);
    return response.data.user;
  } catch (error) {
    if (error.response?.status === 409) {
      console.log(`ℹ️ User ${name} already exists`);
      return null;
    } else {
      console.log(`❌ Failed to create user ${name}:`, error.response?.data?.message || error.message);
      return null;
    }
  }
}

async function loginUser(email, password) {
  console.log(`\n🔐 Logging in: ${email}`);
  try {
    const response = await axios.post(`${BASE_URL}/users/verify-user`, {
      email,
      password
    });
    
    console.log(`✅ Login successful for ${email}`);
    return response.data.token;
  } catch (error) {
    console.log(`❌ Login failed for ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function setupTestUsers() {
  console.log('🚀 SETTING UP TEST USERS\n');
  
  // Check existing users
  const existingUsers = await checkExistingUsers();
  
  // Create test users
  const testUsers = [
    { email: 'umair.h1@example.com', name: 'Umair Hassan', role: 'participant' },
    { email: 'valerie.m2@example.com', name: 'Valerie McCarthy', role: 'participant' },
    { email: 'admin@example.com', name: 'Test Admin', role: 'admin' }
  ];
  
  for (const user of testUsers) {
    await createTestUser(user.email, user.name, user.role);
  }
  
  // Test login for each user
  const tokens = {};
  for (const user of testUsers) {
    const token = await loginUser(user.email, 'password123');
    if (token) {
      tokens[user.email] = token;
    }
  }
  
  console.log('\n📊 TEST USER SETUP SUMMARY:');
  console.log(`   Total existing users: ${existingUsers.length}`);
  console.log(`   Test users created: ${testUsers.length}`);
  console.log(`   Successful logins: ${Object.keys(tokens).length}`);
  
  return tokens;
}

// Run the setup
setupTestUsers().catch(console.error);
