/**
 * @fileoverview Security & Injection Validation Tests.
 * Asserts script sanitization, validation rules, and crash-resilience.
 */

import assert from 'assert';
import { sanitizeString, validateName, validateNumericRange, cleanProfileInput } from '../js/Data/Security.js';

export function runSecurityTests() {
  console.log('🧪 Running Security & Input Validation Tests...');

  // 1. HTML/XSS Sanitization
  const xssPayload = '<script>alert("hack")</script>';
  const cleanXss = sanitizeString(xssPayload);
  assert.strictEqual(cleanXss.includes('<script>'), false, 'Should escape opening bracket');
  assert.strictEqual(cleanXss.includes('</script>'), false, 'Should escape closing bracket');
  assert.strictEqual(cleanXss, '&lt;script&gt;alert(&quot;hack&quot;)&lt;/script&gt;', 'XSS characters must be converted to entities');

  const quotedPayload = 'Jean-Luc "The Captain" O\'Connor';
  const cleanQuotes = sanitizeString(quotedPayload);
  assert.strictEqual(cleanQuotes, 'Jean-Luc &quot;The Captain&quot; O&#039;Connor', 'Double and single quotes must be escaped');

  // 2. Name Regex Validation
  assert.strictEqual(validateName('Alice Smith'), true, 'Standard alphabetic name with space is valid');
  assert.strictEqual(validateName('Jean-Luc'), true, 'Name with hyphens is valid');
  assert.strictEqual(validateName("O'Connor"), true, 'Name with apostrophes is valid');
  
  assert.strictEqual(validateName(''), false, 'Empty name is invalid');
  assert.strictEqual(validateName('  '), false, 'Whitespace-only name is invalid');
  assert.strictEqual(validateName('Alice123'), false, 'Names with numbers are invalid');
  assert.strictEqual(validateName('Alice <script>'), false, 'Names with HTML characters are invalid');
  assert.strictEqual(validateName('A'.repeat(51)), false, 'Names longer than 50 characters are invalid');

  // 3. Numeric Bounds Verification
  assert.strictEqual(validateNumericRange(100, 0, 1000, 0), 100, 'Valid number in range stays unchanged');
  assert.strictEqual(validateNumericRange(-50, 0, 1000, 0), 0, 'Value below min snaps to min boundary');
  assert.strictEqual(validateNumericRange(5000, 0, 1000, 0), 1000, 'Value above max snaps to max boundary');
  assert.strictEqual(validateNumericRange('invalid_number', 0, 1000, 10), 10, 'Non-numeric string returns fallback');
  assert.strictEqual(validateNumericRange(null, 0, 1000, 15), 15, 'Null inputs return fallback');

  // 4. Corrupted Profile Payload Fallback (Crash Prevention)
  const corruptedPayload = {
    name: '<script>alert(1)</script>',
    gridRegion: 'malicious-grid',
    transitMode: 'submarine',
    transitMiles: -999,
    dietType: 'all-junk-food',
    electricityKwh: 'infinite',
    gasTherms: undefined
  };

  // Cleaning corrupted input should succeed without crashing the thread
  const cleaned = cleanProfileInput(corruptedPayload);
  
  assert.strictEqual(cleaned.name, 'Eco Citizen', 'Corrupted names should fallback');
  assert.strictEqual(cleaned.gridRegion, 'national-avg', 'Invalid gridRegion should fallback to default');
  assert.strictEqual(cleaned.transitMode, 'gas-car', 'Invalid transitMode should fallback to default');
  assert.strictEqual(cleaned.dietType, 'average', 'Invalid dietType should fallback to default');
  assert.strictEqual(cleaned.transitMiles, 0, 'Negative miles should snap to min boundary (0)');
  assert.strictEqual(cleaned.electricityKwh, 0, 'Non-numeric kWh should return fallback (0)');
  assert.strictEqual(cleaned.gasTherms, 0, 'Undefined gasTherms should return fallback (0)');

  // Null check validation
  const nullCleaned = cleanProfileInput(null);
  assert.strictEqual(typeof nullCleaned, 'object', 'Clean profile from null returns state object');
  assert.strictEqual(nullCleaned.name, 'Eco Citizen', 'Returns default name');

  console.log('✅ Security & Input Validation Tests Passed Successfully!');
}
