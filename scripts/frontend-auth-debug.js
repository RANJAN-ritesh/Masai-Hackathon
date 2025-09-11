// FRONTEND AUTHENTICATION DEBUG SCRIPT
// Run this in the browser console to check what's stored in localStorage

console.log('🔍 FRONTEND AUTHENTICATION DEBUG');
console.log('================================');

// Check what's stored in localStorage
console.log('📋 localStorage contents:');
console.log('authToken:', localStorage.getItem('authToken'));
console.log('userId:', localStorage.getItem('userId'));
console.log('userData:', localStorage.getItem('userData'));

// Check if authToken exists and is a JWT
const authToken = localStorage.getItem('authToken');
if (authToken) {
  console.log('✅ authToken found:', authToken.substring(0, 20) + '...');
  
  // Try to decode JWT (basic check)
  try {
    const parts = authToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      console.log('🔍 JWT payload:', payload);
      console.log('📅 Token expires:', new Date(payload.exp * 1000));
      console.log('👤 User ID in token:', payload.userId);
    } else {
      console.log('❌ authToken is not a valid JWT format');
    }
  } catch (error) {
    console.log('❌ Error decoding JWT:', error.message);
  }
} else {
  console.log('❌ No authToken found in localStorage');
}

// Check userId
const userId = localStorage.getItem('userId');
if (userId) {
  console.log('✅ userId found:', userId);
} else {
  console.log('❌ No userId found in localStorage');
}

// Check userData
const userData = localStorage.getItem('userData');
if (userData) {
  try {
    const parsed = JSON.parse(userData);
    console.log('✅ userData found:', parsed.name, parsed.email);
  } catch (error) {
    console.log('❌ Error parsing userData:', error.message);
  }
} else {
  console.log('❌ No userData found in localStorage');
}

console.log('================================');
console.log('🎯 RECOMMENDATION:');
if (authToken && authToken.includes('.')) {
  console.log('✅ You have a JWT token - team creation should work!');
} else if (userId) {
  console.log('⚠️  You only have userId - this might cause 401 errors');
  console.log('💡 Try logging out and logging back in to get a fresh JWT token');
} else {
  console.log('❌ No authentication data found - please log in');
}
