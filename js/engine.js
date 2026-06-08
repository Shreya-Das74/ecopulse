/**
 * @fileoverview Sustainability recommendation engine for EcoPulse.
 * Dynamically generates personalized Micro-Actions based on user profiles.
 */

import { EMISSION_FACTORS } from './calculator.js';

/**
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} gridRegion
 * @property {string} transitMode
 * @property {number} transitMiles
 * @property {string} dietType
 * @property {number} electricityKwh
 * @property {number} gasTherms
 */

/**
 * @typedef {Object} MicroAction
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {number} savings - kg CO2e saved per week
 * @property {string} rationale
 * @property {boolean} completed
 */

/**
 * Evaluates the user's profile and returns a personalized list of Micro-Actions.
 * @param {UserProfile} profile - The user profile context.
 * @returns {MicroAction[]} Array of personalized recommendations.
 */
export function generateRecommendations(profile) {
  const recommendations = [];
  const gridFactor = EMISSION_FACTORS.grid[profile.gridRegion] || EMISSION_FACTORS.grid['national-avg'];

  // --- TRANSPORTATION RECOMMENDATIONS ---
  if (profile.transitMode === 'gas-car' && profile.transitMiles > 0) {
    // 1. Carpool/Transit Swap
    const transitSavings = Math.round(profile.transitMiles * 0.20 * (0.40 - 0.14) * 10) / 10;
    recommendations.push({
      id: 'transit-swap',
      title: 'Swap 2 weekly car trips for transit',
      category: 'transport',
      savings: Math.max(2.0, transitSavings),
      rationale: `Since you drive a gas car ${profile.transitMiles} miles weekly, swapping 2 trips for public transit or carpooling directly avoids burning gasoline.`,
      completed: false
    });

    // 2. Eco Driving
    const ecoSavings = Math.round(profile.transitMiles * 0.40 * 0.10 * 10) / 10;
    recommendations.push({
      id: 'eco-driving',
      title: 'Practice eco-driving and check tire pressure',
      category: 'transport',
      savings: Math.max(1.5, ecoSavings),
      rationale: `Aggressive driving and under-inflated tires increase fuel consumption. Gentle acceleration can reduce emissions from your ${profile.transitMiles} weekly miles by 10%.`,
      completed: false
    });

    // 3. EV Transition (Longer term action with high impact indicator)
    const evFactor = EMISSION_FACTORS.transit.ev[profile.gridRegion] || EMISSION_FACTORS.transit.ev['national-avg'];
    const evSavings = Math.round(profile.transitMiles * (0.40 - evFactor) * 10) / 10;
    recommendations.push({
      id: 'ev-transition',
      title: 'Switch to an Electric Vehicle for your next car',
      category: 'transport',
      savings: Math.max(10.0, evSavings),
      rationale: `Transitioning to an EV would save up to ${evSavings} kg CO2e weekly based on your driving habits and your region's electric grid.`,
      completed: false
    });
  } else if (profile.transitMode === 'ev') {
    recommendations.push({
      id: 'ev-grid-charge',
      title: 'Charge your EV during off-peak hours',
      category: 'transport',
      savings: 2.5,
      rationale: 'Charging your electric car after 10 PM balances grid load and avoids the use of carbon-heavy peaker plants.',
      completed: false
    });
  } else if (profile.transitMode === 'transit' && profile.transitMiles > 0) {
    const activeSavings = Math.round(profile.transitMiles * 0.10 * 0.14 * 10) / 10;
    recommendations.push({
      id: 'active-transit-swap',
      title: 'Walk or bike short trips instead of transit',
      category: 'transport',
      savings: Math.max(1.0, activeSavings),
      rationale: 'You are doing great by riding transit! Replacing short transit trips with walking or biking eliminates transit energy demand entirely.',
      completed: false
    });
  }

  // --- GRID & HOME ENERGY RECOMMENDATIONS ---
  if (profile.electricityKwh > 0) {
    // Coal heavy grid specific action
    if (profile.gridRegion === 'coal-heavy') {
      recommendations.push({
        id: 'energy-peak-shaving',
        title: 'Run heavy appliances only during off-peak hours',
        category: 'energy',
        savings: 5.0,
        rationale: 'Your local grid relies heavily on coal. Shifting laundry and dishwashing to off-peak hours (after 10 PM) prevents starting up high-emission fossil units.',
        completed: false
      });

      recommendations.push({
        id: 'energy-vampire-coal',
        title: 'Unplug standby electronics and chargers',
        category: 'energy',
        savings: 3.5,
        rationale: 'Electronics in standby mode account for 5-10% of home energy. In your carbon-intensive energy region, cutting vampire power has a double impact.',
        completed: false
      });
    } else {
      recommendations.push({
        id: 'energy-vampire-general',
        title: 'Use smart power strips for entertainment centers',
        category: 'energy',
        savings: 2.0,
        rationale: 'Smart strips cut power to peripherals when the main device is off, saving phantom electricity load without effort.',
        completed: false
      });
    }

    // Thermostat setback
    const thermostatSavings = Math.round((profile.electricityKwh * 0.08) * gridFactor / 4 * 10) / 10;
    recommendations.push({
      id: 'energy-thermostat',
      title: 'Adjust your thermostat by 2°F',
      category: 'energy',
      savings: Math.max(2.0, thermostatSavings),
      rationale: 'Lowering the thermostat 2°F in winter (or raising in summer) reduces your heating and cooling emissions by approximately 8%.',
      completed: false
    });

    // LED replacement
    recommendations.push({
      id: 'energy-led',
      title: 'Swap remaining incandescent bulbs to LEDs',
      category: 'energy',
      savings: 2.5,
      rationale: 'LED bulbs use 75% less energy than incandescent lightbulbs and last significantly longer, lowering electricity bills and grid load.',
      completed: false
    });
  }

  if (profile.gasTherms > 0) {
    // Cold water washing
    recommendations.push({
      id: 'gas-cold-wash',
      title: 'Wash your clothes in cold water',
      category: 'energy',
      savings: 3.5,
      rationale: 'Heating water accounts for 90% of the energy consumed by washing machines. Switching to cold saves gas emissions and protects your clothes.',
      completed: false
    });

    // Water heater temperature setback
    recommendations.push({
      id: 'gas-water-heater',
      title: 'Set your water heater thermostat to 120°F',
      category: 'energy',
      savings: 4.0,
      rationale: 'Water heaters set above 120°F (49°C) waste heat energy. Dialing it back prevents unnecessary gas burning while remaining safe.',
      completed: false
    });
  }

  // --- DIETARY RECOMMENDATIONS ---
  if (profile.dietType === 'meat-heavy') {
    recommendations.push({
      id: 'diet-meatless-monday',
      title: 'Introduce a Meatless Monday',
      category: 'diet',
      savings: 4.5,
      rationale: 'Going meat-free just one day a week decreases livestock land-use requirements and saves methane emissions.',
      completed: false
    });

    recommendations.push({
      id: 'diet-plant-milk',
      title: 'Replace dairy milk with oat or soy milk',
      category: 'diet',
      savings: 2.0,
      rationale: 'Dairy milk production produces 3x more greenhouse gas emissions than plant-based alternatives. Oat and soy milks are excellent low-carbon substitutes.',
      completed: false
    });
  } else if (profile.dietType === 'average') {
    recommendations.push({
      id: 'diet-beef-swap',
      title: 'Swap beef for poultry or fish twice a week',
      category: 'diet',
      savings: 3.0,
      rationale: 'Beef and lamb require vast land and emit high levels of methane. Shifting to chicken, pork, or fish cuts dietary emissions significantly.',
      completed: false
    });

    recommendations.push({
      id: 'diet-plant-based-burger',
      title: 'Swap one beef burger for a plant-based option weekly',
      category: 'diet',
      savings: 2.0,
      rationale: 'Choosing plant-based meat substitutes reduces carbon emissions by up to 90% per burger compared to conventional beef.',
      completed: false
    });
  } else {
    // Vegetarian or Vegan
    recommendations.push({
      id: 'diet-food-waste',
      title: 'Track and eliminate edible food waste',
      category: 'diet',
      savings: 3.0,
      rationale: 'With a low-impact plant diet, your biggest food-related savings come from avoiding waste. Landfill food decay releases potent methane gas.',
      completed: false
    });

    recommendations.push({
      id: 'diet-seasonal',
      title: 'Eat seasonal, locally-sourced produce',
      category: 'diet',
      savings: 1.5,
      rationale: 'Local, seasonal food bypasses long-distance flight freight and heavy greenhouse heating, reducing transport-related agricultural carbon.',
      completed: false
    });
  }

  // --- GENERAL WASTE RECOMMENDATIONS ---
  recommendations.push({
    id: 'waste-composting',
    title: 'Compost your food scraps',
    category: 'waste',
    savings: 2.5,
    rationale: 'Composting returns nutrients to the soil aerobically, avoiding anaerobic landfill degradation that produces methane.',
    completed: false
  });

  recommendations.push({
    id: 'waste-single-use',
    title: 'Decline single-use plastics and packaging',
    category: 'waste',
    savings: 1.0,
    rationale: 'Plastic is refined from petrochemicals. Using reusable bottles and bags reduces fossil-fuel refining demand.',
    completed: false
  });

  return recommendations;
}
