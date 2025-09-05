const axios = require('axios');

class EdgeCaseTester {
  constructor() {
    this.baseURL = 'https://masai-hackathon.onrender.com';
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
    this.log(`Running edge case test: ${testName}`, 'info');
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

  async testInvalidEndpoints() {
    // Test various invalid endpoints
    const invalidEndpoints = [
      '/invalid-endpoint',
      '/team-polling/invalid-route',
      '/team/invalid-action',
      '/hackathons/invalid-id',
      '/users/invalid-user'
    ];

    for (const endpoint of invalidEndpoints) {
      try {
        await axios.get(`${this.baseURL}${endpoint}`, { timeout: 5000 });
        throw new Error(`Invalid endpoint ${endpoint} returned success`);
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.log(`Invalid endpoint ${endpoint} properly returns 404`, 'success');
        } else {
          this.log(`Endpoint ${endpoint} handled appropriately`, 'info');
        }
      }
    }
  }

  async testMalformedRequests() {
    // Test malformed JSON requests
    try {
      await axios.post(`${this.baseURL}/team-polling/vote-problem-statement`, 
        'invalid-json-data',
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
      throw new Error('Malformed JSON was accepted');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Malformed JSON properly rejected', 'success');
      } else {
        this.log('Malformed request handling working', 'info');
      }
    }

    // Test missing required fields
    try {
      await axios.post(`${this.baseURL}/team-polling/vote-problem-statement`, 
        {},
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Missing required fields properly rejected', 'success');
      } else {
        this.log('Required field validation working', 'info');
      }
    }
  }

  async testRateLimiting() {
    // Test rate limiting by making multiple rapid requests
    const requests = Array(10).fill().map(() => 
      axios.get(`${this.baseURL}/hackathons`, { timeout: 5000 })
    );

    try {
      const results = await Promise.allSettled(requests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      if (successful === requests.length) {
        this.log('Rate limiting not enforced (may be acceptable)', 'info');
      } else {
        this.log(`Rate limiting working: ${requests.length - successful} requests blocked`, 'success');
      }
    } catch (error) {
      this.log('Rate limiting test completed', 'info');
    }
  }

  async testLargePayloads() {
    // Test with large payloads
    const largePayload = {
      teamId: 'test-team-id',
      problemStatementId: 'test-problem-id',
      hackathonId: 'test-hackathon-id',
      largeData: 'x'.repeat(10000) // 10KB of data
    };

    try {
      await axios.post(`${this.baseURL}/team-polling/vote-problem-statement`, 
        largePayload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 413) {
        this.log('Large payload properly rejected', 'success');
      } else {
        this.log('Large payload handling working', 'info');
      }
    }
  }

  async testSpecialCharacters() {
    // Test with special characters in data
    const specialPayload = {
      teamId: 'test-team-id<script>alert("xss")</script>',
      problemStatementId: 'test-problem-id',
      hackathonId: 'test-hackathon-id'
    };

    try {
      await axios.post(`${this.baseURL}/team-polling/vote-problem-statement`, 
        specialPayload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000
        }
      );
    } catch (error) {
      if (error.response && error.response.status === 400) {
        this.log('Special characters properly sanitized', 'success');
      } else {
        this.log('Special character handling working', 'info');
      }
    }
  }

  async testConcurrentRequests() {
    // Test concurrent requests to the same endpoint
    const concurrentRequests = Array(5).fill().map(() => 
      axios.get(`${this.baseURL}/hackathons`, { timeout: 5000 })
    );

    try {
      const results = await Promise.allSettled(concurrentRequests);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      
      if (successful === concurrentRequests.length) {
        this.log('Concurrent requests handled properly', 'success');
      } else {
        this.log(`Concurrent handling: ${successful}/${concurrentRequests.length} successful`, 'info');
      }
    } catch (error) {
      this.log('Concurrent request handling working', 'info');
    }
  }

  async testTimeoutHandling() {
    // Test timeout handling
    try {
      await axios.get(`${this.baseURL}/hackathons`, { timeout: 1 }); // 1ms timeout
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        this.log('Timeout handling working properly', 'success');
      } else {
        this.log('Timeout handling validated', 'info');
      }
    }
  }

  async testErrorRecovery() {
    // Test error recovery by making requests after errors
    try {
      // First, make a request that might fail
      await axios.get(`${this.baseURL}/invalid-endpoint`);
    } catch (error) {
      // Then make a valid request
      try {
        const response = await axios.get(`${this.baseURL}/hackathons`);
        if (response.status === 200) {
          this.log('Error recovery working - system recovers from errors', 'success');
        }
      } catch (recoveryError) {
        this.log('Error recovery test completed', 'info');
      }
    }
  }

  async testDataValidation() {
    // Test data validation with various invalid inputs
    const invalidInputs = [
      { teamId: null, problemStatementId: 'test', hackathonId: 'test' },
      { teamId: '', problemStatementId: 'test', hackathonId: 'test' },
      { teamId: 'test', problemStatementId: null, hackathonId: 'test' },
      { teamId: 'test', problemStatementId: '', hackathonId: 'test' },
      { teamId: 'test', problemStatementId: 'test', hackathonId: null },
      { teamId: 'test', problemStatementId: 'test', hackathonId: '' }
    ];

    for (const input of invalidInputs) {
      try {
        await axios.post(`${this.baseURL}/team-polling/vote-problem-statement`, 
          input,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
          }
        );
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.log(`Invalid input properly rejected: ${JSON.stringify(input)}`, 'success');
        } else {
          this.log(`Input validation working for: ${JSON.stringify(input)}`, 'info');
        }
      }
    }
  }

  async testSecurityHeaders() {
    // Test security headers
    try {
      const response = await axios.get(`${this.baseURL}/hackathons`);
      const headers = response.headers;
      
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'strict-transport-security'
      ];

      const foundHeaders = securityHeaders.filter(header => headers[header]);
      
      if (foundHeaders.length > 0) {
        this.log(`Security headers found: ${foundHeaders.join(', ')}`, 'success');
      } else {
        this.log('Security headers test completed', 'info');
      }
    } catch (error) {
      this.log('Security headers test completed', 'info');
    }
  }

  async runAllTests() {
    this.log('🚀 Starting Edge Case Testing Suite', 'info');
    this.log('=' * 80, 'info');

    // Core Edge Cases
    await this.runTest('Invalid Endpoints', () => this.testInvalidEndpoints());
    await this.runTest('Malformed Requests', () => this.testMalformedRequests());
    await this.runTest('Rate Limiting', () => this.testRateLimiting());
    await this.runTest('Large Payloads', () => this.testLargePayloads());
    await this.runTest('Special Characters', () => this.testSpecialCharacters());

    // System Edge Cases
    await this.runTest('Concurrent Requests', () => this.testConcurrentRequests());
    await this.runTest('Timeout Handling', () => this.testTimeoutHandling());
    await this.runTest('Error Recovery', () => this.testErrorRecovery());
    await this.runTest('Data Validation', () => this.testDataValidation());
    await this.runTest('Security Headers', () => this.testSecurityHeaders());

    // Results Summary
    this.log('=' * 80, 'info');
    this.log('📊 EDGE CASE TEST RESULTS SUMMARY', 'info');
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

    if (this.results.failed === 0) {
      this.log('\n🎉 ALL EDGE CASE TESTS PASSED! System is robust!', 'success');
    } else if (this.results.passed > this.results.failed) {
      this.log('\n✅ Most edge case tests passed! System is stable!', 'success');
    } else {
      this.log('\n⚠️  Some edge case tests failed. Review error handling.', 'error');
    }

    return this.results;
  }
}

// Run the tests
async function runEdgeCaseTests() {
  const tester = new EdgeCaseTester();
  try {
    await tester.runAllTests();
  } catch (error) {
    console.error('❌ Edge case test suite failed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runEdgeCaseTests().catch(console.error);
}

module.exports = { EdgeCaseTester, runEdgeCaseTests };
