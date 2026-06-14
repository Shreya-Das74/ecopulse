/**
 * @fileoverview Micro-Actions checklist component for EcoPulse.
 * Connects directly to the secure stateManager module to handle toggling.
 */

import { stateManager } from '../Data/State.js';

export class ActionsComponent {
  /**
   * Initializes the ActionsComponent.
   * 
   * @param {HTMLElement} container - Target mount element.
   * @param {Object} state - Read-only application state.
   * @throws {never} This constructor does not throw errors.
   */
  constructor(container, state) {
    this.container = container;
    this.state = state;
    this.currentFilter = 'all'; 
  }

  /**
   * Renders the action checklist and category filters.
   * Wraps rendering in a try-catch block to display a fallback on failure.
   * 
   * @returns {void}
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  render() {
    try {
      const { actions } = this.state;
      
      const countTotal = actions.length;
      const countActive = actions.filter(action => !action.completed).length;
      const countCompleted = actions.filter(action => action.completed).length;

      const filteredActions = actions.filter(action => {
        if (this.currentFilter === 'all') return true;
        return action.category === this.currentFilter;
      });

      this.container.innerHTML = `
        <section class="card" aria-labelledby="actions-title">
          <h2 id="actions-title" style="font-size: 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="9 11 12 14 22 4"/>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            Your Personalized Micro-Actions
          </h2>
          
          <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.95rem;">
            Take small, high-impact steps. Each action you complete reduces your baseline carbon footprint.
          </p>

          <!-- Category Filters -->
          <nav aria-label="Action Category Filters" style="margin-bottom: 1.5rem;">
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="nav-link-btn ${this.currentFilter === 'all' ? 'active' : ''}" data-filter="all" aria-label="Show all recommendations">All (${countTotal})</button>
              <button class="nav-link-btn ${this.currentFilter === 'transport' ? 'active' : ''}" data-filter="transport" aria-label="Show transportation recommendations">Transportation</button>
              <button class="nav-link-btn ${this.currentFilter === 'energy' ? 'active' : ''}" data-filter="energy" aria-label="Show home energy recommendations">Home Energy</button>
              <button class="nav-link-btn ${this.currentFilter === 'diet' ? 'active' : ''}" data-filter="diet" aria-label="Show diet recommendations">Diet</button>
              <button class="nav-link-btn ${this.currentFilter === 'waste' ? 'active' : ''}" data-filter="waste" aria-label="Show waste recommendations">Waste</button>
            </div>
          </nav>

          <!-- Summary Progress Banner -->
          <div class="alert-banner info" style="margin-bottom: 1.5rem;" role="status">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="stroke: var(--accent-secondary);">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <strong>${countActive} active recommendations</strong> remaining. You have completed <strong>${countCompleted} actions</strong>!
            </div>
          </div>

          <!-- Actions List -->
          <div class="actions-container" role="list">
            ${filteredActions.length === 0 ? `
              <div class="text-center" style="padding: 2rem; border: 1px dashed var(--border-color); border-radius: var(--radius-md);">
                <p style="color: var(--text-secondary);">No active actions found in this category.</p>
              </div>
            ` : filteredActions.map(action => this.renderActionCard(action)).join('')}
          </div>
        </section>
      `;

      this.bindEvents();
    } catch (error) {
      console.error('Failed to render ActionsComponent:', error);
      this.container.innerHTML = `
        <div class="alert-banner info" role="alert" style="border-color: var(--error-color);">
          <strong style="color: var(--error-color);">Error:</strong> An unexpected error occurred while rendering your actions. Please reload the application.
        </div>
      `;
    }
  }

  /**
   * Helper to return action card markup.
   * 
   * @param {Object} action - Action details.
   * @returns {string} Card HTML.
   * @throws {never} This function does not throw errors.
   */
  renderActionCard(action) {
    return `
      <div class="action-card ${action.completed ? 'completed' : ''}" role="listitem">
        <div class="action-checkbox-container">
          <label for="checkbox-${action.id}" class="sr-only">Mark ${action.title} as ${action.completed ? 'incomplete' : 'complete'}</label>
          <input type="checkbox" id="checkbox-${action.id}" class="action-checkbox" data-id="${action.id}" ${action.completed ? 'checked' : ''} aria-checked="${action.completed}" aria-label="Mark ${action.title} as ${action.completed ? 'incomplete' : 'complete'}">
          <span class="action-checkbox-custom" data-id="${action.id}" aria-hidden="true"></span>
        </div>
        <div class="action-content">
          <span class="action-title">${action.title}</span>
          <p class="action-rationale">${action.rationale}</p>
          
          <div class="action-meta">
            <span class="action-tag ${action.category}">${action.category}</span>
            <span class="action-savings-badge" aria-label="Saves ${action.savings} kilograms of carbon dioxide per week">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              -${action.savings} kg CO2e / week
            </span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Binds click and state modifications.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  bindEvents() {
    const checkboxElements = this.container.querySelectorAll('.action-checkbox');
    checkboxElements.forEach(checkbox => {
      checkbox.addEventListener('change', (event) => {
        const actionId = event.target.getAttribute('data-id');
        this.toggleActionCompletion(actionId);
      });
    });

    const customCheckboxElements = this.container.querySelectorAll('.action-checkbox-custom');
    customCheckboxElements.forEach(boxElement => {
      boxElement.addEventListener('click', () => {
        const actionId = boxElement.getAttribute('data-id');
        const hiddenCheckbox = this.container.querySelector(`#checkbox-${actionId}`);
        if (hiddenCheckbox) {
          hiddenCheckbox.checked = !hiddenCheckbox.checked;
          hiddenCheckbox.dispatchEvent(new Event('change'));
        }
      });
    });

    const filterButtonElements = this.container.querySelectorAll('[data-filter]');
    filterButtonElements.forEach(button => {
      button.addEventListener('click', () => {
        this.currentFilter = button.getAttribute('data-filter');
        this.render();
      });
    });
  }

  /**
   * Toggles completion status.
   * 
   * @param {string} id - Action ID.
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  toggleActionCompletion(id) {
    const isCompleted = stateManager.toggleAction(id);
    const action = this.state.actions.find(currentAction => currentAction.id === id);
    
    if (action) {
      const message = `Action "${action.title}" marked as ${isCompleted ? 'completed' : 'active'}. Your streak is now ${stateManager.state.streak} days.`;
      this.announce(message);
    }
  }

  /**
   * Screen reader utility.
   * 
   * @param {string} message - Message to read.
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  announce(message) {
    const announcer = document.getElementById('screen-reader-announcer');
    if (announcer) {
      announcer.textContent = message;
    }
  }
}
