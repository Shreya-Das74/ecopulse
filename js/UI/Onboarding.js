/**
 * @fileoverview Onboarding wizard component for EcoPulse.
 * Collects name, location/grid region, transit habits, diet, and energy usage.
 * Integrates directly with the secure Data and Domain layers.
 */

import { stateManager } from '../Data/State.js';
import { generateRecommendations } from '../Domain/Engine.js';

export class OnboardingComponent {
  /**
   * Initializes the OnboardingComponent.
   * 
   * @param {HTMLElement} container - Target mount element.
   * @param {Function} onComplete - Callback executed upon successful onboarding.
   * @throws {never} This constructor does not throw errors.
   */
  constructor(container, onComplete) {
    this.container = container;
    this.onComplete = onComplete;
    this.currentStep = 1;
    this.totalSteps = 4;
    
    // Questionnaire state
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
   * Initializes and renders the onboarding wizard step.
   * Wraps rendering in a try-catch block with active step heading focus shift.
   * 
   * @returns {void}
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  render() {
    try {
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
              <h2 id="step-1-title" tabindex="-1" class="mb-4" style="font-size: 1.5rem; outline: none;">Welcome to EcoPulse! Let's get started.</h2>
              <div class="form-group">
                <label for="input-name">What should we call you?</label>
                <input type="text" id="input-name" class="form-control" placeholder="Enter your name (letters only)" required value="${this.formData.name}">
                <div class="form-helper" id="name-error" style="color: var(--error-color); display: none;" role="alert">Please enter a valid name (1-50 alphabetic characters, hyphens, or spaces).</div>
              </div>
              
              <div class="form-group">
                <label id="grid-region-label">Where is your electricity sourced from?</label>
                <p class="form-helper mb-4" style="margin-bottom: 1rem;">This determines the carbon intensity of your electrical grid.</p>
                
                <div class="options-grid" role="radiogroup" aria-labelledby="grid-region-label">
                  <button type="button" class="option-btn ${this.formData.gridRegion === 'coal-heavy' ? 'selected' : ''}" data-value="coal-heavy" data-field="gridRegion" role="radio" aria-checked="${this.formData.gridRegion === 'coal-heavy'}" aria-label="Coal Heavy Grid. For example Wyoming, Indiana, West Virginia. High carbon intensity.">
                    <strong>Coal-Heavy</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">e.g., WY, IN, WV (High Carbon)</div>
                  </button>
                  <button type="button" class="option-btn ${this.formData.gridRegion === 'national-avg' ? 'selected' : ''}" data-value="national-avg" data-field="gridRegion" role="radio" aria-checked="${this.formData.gridRegion === 'national-avg'}" aria-label="National Average Grid. Standard grid mix. Medium carbon intensity.">
                    <strong>National Average</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">Standard Grid Mix (Medium Carbon)</div>
                  </button>
                  <button type="button" class="option-btn ${this.formData.gridRegion === 'hydro-clean' ? 'selected' : ''}" data-value="hydro-clean" data-field="gridRegion" role="radio" aria-checked="${this.formData.gridRegion === 'hydro-clean'}" aria-label="Hydro and Renewables Grid. For example Washington, Oregon, Vermont. Low carbon intensity.">
                    <strong>Hydro & Renewables</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">e.g., WA, OR, VT (Low Carbon)</div>
                  </button>
                </div>
              </div>
            </div>

            <!-- STEP 2: Transit Habits -->
            <div class="form-step ${this.currentStep === 2 ? 'active' : ''}" id="step-2" role="group" aria-labelledby="step-2-title">
              <h2 id="step-2-title" tabindex="-1" class="mb-4" style="font-size: 1.5rem; outline: none;">How do you travel?</h2>
              
              <div class="form-group">
                <label id="transit-mode-label">Primary transit mode</label>
                <div class="options-grid" role="radiogroup" aria-labelledby="transit-mode-label">
                  <button type="button" class="option-btn ${this.formData.transitMode === 'gas-car' ? 'selected' : ''}" data-value="gas-car" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'gas-car'}" aria-label="Gasoline Car transit mode">
                    <strong>Gasoline Car</strong>
                  </button>
                  <button type="button" class="option-btn ${this.formData.transitMode === 'ev' ? 'selected' : ''}" data-value="ev" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'ev'}" aria-label="Electric Vehicle transit mode">
                    <strong>Electric Vehicle</strong>
                  </button>
                  <button type="button" class="option-btn ${this.formData.transitMode === 'transit' ? 'selected' : ''}" data-value="transit" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'transit'}" aria-label="Public Transit transit mode">
                    <strong>Public Transit</strong>
                  </button>
                  <button type="button" class="option-btn ${this.formData.transitMode === 'active' ? 'selected' : ''}" data-value="active" data-field="transitMode" role="radio" aria-checked="${this.formData.transitMode === 'active'}" aria-label="Active commute transit mode such as biking or walking">
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
              <h2 id="step-3-title" tabindex="-1" class="mb-4" style="font-size: 1.5rem; outline: none;">What are your dietary preferences?</h2>
              
              <div class="form-group">
                <label id="diet-type-label">Select your diet tier</label>
                <div class="options-grid" role="radiogroup" aria-labelledby="diet-type-label">
                  <button type="button" class="option-btn ${this.formData.dietType === 'meat-heavy' ? 'selected' : ''}" data-value="meat-heavy" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'meat-heavy'}" aria-label="Meat Lover diet tier. Frequent beef and lamb.">
                    <strong>Meat Lover</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">Frequent beef and lamb</div>
                  </button>
                  <button type="button" class="option-btn ${this.formData.dietType === 'average' ? 'selected' : ''}" data-value="average" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'average'}" aria-label="Balanced diet tier. Poultry, fish, occasional beef.">
                    <strong>Balanced</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">Poultry, fish, occasional beef</div>
                  </button>
                  <button type="button" class="option-btn ${this.formData.dietType === 'vegetarian' ? 'selected' : ''}" data-value="vegetarian" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'vegetarian'}" aria-label="Vegetarian diet tier. No meat, includes dairy and eggs.">
                    <strong>Vegetarian</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">No meat, includes dairy/eggs</div>
                  </button>
                  <button type="button" class="option-btn ${this.formData.dietType === 'vegan' ? 'selected' : ''}" data-value="vegan" data-field="dietType" role="radio" aria-checked="${this.formData.dietType === 'vegan'}" aria-label="Vegan diet tier. One hundred percent plant based.">
                    <strong>Vegan</strong>
                    <div style="font-size: 0.75rem; margin-top: 0.25rem; font-weight: normal;">100% plant-based</div>
                  </button>
                </div>
              </div>
            </div>

            <!-- STEP 4: Household Energy -->
            <div class="form-step ${this.currentStep === 4 ? 'active' : ''}" id="step-4" role="group" aria-labelledby="step-4-title">
              <h2 id="step-4-title" tabindex="-1" class="mb-4" style="font-size: 1.5rem; outline: none;">What is your home energy footprint?</h2>
              
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
              <button type="button" class="btn btn-secondary" id="btn-prev" ${this.currentStep === 1 ? 'disabled style="opacity: 0.5;"' : ''} aria-label="Go back to the previous step">
                Back
              </button>
              <button type="button" class="btn btn-primary" id="btn-next" aria-label="${this.currentStep === this.totalSteps ? 'Generate Coach Plan' : 'Continue to next step'}">
                ${this.currentStep === this.totalSteps ? 'Generate Coach Plan' : 'Continue'}
              </button>
            </div>
          </form>
        </section>
      `;

      this.bindEvents();
      this.announceStep();

      // Set focus to the active step heading for semantic keyboard navigation
      const activeHeadingElement = this.container.querySelector(`#step-${this.currentStep}-title`);
      if (activeHeadingElement) {
        activeHeadingElement.focus();
      }
    } catch (error) {
      console.error('Failed to render OnboardingComponent:', error);
      this.container.innerHTML = `
        <div class="alert-banner info" role="alert" style="border-color: var(--error-color);">
          <strong style="color: var(--error-color);">Error:</strong> An unexpected error occurred while loading setup wizard. Please refresh the page.
        </div>
      `;
    }
  }

  /**
   * Binds click, input change, and button selection event listeners.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  bindEvents() {
    const onboardingForm = this.container.querySelector('#onboarding-form');
    if (!onboardingForm) return;

    const buttonNext = this.container.querySelector('#btn-next');
    buttonNext.addEventListener('click', (event) => {
      event.preventDefault();
      this.handleNext();
    });

    const buttonPrev = this.container.querySelector('#btn-prev');
    buttonPrev.addEventListener('click', (event) => {
      event.preventDefault();
      this.handlePrev();
    });

    const optionButtons = this.container.querySelectorAll('.option-btn');
    optionButtons.forEach(button => {
      button.addEventListener('click', () => {
        const dataField = button.getAttribute('data-field');
        const dataValue = button.getAttribute('data-value');
        
        this.formData[dataField] = dataValue;
        
        const siblingButtons = this.container.querySelectorAll(`.option-btn[data-field="${dataField}"]`);
        siblingButtons.forEach(sibling => {
          sibling.classList.remove('selected');
          sibling.setAttribute('aria-checked', 'false');
        });
        button.classList.add('selected');
        button.setAttribute('aria-checked', 'true');
      });
    });

    const inputName = this.container.querySelector('#input-name');
    if (inputName) {
      inputName.addEventListener('input', (event) => {
        this.formData.name = event.target.value;
      });
    }

    const inputMiles = this.container.querySelector('#input-miles');
    if (inputMiles) {
      inputMiles.addEventListener('input', (event) => {
        const numericValue = parseFloat(event.target.value);
        this.formData.transitMiles = isNaN(numericValue) ? 0 : numericValue;
      });
    }

    const inputKwh = this.container.querySelector('#input-kwh');
    if (inputKwh) {
      inputKwh.addEventListener('input', (event) => {
        const numericValue = parseFloat(event.target.value);
        this.formData.electricityKwh = isNaN(numericValue) ? 0 : numericValue;
      });
    }

    const inputTherms = this.container.querySelector('#input-therms');
    if (inputTherms) {
      inputTherms.addEventListener('input', (event) => {
        const numericValue = parseFloat(event.target.value);
        this.formData.gasTherms = isNaN(numericValue) ? 0 : numericValue;
      });
    }
  }

  /**
   * Validates state data of the active step against regex and boundaries.
   * 
   * @returns {boolean} True if inputs are clean.
   * @throws {never} This function does not throw errors.
   */
  validateStep() {
    let isValid = true;

    if (this.currentStep === 1) {
      const nameErrorElement = this.container.querySelector('#name-error');
      // Validate name structure using alphabetic character regex bounds (1-50 length)
      const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
      if (!this.formData.name || !nameRegex.test(this.formData.name.trim())) {
        nameErrorElement.style.display = 'block';
        isValid = false;
      } else {
        nameErrorElement.style.display = 'none';
      }
    }

    if (this.currentStep === 2) {
      const milesErrorElement = this.container.querySelector('#miles-error');
      const miles = this.formData.transitMiles;
      if (isNaN(miles) || miles < 0 || miles > 2000) {
        milesErrorElement.style.display = 'block';
        isValid = false;
      } else {
        milesErrorElement.style.display = 'none';
      }
    }

    if (this.currentStep === 4) {
      const electricityErrorElement = this.container.querySelector('#kwh-error');
      const naturalGasErrorElement = this.container.querySelector('#therms-error');
      
      const kilowattHours = this.formData.electricityKwh;
      if (isNaN(kilowattHours) || kilowattHours < 0 || kilowattHours > 10000) {
        electricityErrorElement.style.display = 'block';
        isValid = false;
      } else {
        electricityErrorElement.style.display = 'none';
      }

      const therms = this.formData.gasTherms;
      if (isNaN(therms) || therms < 0 || therms > 1000) {
        naturalGasErrorElement.style.display = 'block';
        isValid = false;
      } else {
        naturalGasErrorElement.style.display = 'none';
      }
    }

    return isValid;
  }

  /**
   * Progresses step index.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
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
   * Backtracks step index.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  handlePrev() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
    }
  }

  /**
   * Commits profile, computes dynamic insights, and fires callback.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  completeOnboarding() {
    stateManager.updateProfile(this.formData);

    // Generate actions list using secure, immutable state data copy
    const recommendations = generateRecommendations(stateManager.state.profile);
    stateManager.setActions(recommendations);

    if (this.onComplete) {
      this.onComplete();
    }
  }

  /**
   * Emits speech synthesizer helper tag.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  announceStep() {
    const announcer = document.getElementById('screen-reader-announcer');
    if (announcer) {
      announcer.textContent = `EcoPulse onboarding step ${this.currentStep} of ${this.totalSteps} loaded.`;
    }
  }
}
