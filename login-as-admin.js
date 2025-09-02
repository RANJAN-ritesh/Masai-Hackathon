#!/usr/bin/env node

// Simple script to test login and get admin user ID for browser testing

const baseURL = 'https://masai-hackathon.onrender.com';

const loginAsAdmin = async () => {
  try {
    console.log('🔐 Attempting to log in as admin...');
    
    const response = await fetch(`${baseURL}/users/verify-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Login failed:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ Login successful!');
    console.log('👤 User data:', { 
      _id: data.user._id,
      name: data.user.name,
      email: data.user.email,
      role: data.user.role,
      isVerified: data.user.isVerified
    });
    
    console.log('\n📋 To use in browser:');
    console.log(`localStorage.setItem("userId", "${data.user._id}");`);
    console.log(`localStorage.setItem("userData", '${JSON.stringify(data.user)}');`);
    
  } catch (error) {
    console.error('❌ Error during login:', error);
  }
};

loginAsAdmin();
