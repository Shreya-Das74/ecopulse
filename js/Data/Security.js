/**
 * @fileoverview Security & Input Validation Layer for EcoPulse.
 * Implements regex validation, HTML sanitization, and numeric bounds enforcement.
 * Adheres to strict type-safety conventions and OWASP top XSS prevention guidelines.
 */

/**
 * Escapes characters that could be interpreted as HTML control tokens.
 * Combats Cross-Site Scripting (XSS) injection vectors.
 * 
 * @param {string} str - Raw string input.
 * @returns {string} Sanitized text string.
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[m] || m;
  });
}

/**
 * Validates the user's name to ensure it only contains basic alphabetic characters,
 * spaces, hyphens, and apostrophes. Enforces length bounds (1 to 50 characters).
 * 
 * @param {string} name - Unsanitized name string.
 * @returns {boolean} True if the name is valid, false otherwise.
 */
export function validateName(name) {
  if (typeof name !== 'string') return false;
  const trimmed = name.trim();
  // Match standard alphabetic, whitespace, hyphens, apostrophes (1-50 length)
  const regex = /^[a-zA-Z\s\-']{1,50}$/;
  return regex.test(trimmed);
}

/**
 * Asserts that a value is a valid finite number within designated boundary ranges.
 * Automatically handles conversion, checks boundary conditions, and returns fallback on failure.
 * 
 * @param {*} value - The input to check.
 * @param {number} min - Minimum allowable value.
 * @param {number} max - Maximum allowable value.
 * @param {number} fallback - The fallback value if bounds check fails.
 * @returns {number} The validated value or the fallback.
 */
export function validateNumericRange(value, min, max, fallback) {
  const num = parseFloat(value);
  if (isNaN(num) || !isFinite(num)) {
    return fallback;
  }
  if (num < min) return min;
  if (num > max) return max;
  return num;
}

/**
 * Validates, cleans, and casts raw profile inputs to their designated types.
 * Encapsulates sanitization before storage or calculation.
 * 
 * @param {Object} rawProfile - Unchecked profile fields.
 * @returns {Object} Strictly typed, sanitized profile object.
 */
export function cleanProfileInput(rawProfile) {
  if (!rawProfile || typeof rawProfile !== 'object') {
    return {
      name: 'Eco Citizen',
      gridRegion: 'national-avg',
      transitMode: 'gas-car',
      transitMiles: 0,
      dietType: 'average',
      electricityKwh: 0,
      gasTherms: 0
    };
  }

  const cleanName = validateName(rawProfile.name) 
    ? sanitizeString(rawProfile.name.trim()) 
    : 'Eco Citizen';

  const validRegions = ['coal-heavy', 'national-avg', 'hydro-clean'];
  const cleanGrid = validRegions.includes(rawProfile.gridRegion) 
    ? rawProfile.gridRegion 
    : 'national-avg';

  const validTransit = ['gas-car', 'ev', 'transit', 'active'];
  const cleanTransit = validTransit.includes(rawProfile.transitMode) 
    ? rawProfile.transitMode 
    : 'gas-car';

  const validDiets = ['meat-heavy', 'average', 'vegetarian', 'vegan'];
  const cleanDiet = validDiets.includes(rawProfile.dietType) 
    ? rawProfile.dietType 
    : 'average';

  // Enforce realistic bounds (0 - 2000 weekly miles, fallback 0)
  const cleanMiles = validateNumericRange(rawProfile.transitMiles, 0, 2000, 0);

  // Enforce electricity limits (0 - 10000 kWh/month, fallback 0)
  const cleanKwh = validateNumericRange(rawProfile.electricityKwh, 0, 10000, 0);

  // Enforce gas limits (0 - 1000 Therms/month, fallback 0)
  const cleanTherms = validateNumericRange(rawProfile.gasTherms, 0, 1000, 0);

  return {
    name: cleanName,
    gridRegion: cleanGrid,
    transitMode: cleanTransit,
    transitMiles: cleanMiles,
    dietType: cleanDiet,
    electricityKwh: cleanKwh,
    gasTherms: cleanTherms
  };
}
