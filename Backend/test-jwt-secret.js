// Test JWT token generation and verification
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

console.log('🔍 Testing JWT Secret...\n');

// Test 1: Generate a token
console.log('1️⃣ Generating test token...');
const testPayload = {
  userId: '68bab8efb39a4862bdd23bb0',
  email: 'test@example.com',
  role: 'leader',
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
};

const testToken = jwt.sign(testPayload, JWT_SECRET);
console.log('✅ Token generated:', testToken.substring(0, 50) + '...');

// Test 2: Verify the token
console.log('\n2️⃣ Verifying test token...');
try {
  const decoded = jwt.verify(testToken, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('   UserId:', decoded.userId);
  console.log('   Email:', decoded.email);
  console.log('   Role:', decoded.role);
  console.log('   Exp:', new Date(decoded.exp * 1000));
} catch (error) {
  console.log('❌ Token verification failed:', error.message);
}

// Test 3: Test with wrong secret
console.log('\n3️⃣ Testing with wrong secret...');
try {
  const decoded = jwt.verify(testToken, 'wrong-secret');
  console.log('❌ Unexpected success with wrong secret');
} catch (error) {
  console.log('✅ Correctly failed with wrong secret:', error.message);
}

console.log('\n📊 JWT Secret test completed!');
