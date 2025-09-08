// Debug authentication issues
const axios = require('axios');

const BASE_URL = 'https://masai-hackathon.onrender.com';

async function debugAuthentication() {
  console.log('🔍 DEBUGGING AUTHENTICATION ISSUES...\n');
  
  // Test 1: Check user creation endpoint
  console.log('1️⃣ Testing user creation...');
  try {
    const response = await axios.post(`${BASE_URL}/users/create-user`, {
      name: 'Debug User',
      email: 'debug@example.com',
      password: 'password123',
      phoneNumber: '1234567890',
      course: 'Full Stack',
      skills: ['JavaScript'],
      vertical: 'Web Development'
    });
    console.log('✅ User creation successful:', response.status);
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ User creation failed:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
  
  // Test 2: Check existing user login
  console.log('\n2️⃣ Testing existing user login...');
  try {
    const response = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'aaron.miller1@example.com',
      password: 'password123'
    });
    console.log('✅ Login successful:', response.status);
    console.log('Token length:', response.data.token?.length);
    console.log('User data:', response.data.user);
  } catch (error) {
    console.log('❌ Login failed:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
  
  // Test 3: Check Bianca login
  console.log('\n3️⃣ Testing Bianca login...');
  try {
    const response = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'bianca.rod2@example.com',
      password: 'password123'
    });
    console.log('✅ Bianca login successful:', response.status);
    console.log('Token length:', response.data.token?.length);
    console.log('User data:', response.data.user);
  } catch (error) {
    console.log('❌ Bianca login failed:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
  
  // Test 4: Check William login
  console.log('\n4️⃣ Testing William login...');
  try {
    const response = await axios.post(`${BASE_URL}/users/verify-user`, {
      email: 'william.okafor@example.com',
      password: 'password123'
    });
    console.log('✅ William login successful:', response.status);
    console.log('Token length:', response.data.token?.length);
    console.log('User data:', response.data.user);
  } catch (error) {
    console.log('❌ William login failed:', error.response?.status);
    console.log('Error:', error.response?.data);
  }
}

debugAuthentication().catch(console.error);
