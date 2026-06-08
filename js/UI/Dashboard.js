/**
 * @fileoverview Dashboard component for EcoPulse.
 * Displays baseline emissions, category details, and comparisons.
 * Integrates directly with Domain Calculator logic.
 */

import { calculateFootprint } from '../Domain/Calculator.js';

export class DashboardComponent {
  /**
   * @param {HTMLElement} container - Target mount element.
   * @param {Object} state - Read-only application state.
   */
  constructor(container, state) {
    this.container = container;
    this.state = state;
  }

  /**
   * Renders the dashboard panels.
   */
  render() {
    const { profile } = this.state;
    const footprint = calculateFootprint(profile);
    
    const total = footprint.total || 0.1; 
    const pctTransit = Math.min(100, Math.round((footprint.breakdown.transit / total) * 100));
    const pctEnergy = Math.min(100, Math.round((footprint.breakdown.energy / total) * 100));
    const pctDiet = Math.min(100, Math.round((footprint.breakdown.diet / total) * 100));
    const pctWaste = Math.min(100, Math.round((footprint.breakdown.waste / total) * 100));

    // Gauge circle calculation (circumference = 565.48, max scale = 25 MT CO2e/year)
    const maxScale = 25;
    const fraction = Math.min(1, total / maxScale);
    const offset = 565.48 * (1 - fraction);

    let comparisonText = '';
    const usAverage = 16.0;
    const globalTarget = 2.0;

    if (total > usAverage) {
      const diff = Math.round(((total - usAverage) / usAverage) * 100);
      comparisonText = `Your footprint is <strong>${diff}% higher</strong> than the US national average (${usAverage} MT). Let's work on reducing it!`;
    } else if (total > globalTarget) {
      const diff = Math.round(((usAverage - total) / usAverage) * 100);
      comparisonText = `Great job! Your footprint is <strong>${diff}% lower</strong> than the US national average (${usAverage} MT). You are heading towards the global sustainability target of ${globalTarget} MT.`;
    } else {
      comparisonText = `Incredible! You are within the sustainable global target limit of <strong>${globalTarget} MT CO2e/year</strong>. Keep up this climate-friendly lifestyle!`;
    }

    this.container.innerHTML = `
      <div class="grid-2">
        <!-- Main Dashboard Summary Card -->
        <section class="card" aria-labelledby="dash-summary-title">
          <h2 id="dash-summary-title" style="font-size: 1.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <line x1="9" y1="3" x2="9" y2="21"/>
              <line x1="15" y1="3" x2="15" y2="21"/>
              <line x1="3" y1="9" x2="21" y2="9"/>
              <line x1="3" y1="15" x2="21" y2="15"/>
            </svg>
            Hello, ${profile.name}! Your Carbon Profile
          </h2>

          <div class="total-footprint-container">
            <div class="gauge-circle" aria-label="Carbon footprint gauge: ${total} Metric Tons CO2e per year">
              <svg viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="var(--accent-primary)" />
                    <stop offset="100%" stop-color="var(--accent-secondary)" />
                  </linearGradient>
                </defs>
                <circle class="gauge-bg" cx="100" cy="100" r="90" />
                <circle class="gauge-fill" cx="100" cy="100" r="90" style="stroke-dashoffset: ${offset};" />
              </svg>
              <div class="gauge-value" aria-hidden="true">
                <span class="gauge-num">${total}</span>
                <span class="gauge-unit">MT CO2e / Year</span>
              </div>
            </div>

            <div class="comparison-box">
              <p style="font-size: 0.95rem; line-height: 1.5;">${comparisonText}</p>
            </div>
          </div>

          <!-- Category Progress Bars -->
          <div style="margin-top: 2rem;">
            <h3 style="font-size: 1.1rem; margin-bottom: 1.25rem;">Carbon Footprint Breakdown</h3>
            <div class="breakdown-list">
              
              <!-- Transport -->
              <div class="breakdown-item">
                <div class="breakdown-info">
                  <span class="breakdown-label">
                    <span class="category-dot transport" aria-hidden="true"></span>
                    Transportation
                  </span>
                  <strong>${footprint.breakdown.transit} MT (${pctTransit}%)</strong>
                </div>
                <div class="breakdown-bar-container">
                  <div class="breakdown-bar transport" style="width: ${pctTransit}%" role="progressbar" aria-valuenow="${pctTransit}" aria-valuemin="0" aria-valuemax="100" aria-label="Transportation carbon breakdown: ${pctTransit}%"></div>
                </div>
              </div>

              <!-- Energy -->
              <div class="breakdown-item">
                <div class="breakdown-info">
                  <span class="breakdown-label">
                    <span class="category-dot energy" aria-hidden="true"></span>
                    Home Energy
                  </span>
                  <strong>${footprint.breakdown.energy} MT (${pctEnergy}%)</strong>
                </div>
                <div class="breakdown-bar-container">
                  <div class="breakdown-bar energy" style="width: ${pctEnergy}%" role="progressbar" aria-valuenow="${pctEnergy}" aria-valuemin="0" aria-valuemax="100" aria-label="Home energy carbon breakdown: ${pctEnergy}%"></div>
                </div>
              </div>

              <!-- Diet -->
              <div class="breakdown-item">
                <div class="breakdown-info">
                  <span class="breakdown-label">
                    <span class="category-dot diet" aria-hidden="true"></span>
                    Diet
                  </span>
                  <strong>${footprint.breakdown.diet} MT (${pctDiet}%)</strong>
                </div>
                <div class="breakdown-bar-container">
                  <div class="breakdown-bar diet" style="width: ${pctDiet}%" role="progressbar" aria-valuenow="${pctDiet}" aria-valuemin="0" aria-valuemax="100" aria-label="Diet carbon breakdown: ${pctDiet}%"></div>
                </div>
              </div>

              <!-- Waste -->
              <div class="breakdown-item">
                <div class="breakdown-info">
                  <span class="breakdown-label">
                    <span class="category-dot waste" aria-hidden="true"></span>
                    Waste & Consumption
                  </span>
                  <strong>${footprint.breakdown.waste} MT (${pctWaste}%)</strong>
                </div>
                <div class="breakdown-bar-container">
                  <div class="breakdown-bar waste" style="width: ${pctWaste}%" role="progressbar" aria-valuenow="${pctWaste}" aria-valuemin="0" aria-valuemax="100" aria-label="Waste carbon breakdown: ${pctWaste}%"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <!-- Right Side Panel: Dynamic AI Coach -->
        <div id="dashboard-coach-panel">
          <!-- CoachComponent mounts here -->
        </div>
      </div>
    `;
  }
}
