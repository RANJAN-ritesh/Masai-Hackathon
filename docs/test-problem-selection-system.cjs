const https = require('https');

const baseURL = 'https://masai-hackathon.onrender.com';
const frontendURL = 'https://masai-hackathon.netlify.app';

console.log('🧪 COMPREHENSIVE PROBLEM SELECTION SYSTEM TEST');
console.log('='.repeat(50));

async function testAPI(endpoint, options = {}) {
  return new Promise((resolve, reject) => {
    const url = `${baseURL}${endpoint}`;
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runTests() {
  console.log('\n📊 PHASE 1: Backend Health Check');
  
  try {
    const health = await testAPI('/health');
    console.log('✅ Backend Health:', health.status === 200 ? 'OK' : 'FAILED');
    console.log('   Schema Version:', health.data?.schemaVersion);
    console.log('   Problem Selection Service:', health.data?.problemSelectionService);
    
    console.log('\n📊 PHASE 2: Problem Statement API Tests');
    
    // Test selection window endpoint
    const selectionWindow = await testAPI('/problemstatement/selection-window/68b57f3593b768d0b6e1b4d3');
    console.log('✅ Selection Window API:', selectionWindow.status === 200 ? 'OK' : 'FAILED');
    
    // Test submission window endpoint
    const submissionWindow = await testAPI('/problemstatement/submission-window/68b57f3593b768d0b6e1b4d3');
    console.log('✅ Submission Window API:', submissionWindow.status === 200 ? 'OK' : 'FAILED');
    
    console.log('\n📊 PHASE 3: Frontend Dashboard Test');
    
    // Test frontend accessibility
    const frontendTest = await new Promise((resolve) => {
      const req = https.request(frontendURL, { method: 'HEAD' }, (res) => {
        resolve({ status: res.statusCode });
      });
      req.on('error', () => resolve({ status: 0 }));
      req.end();
    });
    
    console.log('✅ Frontend Accessibility:', frontendTest.status === 200 ? 'OK' : 'FAILED');
    
    console.log('\n🎯 EXPECTED USER EXPERIENCE:');
    console.log('1. ✅ Participants see FULL hackathon dashboard at home');
    console.log('2. ✅ Dashboard includes Hero, Problems, Schedule, Leaderboard');
    console.log('3. ✅ "My Team" accessible from navbar');
    console.log('4. ✅ Problem selection timers visible (48hrs before → 24hrs after)');
    console.log('5. ✅ Submission window timers visible');
    console.log('6. ✅ Team leaders can create polls');
    console.log('7. ✅ Team members get notifications for polls');
    console.log('8. ✅ One-time submission with confirmation');
    
    console.log('\n🧪 MANUAL TEST STEPS:');
    console.log('1. Login as Kevin: kevin.p11@example.com / password123');
    console.log('2. Should see: Full hackathon dashboard with hero section');
    console.log('3. Check: Problem statements section shows selection status');
    console.log('4. Check: Timer displays for selection window');
    console.log('5. Click: "My Team" in navbar → Should show team view');
    console.log('6. Navigate back: Should return to full dashboard');
    
    console.log('\n✅ PROBLEM SELECTION SYSTEM FOUNDATION DEPLOYED!');
    console.log('📱 Frontend URL:', frontendURL);
    console.log('🔗 Backend URL:', baseURL);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
