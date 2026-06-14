/**
 * @fileoverview Dashboard component for EcoPulse.
 * Displays baseline emissions, category details, and comparisons.
 * Integrates directly with Domain Calculator logic.
 */

import { calculateFootprint } from '../Domain/Calculator.js';

export class DashboardComponent {
  /**
   * Initializes the DashboardComponent.
   * 
   * @param {HTMLElement} container - Target mount element.
   * @param {Object} state - Read-only application state.
   * @throws {never} This constructor does not throw errors.
   */
  constructor(container, state) {
    this.container = container;
    this.state = state;
  }

  /**
   * Renders the dashboard panels.
   * Wraps rendering in a try-catch block to display a fallback on failure.
   * 
   * @returns {void}
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  render() {
    try {
      const { profile } = this.state;
      const footprint = calculateFootprint(profile);
      
      const totalFootprint = footprint.total || 0.1; 
      const percentageTransit = Math.min(100, Math.round((footprint.breakdown.transit / totalFootprint) * 100));
      const percentageEnergy = Math.min(100, Math.round((footprint.breakdown.energy / totalFootprint) * 100));
      const percentageDiet = Math.min(100, Math.round((footprint.breakdown.diet / totalFootprint) * 100));
      const percentageWaste = Math.min(100, Math.round((footprint.breakdown.waste / totalFootprint) * 100));

      // Gauge circle calculation (circumference = 565.48, max scale = 25 MT CO2e/year)
      const maximumScale = 25;
      const progressFraction = Math.min(1, totalFootprint / maximumScale);
      const strokeDashoffsetValue = 565.48 * (1 - progressFraction);

      let comparisonText = '';
      const unitedStatesAverage = 16.0;
      const globalSustainabilityTarget = 2.0;

      if (totalFootprint > unitedStatesAverage) {
        const differencePercentage = Math.round(((totalFootprint - unitedStatesAverage) / unitedStatesAverage) * 100);
        comparisonText = `Your footprint is <strong>${differencePercentage}% higher</strong> than the US national average (${unitedStatesAverage} MT). Let's work on reducing it!`;
      } else if (totalFootprint > globalSustainabilityTarget) {
        const differencePercentage = Math.round(((unitedStatesAverage - totalFootprint) / unitedStatesAverage) * 100);
        comparisonText = `Great job! Your footprint is <strong>${differencePercentage}% lower</strong> than the US national average (${unitedStatesAverage} MT). You are heading towards the global sustainability target of ${globalSustainabilityTarget} MT.`;
      } else {
        comparisonText = `Incredible! You are within the sustainable global target limit of <strong>${globalSustainabilityTarget} MT CO2e/year</strong>. Keep up this climate-friendly lifestyle!`;
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
              <div class="gauge-circle" aria-label="Carbon footprint gauge: ${totalFootprint} Metric Tons CO2e per year">
                <svg viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="var(--accent-primary)" />
                      <stop offset="100%" stop-color="var(--accent-secondary)" />
                    </linearGradient>
                  </defs>
                  <circle class="gauge-bg" cx="100" cy="100" r="90" />
                  <circle class="gauge-fill" cx="100" cy="100" r="90" style="stroke-dashoffset: ${strokeDashoffsetValue};" />
                </svg>
                <div class="gauge-value" aria-hidden="true">
                  <span class="gauge-num">${totalFootprint}</span>
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
                    <strong>${footprint.breakdown.transit} MT (${percentageTransit}%)</strong>
                  </div>
                  <div class="breakdown-bar-container">
                    <div class="breakdown-bar transport" style="width: ${percentageTransit}%" role="progressbar" aria-valuenow="${percentageTransit}" aria-valuemin="0" aria-valuemax="100" aria-label="Transportation carbon breakdown: ${percentageTransit}%"></div>
                  </div>
                </div>

                <!-- Energy -->
                <div class="breakdown-item">
                  <div class="breakdown-info">
                    <span class="breakdown-label">
                      <span class="category-dot energy" aria-hidden="true"></span>
                      Home Energy
                    </span>
                    <strong>${footprint.breakdown.energy} MT (${percentageEnergy}%)</strong>
                  </div>
                  <div class="breakdown-bar-container">
                    <div class="breakdown-bar energy" style="width: ${percentageEnergy}%" role="progressbar" aria-valuenow="${percentageEnergy}" aria-valuemin="0" aria-valuemax="100" aria-label="Home energy carbon breakdown: ${percentageEnergy}%"></div>
                  </div>
                </div>

                <!-- Diet -->
                <div class="breakdown-item">
                  <div class="breakdown-info">
                    <span class="breakdown-label">
                      <span class="category-dot diet" aria-hidden="true"></span>
                      Diet
                    </span>
                    <strong>${footprint.breakdown.diet} MT (${percentageDiet}%)</strong>
                  </div>
                  <div class="breakdown-bar-container">
                    <div class="breakdown-bar diet" style="width: ${percentageDiet}%" role="progressbar" aria-valuenow="${percentageDiet}" aria-valuemin="0" aria-valuemax="100" aria-label="Diet carbon breakdown: ${percentageDiet}%"></div>
                  </div>
                </div>

                <!-- Waste -->
                <div class="breakdown-item">
                  <div class="breakdown-info">
                    <span class="breakdown-label">
                      <span class="category-dot waste" aria-hidden="true"></span>
                      Waste & Consumption
                    </span>
                    <strong>${footprint.breakdown.waste} MT (${percentageWaste}%)</strong>
                  </div>
                  <div class="breakdown-bar-container">
                    <div class="breakdown-bar waste" style="width: ${percentageWaste}%" role="progressbar" aria-valuenow="${percentageWaste}" aria-valuemin="0" aria-valuemax="100" aria-label="Waste carbon breakdown: ${percentageWaste}%"></div>
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
    } catch (error) {
      console.error('Failed to render DashboardComponent:', error);
      this.container.innerHTML = `
        <div class="alert-banner info" role="alert" style="border-color: var(--error-color);">
          <strong style="color: var(--error-color);">Error:</strong> An unexpected error occurred while rendering the dashboard. Please try reloading the page.
        </div>
      `;
    }
  }
}
