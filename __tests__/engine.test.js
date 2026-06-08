/**
 * @fileoverview Integration tests for the Recommendation Engine rules.
 * Verifies that specific user context arrays successfully output the correct arrays of personalized Micro-Actions.
 */

import assert from 'assert';
import { generateRecommendations } from '../js/Domain/Engine.js';

export function runEngineTests() {
  console.log('🧪 Running Recommendation Engine Tests...');

  // 1. Profile with High Gas Mileage, Coal Grid, Meat Lover Diet
  const profileA = {
    name: 'Jane Doe',
    gridRegion: 'coal-heavy',
    transitMode: 'gas-car',
    transitMiles: 200,
    dietType: 'meat-heavy',
    electricityKwh: 600,
    gasTherms: 40
  };

  const actionsA = generateRecommendations(profileA);
  
  // Verify Gas Car actions exist
  const transitSwap = actionsA.find(a => a.id === 'transit-swap');
  assert.ok(transitSwap, 'transit-swap recommendation should be generated.');
  assert.strictEqual(transitSwap.category, 'transport');
  assert.ok(transitSwap.savings > 2.0); // 200 miles * 0.2 * 0.26 = 10.4 kg savings

  const evTransition = actionsA.find(a => a.id === 'ev-transition');
  assert.ok(evTransition, 'ev-transition recommendation should be generated.');

  // Verify Coal Grid actions exist
  const peakShaving = actionsA.find(a => a.id === 'energy-peak-shaving');
  assert.ok(peakShaving, 'energy-peak-shaving should be triggered on coal-heavy grid.');
  assert.strictEqual(peakShaving.savings, 5.0, 'Peak shaving savings must be 5.0 kg.');

  const vampireCoal = actionsA.find(a => a.id === 'energy-vampire-coal');
  assert.ok(vampireCoal, 'vampire electricity actions for coal regions should be triggered.');

  // Verify Meat Lover actions
  const meatlessMonday = actionsA.find(a => a.id === 'diet-meatless-monday');
  assert.ok(meatlessMonday, 'Meatless Monday recommendation should be generated.');
  assert.strictEqual(meatlessMonday.savings, 4.5);

  const plantMilk = actionsA.find(a => a.id === 'diet-plant-milk');
  assert.ok(plantMilk, 'Plant milk recommendation should be generated.');


  // 2. Profile with Clean Grid, Active Transit, Vegan Diet
  const profileB = {
    name: 'John Green',
    gridRegion: 'hydro-clean',
    transitMode: 'active',
    transitMiles: 20,
    dietType: 'vegan',
    electricityKwh: 300,
    gasTherms: 0
  };

  const actionsB = generateRecommendations(profileB);

  // Active transit should produce NO gas-car recommendations
  assert.ok(!actionsB.some(a => a.id === 'transit-swap'), 'Transit swap should NOT be generated for active commuters.');
  assert.ok(!actionsB.some(a => a.id === 'ev-transition'), 'EV transition should NOT be generated for active commuters.');

  // Vegan diet should trigger food waste and local produce actions
  const foodWaste = actionsB.find(a => a.id === 'diet-food-waste');
  assert.ok(foodWaste, 'Food waste recommendations should be active for vegans.');

  const seasonal = actionsB.find(a => a.id === 'diet-seasonal');
  assert.ok(seasonal, 'Eating local/seasonal should be recommended for low-carbon diets.');

  // Clean grid should NOT trigger coal-heavy peak-shaving
  assert.ok(!actionsB.some(a => a.id === 'energy-peak-shaving'), 'Peak-shaving is not recommended on hydro/clean grids.');
  
  // General energy vampire for standard/clean grid should be triggered
  assert.ok(actionsB.some(a => a.id === 'energy-vampire-general'), 'General standby energy action should be recommended.');

  // Waste actions should always exist
  assert.ok(actionsB.some(a => a.id === 'waste-composting'), 'Composting recommendation should exist for all users.');


  // ==========================================
  // EDGE CASE & CRASH RESILIENCE TESTING
  // ==========================================

  // A. Null/Undefined Profile
  const nullActions = generateRecommendations(null);
  assert.ok(Array.isArray(nullActions), 'Null profiles should return an empty array');
  assert.strictEqual(nullActions.length, 0, 'Null profiles should yield 0 recommendations');

  // B. Empty Profile
  const emptyActions = generateRecommendations({});
  assert.ok(Array.isArray(emptyActions), 'Empty profiles should return an empty array');
  assert.strictEqual(emptyActions.length, 0, 'Empty profiles should yield 0 recommendations');

  // C. Extreme inputs mapping
  const extremeProfile = {
    transitMode: 'gas-car',
    transitMiles: 99999, // very extreme mileage
    dietType: 'meat-heavy',
    electricityKwh: 999999,
    gridRegion: 'coal-heavy'
  };
  const extremeActions = generateRecommendations(extremeProfile);
  assert.ok(extremeActions.length > 0, 'Extreme profiles should still generate recommendations');
  const extremeTransitSwap = extremeActions.find(a => a.id === 'transit-swap');
  assert.ok(extremeTransitSwap, 'Should generate transit swap recommendation');
  assert.ok(isFinite(extremeTransitSwap.savings), 'Savings should remain a finite number');

  console.log('✅ Recommendation Engine Tests Passed Successfully!');
}
