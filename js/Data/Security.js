/**
 * @fileoverview Security & Input Validation Layer for EcoPulse.
 * Implements regex validation, HTML sanitization, and numeric bounds enforcement.
 * Adheres to strict type-safety conventions and OWASP top XSS prevention guidelines.
 */

/**
 * Escapes characters that could be interpreted as HTML control tokens.
 * Combats Cross-Site Scripting (XSS) injection vectors.
 * 
 * @param {string} inputString - Raw string input.
 * @returns {string} Sanitized text string.
 * @throws {never} This function does not throw errors and handles invalid inputs gracefully.
 */
export function sanitizeString(inputString) {
  if (typeof inputString !== 'string') return '';
  return inputString.replace(/[&<>"']/g, (matchedChar) => {
    const characterMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return characterMap[matchedChar] || matchedChar;
  });
}

/**
 * Validates the user's name to ensure it only contains basic alphabetic characters,
 * spaces, hyphens, and apostrophes. Enforces length bounds (1 to 50 characters).
 * 
 * @param {string} name - Unsanitized name string.
 * @returns {boolean} True if the name is valid, false otherwise.
 * @throws {never} This function does not throw errors and handles invalid inputs gracefully.
 */
export function validateName(name) {
  if (typeof name !== 'string') return false;
  const trimmedName = name.trim();
  // Match standard alphabetic, whitespace, hyphens, apostrophes (1-50 length)
  const validationRegex = /^[a-zA-Z\s\-']{1,50}$/;
  return validationRegex.test(trimmedName);
}

/**
 * Asserts that a value is a valid finite number within designated boundary ranges.
 * Automatically handles conversion, checks boundary conditions, and returns fallback on failure.
 * 
 * @param {*} value - The input to check.
 * @param {number} minimumValue - Minimum allowable value.
 * @param {number} maximumValue - Maximum allowable value.
 * @param {number} fallbackValue - The fallback value if bounds check fails.
 * @returns {number} The validated value or the fallback.
 * @throws {never} This function does not throw errors and handles invalid inputs gracefully.
 */
export function validateNumericRange(value, minimumValue, maximumValue, fallbackValue) {
  const parsedNumber = parseFloat(value);
  if (isNaN(parsedNumber) || !isFinite(parsedNumber)) {
    return fallbackValue;
  }
  if (parsedNumber < minimumValue) return minimumValue;
  if (parsedNumber > maximumValue) return maximumValue;
  return parsedNumber;
}

/**
 * Validates, cleans, and casts raw profile inputs to their designated types.
 * Encapsulates sanitization before storage or calculation.
 * 
 * @param {Object} rawProfile - Unchecked profile fields.
 * @returns {Object} Strictly typed, sanitized profile object.
 * @throws {never} This function does not throw errors and handles invalid inputs gracefully.
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
  const cleanGridRegion = validRegions.includes(rawProfile.gridRegion) 
    ? rawProfile.gridRegion 
    : 'national-avg';

  const validTransitModes = ['gas-car', 'ev', 'transit', 'active'];
  const cleanTransitMode = validTransitModes.includes(rawProfile.transitMode) 
    ? rawProfile.transitMode 
    : 'gas-car';

  const validDietTypes = ['meat-heavy', 'average', 'vegetarian', 'vegan'];
  const cleanDietType = validDietTypes.includes(rawProfile.dietType) 
    ? rawProfile.dietType 
    : 'average';

  // Enforce realistic bounds (0 - 2000 weekly miles, fallback 0)
  const cleanTransitMiles = validateNumericRange(rawProfile.transitMiles, 0, 2000, 0);

  // Enforce electricity limits (0 - 10000 kWh/month, fallback 0)
  const cleanElectricityKwh = validateNumericRange(rawProfile.electricityKwh, 0, 10000, 0);

  // Enforce gas limits (0 - 1000 Therms/month, fallback 0)
  const cleanGasTherms = validateNumericRange(rawProfile.gasTherms, 0, 1000, 0);

  return {
    name: cleanName,
    gridRegion: cleanGridRegion,
    transitMode: cleanTransitMode,
    transitMiles: cleanTransitMiles,
    dietType: cleanDietType,
    electricityKwh: cleanElectricityKwh,
    gasTherms: cleanGasTherms
  };
}
