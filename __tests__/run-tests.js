/**
 * @fileoverview Custom test runner for EcoPulse.
 * Runs all unit, integration, and security tests, outputting status results.
 */

import { runSecurityTests } from './security.test.js';
import { runCalculatorTests } from './calculator.test.js';
import { runEngineTests } from './engine.test.js';

async function runAllTests() {
  console.log('==================================================');
  console.log('🍀 Starting EcoPulse Test Suite execution...');
  console.log('==================================================');

  try {
    // 1. Run security sanitization and validation assertions
    runSecurityTests();
    console.log('');

    // 2. Run calculator logic assertions
    runCalculatorTests();
    console.log('');
    
    // 3. Run recommendation engine assertions
    runEngineTests();
    
    console.log('==================================================');
    console.log('🎉 SUCCESS: All EcoPulse unit, integration, and security tests passed!');
    console.log('==================================================');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('==================================================');
    console.error('❌ FAILURE: EcoPulse test suite encountered errors!');
    console.error('==================================================');
    console.error(error);
    process.exit(1);
  }
}

runAllTests();
