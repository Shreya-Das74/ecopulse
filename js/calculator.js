/**
 * @fileoverview Calculator for estimating carbon footprint.
 * Includes emission factors and mathematical conversion formulas.
 */

// EMISSION FACTORS (in kg CO2e per unit)
export const EMISSION_FACTORS = {
  // Transit per mile (kg CO2e / mile)
  transit: {
    'gas-car': 0.40,
    'transit': 0.14,
    'active': 0.0,
    // EV factor depends on grid intensity (miles per kWh is assumed to be 3.3)
    'ev': {
      'coal-heavy': 0.82 / 3.3,  // ~0.248 kg/mile
      'national-avg': 0.37 / 3.3, // ~0.112 kg/mile
      'hydro-clean': 0.04 / 3.3   // ~0.012 kg/mile
    }
  },

  // Grid intensity per kWh (kg CO2e / kWh)
  grid: {
    'coal-heavy': 0.82,
    'national-avg': 0.37,
    'hydro-clean': 0.04
  },

  // Natural gas per therm (kg CO2e / therm)
  gas: 5.3,

  // Annual diet baseline (Metric Tons CO2e / year)
  diet: {
    'meat-heavy': 3.3,
    'average': 2.5,
    'vegetarian': 1.7,
    'vegan': 1.5
  },

  // Annual waste baseline per person (Metric Tons CO2e / year)
  waste: 0.5
};

/**
 * Calculates transportation annual emissions in metric tons.
 * @param {string} mode - Transit mode ('gas-car', 'ev', 'transit', 'active').
 * @param {number} weeklyMiles - Weekly travel distance.
 * @param {string} gridRegion - Grid region ('coal-heavy', 'national-avg', 'hydro-clean').
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateTransitEmissions(mode, weeklyMiles, gridRegion = 'national-avg') {
  if (weeklyMiles <= 0) return 0;

  let factor = 0;
  if (mode === 'ev') {
    factor = EMISSION_FACTORS.transit.ev[gridRegion] || EMISSION_FACTORS.transit.ev['national-avg'];
  } else {
    factor = EMISSION_FACTORS.transit[mode] || 0;
  }

  const annualMiles = weeklyMiles * 52;
  const kgCo2 = annualMiles * factor;
  return kgCo2 / 1000; // Convert to Metric Tons
}

/**
 * Calculates home electricity annual emissions in metric tons.
 * @param {number} monthlyKwh - Monthly electricity usage in kWh.
 * @param {string} gridRegion - Grid region.
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateElectricityEmissions(monthlyKwh, gridRegion = 'national-avg') {
  if (monthlyKwh <= 0) return 0;
  
  const factor = EMISSION_FACTORS.grid[gridRegion] || EMISSION_FACTORS.grid['national-avg'];
  const annualKwh = monthlyKwh * 12;
  const kgCo2 = annualKwh * factor;
  return kgCo2 / 1000;
}

/**
 * Calculates home natural gas heating annual emissions in metric tons.
 * @param {number} monthlyTherms - Monthly natural gas usage in therms.
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateGasEmissions(monthlyTherms) {
  if (monthlyTherms <= 0) return 0;

  const annualTherms = monthlyTherms * 12;
  const kgCo2 = annualTherms * EMISSION_FACTORS.gas;
  return kgCo2 / 1000;
}

/**
 * Calculates user's diet annual emissions in metric tons.
 * @param {string} dietType - Diet preference.
 * @returns {number} Metric Tons of CO2e per year.
 */
export function calculateDietEmissions(dietType) {
  return EMISSION_FACTORS.diet[dietType] || EMISSION_FACTORS.diet['average'];
}

/**
 * Calculates total footprint and breakdown categories.
 * @param {Object} profile - User profile state.
 * @returns {Object} Calculated emission totals (MT CO2e/year) and individual components.
 */
export function calculateFootprint(profile) {
  const transit = calculateTransitEmissions(profile.transitMode, profile.transitMiles, profile.gridRegion);
  const electricity = calculateElectricityEmissions(profile.electricityKwh, profile.gridRegion);
  const gas = calculateGasEmissions(profile.gasTherms);
  const energy = electricity + gas;
  const diet = calculateDietEmissions(profile.dietType);
  const waste = EMISSION_FACTORS.waste;

  const total = transit + energy + diet + waste;

  return {
    total: Math.round(total * 100) / 100,
    breakdown: {
      transit: Math.round(transit * 100) / 100,
      electricity: Math.round(electricity * 100) / 100,
      gas: Math.round(gas * 100) / 100,
      energy: Math.round(energy * 100) / 100,
      diet: Math.round(diet * 100) / 100,
      waste: Math.round(waste * 100) / 100
    }
  };
}
