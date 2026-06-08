/**
 * @fileoverview Unit tests for the Carbon Footprint Calculator.
 */

import assert from 'assert';
import { 
  calculateTransitEmissions, 
  calculateElectricityEmissions, 
  calculateGasEmissions, 
  calculateDietEmissions,
  calculateFootprint
} from '../js/calculator.js';

export function runCalculatorTests() {
  console.log('🧪 Running Carbon Calculator Tests...');

  // 1. Test Transit Emissions
  // Gas Car: 100 miles/week * 52 weeks * 0.40 kg/mile = 2080 kg = 2.08 MT
  const gasCarEmissions = calculateTransitEmissions('gas-car', 100);
  assert.strictEqual(gasCarEmissions, 2.08, 'Gas car transit emissions calculated incorrectly.');

  // Active: Bike/Walk should always be 0
  const activeEmissions = calculateTransitEmissions('active', 150);
  assert.strictEqual(activeEmissions, 0, 'Active transport emissions should be 0.');

  // EV in Coal-Heavy Grid: 100 miles/wk * 52 wks * (0.82 / 3.3) kg/mile / 1000 = ~1.29 MT
  const evCoalEmissions = calculateTransitEmissions('ev', 100, 'coal-heavy');
  assert.ok(Math.abs(evCoalEmissions - 1.29) < 0.01, 'EV in Coal-Heavy grid emissions calculated incorrectly.');

  // EV in Hydro-Clean Grid: 100 miles/wk * 52 wks * (0.04 / 3.3) kg/mile / 1000 = ~0.06 MT
  const evHydroEmissions = calculateTransitEmissions('ev', 100, 'hydro-clean');
  assert.ok(Math.abs(evHydroEmissions - 0.06) < 0.01, 'EV in Hydro-Clean grid emissions calculated incorrectly.');

  // 2. Test Electricity Emissions
  // 500 kWh/month * 12 months * 0.37 kg/kWh = 2220 kg = 2.22 MT
  const electricityEmissions = calculateElectricityEmissions(500, 'national-avg');
  assert.strictEqual(electricityEmissions, 2.22, 'Electricity emissions calculated incorrectly.');

  // 3. Test Gas Heating Emissions
  // 30 Therms/month * 12 months * 5.3 kg/Therm = 1908 kg = 1.908 MT
  const gasEmissions = calculateGasEmissions(30);
  assert.strictEqual(gasEmissions, 1.908, 'Gas heating emissions calculated incorrectly.');

  // 4. Test Diet Emissions
  assert.strictEqual(calculateDietEmissions('vegan'), 1.5, 'Vegan diet emissions calculated incorrectly.');
  assert.strictEqual(calculateDietEmissions('meat-heavy'), 3.3, 'Meat-heavy diet emissions calculated incorrectly.');

  // 5. Test Full Footprint Calculation
  const mockProfile = {
    name: 'Test User',
    gridRegion: 'national-avg',
    transitMode: 'gas-car',
    transitMiles: 100,
    dietType: 'average',
    electricityKwh: 500,
    gasTherms: 30
  };

  const footprint = calculateFootprint(mockProfile);
  // Expected breakdown:
  // transit: 2.08 MT
  // electricity: 2.22 MT
  // gas: 1.91 MT (rounded)
  // diet: 2.5 MT
  // waste: 0.5 MT
  // total: 2.08 + 2.22 + 1.91 + 2.5 + 0.5 = 9.21 MT
  assert.strictEqual(footprint.total, 9.21, `Total footprint calculation mismatched. Got ${footprint.total}`);
  assert.strictEqual(footprint.breakdown.transit, 2.08);
  assert.strictEqual(footprint.breakdown.diet, 2.5);

  console.log('✅ Calculator Tests Passed Successfully!');
}
