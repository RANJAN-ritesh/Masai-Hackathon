#!/usr/bin/env node

/**
 * Create Test Users for Submission Timing Test
 */

import fetch from 'node-fetch';

const BASE_URL = 'https://masai-hackathon.onrender.com';

const testUsers = [
  { 
    email: 'test1@example.com', 
    password: 'password123', 
    name: 'Test User 1',
    userId: 'test1',
    code: 'TEST001',
    course: 'Full Stack Development',
    skills: ['JavaScript', 'React', 'Node.js'],
    vertical: 'Technology'
  },
  { 
    email: 'test2@example.com', 
    password: 'password123', 
    name: 'Test User 2',
    userId: 'test2',
    code: 'TEST002',
    course: 'Full Stack Development',
    skills: ['JavaScript', 'React', 'Node.js'],
    vertical: 'Technology'
  },
  { 
    email: 'test3@example.com', 
    password: 'password123', 
    name: 'Test User 3',
    userId: 'test3',
    code: 'TEST003',
    course: 'Full Stack Development',
    skills: ['JavaScript', 'React', 'Node.js'],
    vertical: 'Technology'
  },
  { 
    email: 'test4@example.com', 
    password: 'password123', 
    name: 'Test User 4',
    userId: 'test4',
    code: 'TEST004',
    course: 'Full Stack Development',
    skills: ['JavaScript', 'React', 'Node.js'],
    vertical: 'Technology'
  }
];

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { response, data };
  } catch (error) {
    console.error('Request failed:', error.message);
    return { response: null, data: null, error };
  }
}

async function createUser(userData) {
  console.log(`👤 Creating user: ${userData.email}...`);
  
  const { response, data } = await makeRequest(`${BASE_URL}/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  
  if (response?.ok) {
    console.log(`✅ User created: ${userData.email}`);
    return true;
  } else {
    console.log(`❌ Failed to create user ${userData.email}:`, data?.message);
    return false;
  }
}

async function createTestUsers() {
  console.log('🚀 Creating Test Users for Submission Timing Test...\n');
  
  let successCount = 0;
  
  for (const user of testUsers) {
    const success = await createUser(user);
    if (success) successCount++;
  }
  
  console.log(`\n📊 Results: ${successCount}/${testUsers.length} users created successfully`);
  
  if (successCount === testUsers.length) {
    console.log('✅ All test users created successfully!');
    console.log('\n🔍 Test users created:');
    testUsers.forEach(user => {
      console.log(`   📧 ${user.email} / 🔑 ${user.password}`);
    });
  } else {
    console.log('⚠️ Some users may already exist or failed to create');
  }
}

createTestUsers();
