/**
 * @fileoverview Custom test runner for EcoPulse.
 * Runs all unit tests and outputs status results.
 */

import { runCalculatorTests } from './calculator.test.js';
import { runEngineTests } from './engine.test.js';

async function runAllTests() {
  console.log('==================================================');
  console.log('🍀 Starting EcoPulse Test Suite execution...');
  console.log('==================================================');

  try {
    // Run calculator logic assertions
    runCalculatorTests();
    console.log('');
    
    // Run recommendation engine assertions
    runEngineTests();
    
    console.log('==================================================');
    console.log('🎉 SUCCESS: All EcoPulse unit tests passed!');
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
