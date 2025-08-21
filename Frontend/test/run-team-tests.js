#!/usr/bin/env node

/**
 * 🚀 TEAM SYSTEM TEST RUNNER
 * 
 * Simple script to run the comprehensive team system tests
 */

const { runTests } = require('./team-system-comprehensive-test.js');

console.log('🚀 Starting Team System Tests...');
console.log('='.repeat(50));

runTests().then(() => {
  console.log('🎉 Test execution completed!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Test execution failed:', error);
  process.exit(1);
}); 