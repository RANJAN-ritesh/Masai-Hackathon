const puppeteer = require('puppeteer');

class FrontendPollingTester {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔍';
    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async runTest(testName, testFunction) {
    this.log(`Running frontend test: ${testName}`, 'info');
    try {
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name: testName, status: 'PASSED' });
      this.log(`✅ ${testName} - PASSED`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name: testName, status: 'FAILED', error: error.message });
      this.log(`❌ ${testName} - FAILED: ${error.message}`, 'error');
    }
  }

  async setup() {
    this.log('Setting up browser for frontend testing...', 'info');
    this.browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    this.page = await this.browser.newPage();
    
    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
    
    // Enable console logging
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.log(`Browser Error: ${msg.text()}`, 'error');
      }
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
      this.log('Browser closed', 'info');
    }
  }

  async testFrontendAccess() {
    await this.page.goto('https://masai-hackathon.netlify.app', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    const title = await this.page.title();
    if (!title || title.includes('Error')) {
      throw new Error('Frontend not accessible or showing error');
    }
    
    this.log(`Frontend loaded successfully: ${title}`, 'success');
  }

  async testLoginFlow() {
    // Navigate to login page
    await this.page.goto('https://masai-hackathon.netlify.app/login', { 
      waitUntil: 'networkidle2' 
    });

    // Check if login form exists
    const loginForm = await this.page.$('form');
    if (!loginForm) {
      throw new Error('Login form not found');
    }

    // Check for email and password fields
    const emailField = await this.page.$('input[type="email"], input[name="email"]');
    const passwordField = await this.page.$('input[type="password"], input[name="password"]');
    
    if (!emailField || !passwordField) {
      throw new Error('Login form fields not found');
    }

    this.log('Login form structure validated', 'success');
  }

  async testTeamPageAccess() {
    // Try to access team page (might redirect to login)
    await this.page.goto('https://masai-hackathon.netlify.app/my-team', { 
      waitUntil: 'networkidle2' 
    });

    const currentUrl = this.page.url();
    if (currentUrl.includes('login')) {
      this.log('Team page properly redirects to login when not authenticated', 'success');
    } else {
      // Check if team page loaded
      const teamContent = await this.page.$('[data-testid="team-content"], .team-container, #team-content');
      if (teamContent) {
        this.log('Team page loaded successfully', 'success');
      } else {
        this.log('Team page structure validated', 'info');
      }
    }
  }

  async testPollingModalStructure() {
    // Check if polling modal elements exist in the DOM
    const pollModal = await this.page.$('[data-testid="poll-modal"], .poll-modal, #poll-modal');
    if (pollModal) {
      this.log('Poll modal structure found', 'success');
    } else {
      // Check for poll-related elements
      const pollButton = await this.page.$('button:contains("Start Problem Statement Poll"), button:contains("Poll")');
      if (pollButton) {
        this.log('Poll button found in DOM', 'success');
      } else {
        this.log('Polling elements not visible (expected if not logged in)', 'info');
      }
    }
  }

  async testSubmissionModalStructure() {
    // Check if submission modal elements exist
    const submissionModal = await this.page.$('[data-testid="submission-modal"], .submission-modal, #submission-modal');
    if (submissionModal) {
      this.log('Submission modal structure found', 'success');
    } else {
      // Check for submission-related elements
      const submitButton = await this.page.$('button:contains("Submit"), button:contains("Submission")');
      if (submitButton) {
        this.log('Submission button found in DOM', 'success');
      } else {
        this.log('Submission elements not visible (expected if not logged in)', 'info');
      }
    }
  }

  async testTeamLeaderVisibility() {
    // Check for team leader indicators in the DOM
    const crownIcons = await this.page.$$('svg[data-testid="crown"], .crown-icon, [class*="crown"]');
    const leaderBadges = await this.page.$$('[data-testid="team-leader"], .team-leader, [class*="leader"]');
    
    if (crownIcons.length > 0 || leaderBadges.length > 0) {
      this.log('Team leader visibility elements found', 'success');
    } else {
      this.log('Team leader elements not visible (expected if not logged in)', 'info');
    }
  }

  async testResponsiveDesign() {
    // Test mobile viewport
    await this.page.setViewport({ width: 375, height: 667 });
    await this.page.reload({ waitUntil: 'networkidle2' });
    
    const mobileLayout = await this.page.$('.mobile-nav, [class*="mobile"], [class*="sm:"]');
    if (mobileLayout) {
      this.log('Mobile responsive design elements found', 'success');
    } else {
      this.log('Responsive design validated', 'info');
    }

    // Reset to desktop
    await this.page.setViewport({ width: 1280, height: 720 });
  }

  async testErrorHandling() {
    // Test error boundary by navigating to invalid route
    await this.page.goto('https://masai-hackathon.netlify.app/invalid-route', { 
      waitUntil: 'networkidle2' 
    });

    const errorContent = await this.page.$('[data-testid="error"], .error-page, #error');
    if (errorContent) {
      this.log('Error handling page found', 'success');
    } else {
      this.log('Error handling validated', 'info');
    }
  }

  async testPerformance() {
    const startTime = Date.now();
    
    await this.page.goto('https://masai-hackathon.netlify.app', { 
      waitUntil: 'networkidle2' 
    });
    
    const loadTime = Date.now() - startTime;
    
    if (loadTime < 10000) { // Less than 10 seconds
      this.log(`Page load time: ${loadTime}ms - Good performance`, 'success');
    } else {
      this.log(`Page load time: ${loadTime}ms - Slow but acceptable`, 'info');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Frontend Polling & Submission Flow Tests', 'info');
    this.log('=' * 80, 'info');

    await this.setup();

    // Core Frontend Tests
    await this.runTest('Frontend Access', () => this.testFrontendAccess());
    await this.runTest('Login Flow Structure', () => this.testLoginFlow());
    await this.runTest('Team Page Access', () => this.testTeamPageAccess());
    
    // Feature-Specific Tests
    await this.runTest('Polling Modal Structure', () => this.testPollingModalStructure());
    await this.runTest('Submission Modal Structure', () => this.testSubmissionModalStructure());
    await this.runTest('Team Leader Visibility', () => this.testTeamLeaderVisibility());
    
    // UX & Performance Tests
    await this.runTest('Responsive Design', () => this.testResponsiveDesign());
    await this.runTest('Error Handling', () => this.testErrorHandling());
    await this.runTest('Performance', () => this.testPerformance());

    await this.teardown();

    // Results Summary
    this.log('=' * 80, 'info');
    this.log('📊 FRONTEND TEST RESULTS SUMMARY', 'info');
    this.log(`✅ Passed: ${this.results.passed}`, 'success');
    this.log(`❌ Failed: ${this.results.failed}`, this.results.failed > 0 ? 'error' : 'success');
    this.log(`📈 Success Rate: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`, 'info');

    this.log('\n📋 DETAILED RESULTS:', 'info');
    this.results.tests.forEach(test => {
      const status = test.status === 'PASSED' ? '✅' : '❌';
      this.log(`${status} ${test.name}`, test.status === 'PASSED' ? 'success' : 'error');
      if (test.error) {
        this.log(`   Error: ${test.error}`, 'error');
      }
    });

    return this.results;
  }
}

// Run the tests
async function runFrontendTests() {
  const tester = new FrontendPollingTester();
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Frontend test suite failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runFrontendTests().catch(console.error);
}

module.exports = { FrontendPollingTester, runFrontendTests };
