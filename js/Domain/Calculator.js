/**
 * @fileoverview Domain Carbon Footprint Calculator.
 * Contains core calculations and scientific conversions.
 * Completely decoupled from browser state and UI layers to facilitate testing.
 */

/**
 * @typedef {Object} TransitEVGridFactors
 * @property {number} coal-heavy
 * @property {number} national-avg
 * @property {number} hydro-clean
 */

/**
 * @typedef {Object} TransitFactors
 * @property {number} gas-car
 * @property {number} transit
 * @property {number} active
 * @property {TransitEVGridFactors} ev
 */

/**
 * @typedef {Object} GridFactors
 * @property {number} coal-heavy
 * @property {number} national-avg
 * @property {number} hydro-clean
 */

/**
 * @typedef {Object} DietFactors
 * @property {number} meat-heavy
 * @property {number} average
 * @property {number} vegetarian
 * @property {number} vegan
 */

/**
 * @typedef {Object} EmissionFactors
 * @property {TransitFactors} transit
 * @property {GridFactors} grid
 * @property {number} gas
 * @property {DietFactors} diet
 * @property {number} waste
 */

/**
 * EMISSION FACTORS (in kg CO2e per unit or Metric Tons per year)
 * @type {EmissionFactors}
 */
export const EMISSION_FACTORS = {
  transit: {
    'gas-car': 0.40,     // kg CO2e per mile
    'transit': 0.14,     // kg CO2e per mile
    'active': 0.0,
    ev: {
      'coal-heavy': 0.82 / 3.3,   // ~0.248 kg CO2e per mile (coal-grid + 3.3 mi/kWh efficiency)
      'national-avg': 0.37 / 3.3,  // ~0.112 kg CO2e per mile
      'hydro-clean': 0.04 / 3.3    // ~0.012 kg CO2e per mile
    }
  },
  grid: {
    'coal-heavy': 0.82,    // kg CO2e per kWh
    'national-avg': 0.37,   // kg CO2e per kWh
    'hydro-clean': 0.04     // kg CO2e per kWh
  },
  gas: 5.3,                 // kg CO2e per Therm of Natural Gas
  diet: {
    'meat-heavy': 3.3,      // MT CO2e / year
    'average': 2.5,         // MT CO2e / year
    'vegetarian': 1.7,      // MT CO2e / year
    'vegan': 1.5            // MT CO2e / year
  },
  waste: 0.5                // MT CO2e / year per individual
};

/**
 * Calculates transportation annual emissions.
 * 
 * @param {string} mode - Transit mode ('gas-car', 'ev', 'transit', 'active').
 * @param {number} weeklyMiles - Weekly travel distance. Must be positive.
 * @param {string} [gridRegion='national-avg'] - Grid region ('coal-heavy', 'national-avg', 'hydro-clean').
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateTransitEmissions(mode, weeklyMiles, gridRegion = 'national-avg') {
  const miles = parseFloat(weeklyMiles);
  if (isNaN(miles) || miles <= 0) return 0;

  let factor = 0;
  if (mode === 'ev') {
    const region = gridRegion || 'national-avg';
    factor = EMISSION_FACTORS.transit.ev[region] || EMISSION_FACTORS.transit.ev['national-avg'];
  } else {
    factor = EMISSION_FACTORS.transit[mode] || 0;
  }

  const annualMiles = miles * 52;
  const kgCo2 = annualMiles * factor;
  return Math.round((kgCo2 / 1000) * 100) / 100; // Convert to Metric Tons and round
}

/**
 * Calculates home electricity annual emissions.
 * 
 * @param {number} monthlyKwh - Monthly electricity usage. Must be positive.
 * @param {string} [gridRegion='national-avg'] - Grid region.
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateElectricityEmissions(monthlyKwh, gridRegion = 'national-avg') {
  const kwh = parseFloat(monthlyKwh);
  if (isNaN(kwh) || kwh <= 0) return 0;
  
  const factor = EMISSION_FACTORS.grid[gridRegion] || EMISSION_FACTORS.grid['national-avg'];
  const annualKwh = kwh * 12;
  const kgCo2 = annualKwh * factor;
  return Math.round((kgCo2 / 1000) * 100) / 100;
}

/**
 * Calculates natural gas home heating annual emissions.
 * 
 * @param {number} monthlyTherms - Monthly natural gas usage in therms. Must be positive.
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateGasEmissions(monthlyTherms) {
  const therms = parseFloat(monthlyTherms);
  if (isNaN(therms) || therms <= 0) return 0;

  const annualTherms = therms * 12;
  const kgCo2 = annualTherms * EMISSION_FACTORS.gas;
  return Math.round((kgCo2 / 1000) * 100) / 100;
}

/**
 * Calculates dietary annual emissions.
 * 
 * @param {string} dietType - Diet preference ('meat-heavy', 'average', 'vegetarian', 'vegan').
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateDietEmissions(dietType) {
  return EMISSION_FACTORS.diet[dietType] || EMISSION_FACTORS.diet['average'];
}

/**
 * Calculates total footprint and breakdown categories for a given profile.
 * Ensures strict typing and checks profile field availability.
 * 
 * @param {Object} profile - User profile state.
 * @returns {Object} Calculated emission totals (MT CO2e/year) and individual components.
 */
export function calculateFootprint(profile) {
  if (!profile || typeof profile !== 'object') {
    return {
      total: 0.5,
      breakdown: { transit: 0, electricity: 0, gas: 0, energy: 0, diet: 0, waste: 0.5 }
    };
  }

  const transit = calculateTransitEmissions(profile.transitMode, profile.transitMiles, profile.gridRegion);
  const electricity = calculateElectricityEmissions(profile.electricityKwh, profile.gridRegion);
  const gas = calculateGasEmissions(profile.gasTherms);
  const energy = Math.round((electricity + gas) * 100) / 100;
  const diet = calculateDietEmissions(profile.dietType);
  const waste = EMISSION_FACTORS.waste;

  const total = Math.round((transit + energy + diet + waste) * 100) / 100;

  return {
    total,
    breakdown: {
      transit,
      electricity,
      gas,
      energy,
      diet,
      waste
    }
  };
}
