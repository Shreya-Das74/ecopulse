/**
 * @fileoverview Onboarding wizard component for EcoPulse.
 * Collects name, location/grid region, transit habits, diet, and energy usage.
 */

import { stateManager } from '../state.js';
import { generateRecommendations } from '../engine.js';

export class OnboardingComponent {
  /**
   * @param {HTMLElement} container - Target mount element.
   * @param {Function} onComplete - Callback executed upon successful onboarding.
   */
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.currentStep = 1;
    this.totalSteps = 4;
    
    // Local questionnaire state
    this.formData = {
      name: '',
      gridRegion: 'national-avg',
      transitMode: 'gas-car',
      transitMiles: 0,
      dietType: 'average',
      electricityKwh: 0,
      gasTherms: 0
    };
  }

  /**
   * Initializes and renders the onboarding wizard.
   */
  render() {
    this.container.innerHTML = `
      <section class="card" aria-labelledby="onboarding-title" id="onboarding-card">
        <h1 id="onboarding-title" class="sr-only">EcoPulse Setup</h1>
        
        <!-- Step Indicator & Progress Bar -->
        <div class="mb-4" aria-hidden="true">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.5rem; color: var(--text-secondary);">
            <span id="wizard-step-label">Step ${this.currentStep} of ${this.totalSteps}</span>
            <span id="wizard-progress-percent">${Math.round(((this.currentStep - 1) / this.totalSteps) * 100)}% Complete</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar" id="wizard-progress" style="width: ${((this.currentStep - 1) / this.totalSteps) * 100}%"></div>
          </div>
        </div>

        <form id="onboarding-form" novalidate>
          
          <!-- STEP 1: Name & Location (Grid) -->
          <div class="form-step ${this.currentStep === 1 ? 'active' : ''}" id="step-1" role="group" aria-labelledby="step-1-title">
            <h2 id="step-1-title" class="mb-4" style="font-size: 1.5rem;">Welcome to EcoPulse! Let's get started.</h2>
            <div class="form-group">
              <label for="input-name">What should we call you?</label>
              <input type="text" id="input-name" class="form-control" placeholder="Enter your name or nickname" required value="${this.formData.name}">
              <div class="form-helper" id="name-error" style="color: var(--error-color); display: none;" role="alert">Name is required.</div>
            </div>
            
            <div class="form-group">
              <label id="grid-region-label">Where is your electricity sourced from?</label>
              <p class="form-helper mb-4" style="margin-bottom: 1rem;">This determines the carbon intensity of your electrical grid.</p>
              
              <div class="options-grid" role="radiogroup" aria-labelledby="grid-region-label">
                <button type="button" class="option-btn ${this.formData.gridRegion === 'coal-heavy' ? 'selected' : ''}" data-value="coal-heavy" data-field="gridRegion" role="radio" aria-checked="${this.formData.gridRegion === 'coal-heavy'}">
                  <strong>Coal-Heavy</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">e.g., WY, IN, WV (High Carbon)</div>
                </button>
                <button type="button" class="option-btn ${this.formData.gridRegion === 'national-avg' ? 'selected' : ''}" data-value="national-avg" data-field="gridRegion" role="radio" aria-checked="${this.formData.gridRegion === 'national-avg'}">
                  <strong>National Average</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">Standard Grid Mix (Medium Carbon)</div>
                </button>
                <button type="button" class="option-btn ${this.formData.gridRegion === 'hydro-clean' ? 'selected' : ''}" data-value="hydro-clean" data-field="gridRegion" role="radio" aria-checked="${this.formData.gridRegion === 'hydro-clean'}">
                  <strong>Hydro & Renewables</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">e.g., WA, OR, VT (Low Carbon)</div>
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 2: Transit Habits -->
          <div class="form-step ${this.currentStep === 2 ? 'active' : ''}" id="step-2" role="group" aria-labelledby="step-2-title">
            <h2 id="step-2-title" class="mb-4" style="font-size: 1.5rem;">How do you travel?</h2>
            
            <div class="form-group">
              <label id="transit-mode-label">Primary transit mode</label>
              <div class="options-grid" role="radiogroup" aria-labelledby="transit-mode-label">
                <button type="button" class="option-btn ${this.formData.transitMode === 'gas-car' ? 'selected' : ''}" data-value="gas-car" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'gas-car'}">
                  <strong>Gasoline Car</strong>
                </button>
                <button type="button" class="option-btn ${this.formData.transitMode === 'ev' ? 'selected' : ''}" data-value="ev" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'ev'}">
                  <strong>Electric Vehicle</strong>
                </button>
                <button type="button" class="option-btn ${this.formData.transitMode === 'transit' ? 'selected' : ''}" data-value="transit" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'transit'}">
                  <strong>Public Transit</strong>
                </button>
                <button type="button" class="option-btn ${this.formData.transitMode === 'active' ? 'selected' : ''}" data-value="active" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'active'}">
                  <strong>Active (Bike/Walk)</strong>
                </button>
              </div>
            </div>

            <div class="form-group" id="transit-miles-group">
              <label for="input-miles">Approximately how many miles do you travel per week?</label>
              <input type="number" id="input-miles" class="form-control" min="0" max="2000" placeholder="e.g., 100" value="${this.formData.transitMiles}">
              <div class="form-helper" id="miles-error" style="color: var(--error-color); display: none;" role="alert">Please enter a valid positive mileage (maximum 2000).</div>
            </div>
          </div>

          <!-- STEP 3: Dietary Preferences -->
          <div class="form-step ${this.currentStep === 3 ? 'active' : ''}" id="step-3" role="group" aria-labelledby="step-3-title">
            <h2 id="step-3-title" class="mb-4" style="font-size: 1.5rem;">What are your dietary preferences?</h2>
            
            <div class="form-group">
              <label id="diet-type-label">Select your diet tier</label>
              <div class="options-grid" role="radiogroup" aria-labelledby="diet-type-label">
                <button type="button" class="option-btn ${this.formData.dietType === 'meat-heavy' ? 'selected' : ''}" data-value="meat-heavy" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'meat-heavy'}">
                  <strong>Meat Lover</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">Frequent beef and lamb</div>
                </button>
                <button type="button" class="option-btn ${this.formData.dietType === 'average' ? 'selected' : ''}" data-value="average" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'average'}">
                  <strong>Balanced</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">Poultry, fish, occasional beef</div>
                </button>
                <button type="button" class="option-btn ${this.formData.dietType === 'vegetarian' ? 'selected' : ''}" data-value="vegetarian" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'vegetarian'}">
                  <strong>Vegetarian</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">No meat, includes dairy/eggs</div>
                </button>
                <button type="button" class="option-btn ${this.formData.dietType === 'vegan' ? 'selected' : ''}" data-value="vegan" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'vegan'}">
                  <strong>Vegan</strong>
                  <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">100% plant-based</div>
                </button>
              </div>
            </div>
          </div>

          <!-- STEP 4: Household Energy -->
          <div class="form-step ${this.currentStep === 4 ? 'active' : ''}" id="step-4" role="group" aria-labelledby="step-4-title">
            <h2 id="step-4-title" class="mb-4" style="font-size: 1.5rem;">What is your home energy footprint?</h2>
            
            <div class="form-group">
              <label for="input-kwh">Average monthly electricity usage (kWh)</label>
              <input type="number" id="input-kwh" class="form-control" min="0" max="10000" placeholder="e.g., 500" value="${this.formData.electricityKwh}">
              <div class="form-helper">Check your electric utility bill for average usage. (Set to 0 if included in rent/unknown)</div>
              <div class="form-helper" id="kwh-error" style="color: var(--error-color); display: none;" role="alert">Please enter a valid positive number (max 10000).</div>
            </div>

            <div class="form-group">
              <label for="input-therms">Average monthly natural gas usage (Therms)</label>
              <input type="number" id="input-therms" class="form-control" min="0" max="1000" placeholder="e.g., 30" value="${this.formData.gasTherms}">
              <div class="form-helper">Used for heating or gas stoves. (Set to 0 if all-electric home)</div>
              <div class="form-helper" id="therms-error" style="color: var(--error-color); display: none;" role="alert">Please enter a valid positive number (max 1000).</div>
            </div>
          </div>

          <!-- Form Buttons -->
          <div class="form-actions">
            <button type="button" class="btn btn-secondary" id="btn-prev" ${this.currentStep === 1 ? 'disabled style="opacity: 0.5;"' : ''}>
              Back
            </button>
            <button type="button" class="btn btn-primary" id="btn-next">
              ${this.currentStep === this.totalSteps ? 'Generate Coach Plan' : 'Continue'}
            </button>
          </div>
        </form>
      </section>
    `;

    this.bindEvents();
    this.announceStep();
  }

  /**
   * Sets up click, change, and keyboard event handlers.
   */
  bindEvents() {
    const form = this.container.querySelector('#onboarding-form');
    if (!form) return;

    // Next / Submit Button
    const btnNext = this.container.querySelector('#btn-next');
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleNext();
    });

    // Prev Button
    const btnPrev = this.container.querySelector('#btn-prev');
    btnPrev.addEventListener('click', (e) => {
      e.preventDefault();
      this.handlePrev();
    });

    // Handle Custom Option Button clicks
    const optionBtns = this.container.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const field = btn.getAttribute('data-field');
        const value = btn.getAttribute('data-value');
        
        // Update local state
        this.formData[field] = value;
        
        // Update button visual state
        const siblings = this.container.querySelectorAll(`.option-btn[data-field="${field}"]`);
        siblings.forEach(sib => {
          sib.classList.remove('selected');
          sib.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');
      });
    });

    // Handle standard inputs change to sync to state
    const inputName = this.container.querySelector('#input-name');
    if (inputName) {
      inputName.addEventListener('input', (e) => {
        this.formData.name = e.target.value;
      });
    }

    const inputMiles = this.container.querySelector('#input-miles');
    if (inputMiles) {
      inputMiles.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.formData.transitMiles = isNaN(val) ? 0 : val;
      });
    }

    const inputKwh = this.container.querySelector('#input-kwh');
    if (inputKwh) {
      inputKwh.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.formData.electricityKwh = isNaN(val) ? 0 : val;
      });
    }

    const inputTherms = this.container.querySelector('#input-therms');
    if (inputTherms) {
      inputTherms.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.formData.gasTherms = isNaN(val) ? 0 : val;
      });
    }
  }

  /**
   * Validates current step data.
   * @returns {boolean} True if input is valid.
   */
  validateStep() {
    let isValid = true;

    if (this.currentStep === 1) {
      const errorEl = this.container.querySelector('#name-error');
      if (!this.formData.name || this.formData.name.trim() === '') {
        errorEl.style.display = 'block';
        isValid = false;
      } else {
        errorEl.style.display = 'none';
      }
    }

    if (this.currentStep === 2) {
      const errorEl = this.container.querySelector('#miles-error');
      const miles = this.formData.transitMiles;
      if (isNaN(miles) || miles < 0 || miles > 2000) {
        errorEl.style.display = 'block';
        isValid = false;
      } else {
        errorEl.style.display = 'none';
      }
    }

    if (this.currentStep === 4) {
      const kwhError = this.container.querySelector('#kwh-error');
      const thermsError = this.container.querySelector('#therms-error');
      
      const kwh = this.formData.electricityKwh;
      if (isNaN(kwh) || kwh < 0 || kwh > 10000) {
        kwhError.style.display = 'block';
        isValid = false;
      } else {
        kwhError.style.display = 'none';
      }

      const therms = this.formData.gasTherms;
      if (isNaN(therms) || therms < 0 || therms > 1000) {
        thermsError.style.display = 'block';
        isValid = false;
      } else {
        thermsError.style.display = 'none';
      }
    }

    return isValid;
  }

  /**
   * Processes moving to the next wizard step.
   */
  handleNext() {
    if (!this.validateStep()) return;

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.render();
    } else {
      this.completeOnboarding();
    }
  }

  /**
   * Processes moving to the previous wizard step.
   */
  handlePrev() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
    }
  }

  /**
   * Saves profile, triggers AI engine logic, and redirects.
   */
  completeOnboarding() {
    // 1. Save profile to centralized State Manager
    stateManager.updateProfile(this.formData);

    // 2. Generate personalized recommendations based on the newly captured profile
    const recommendations = generateRecommendations(stateManager.state.profile);

    // 3. Store actions in State Manager
    stateManager.setActions(recommendations);

    // 4. Trigger callback to update main container routes
    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Announces current step to assistive tech (screen readers).
   */
  announceStep() {
    const announcer = document.getElementById('screen-reader-announcer');
    if (announcer) {
      announcer.textContent = `EcoPulse wizard step ${this.currentStep} of ${this.totalSteps} loaded.`;
    }
  }
}
