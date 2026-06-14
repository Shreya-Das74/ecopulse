/**
 * @fileoverview Main orchestrator and entry point for EcoPulse.
 * Handles client-side view routing, header updates, and reactive component rendering.
 * Bootstraps the UI layer on top of the secure Data layer.
 */

import { stateManager } from './Data/State.js';
import { OnboardingComponent } from './UI/Onboarding.js';
import { DashboardComponent } from './UI/Dashboard.js';
import { ActionsComponent } from './UI/Actions.js';
import { CoachComponent } from './UI/Coach.js';

class App {
  /**
   * Initializes App DOM references.
   * 
   * @throws {never} This constructor does not throw errors.
   */
  constructor() {
    this.appRoot = document.getElementById('app-root');
    this.mainNav = document.getElementById('main-nav');
    this.streakIndicator = document.getElementById('streak-indicator');
    this.streakCount = document.getElementById('streak-count');
    
    this.navDashboard = document.getElementById('nav-dashboard');
    this.navActions = document.getElementById('nav-actions');
    this.navReset = document.getElementById('nav-reset');

    this.activeView = 'dashboard'; 
  }

  /**
   * Initializes listeners and starts state subscription.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  init() {
    this.navDashboard.addEventListener('click', () => this.switchView('dashboard'));
    this.navActions.addEventListener('click', () => this.switchView('actions'));
    this.navReset.addEventListener('click', () => this.handleReset());

    // Subscribe to state changes for automatic, reactive updates
    stateManager.subscribe((state) => this.render(state));

    // Initial render
    this.render(stateManager.state);
  }

  /**
   * Switches the active view route and triggers a re-render.
   * Shifts keyboard focus to the main content container.
   * 
   * @param {string} view - 'dashboard' or 'actions'.
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  switchView(view) {
    this.activeView = view;
    this.updateNavigationUI();
    this.render(stateManager.state);

    // Shift focus to main content container to assist screen readers
    const mainContentElement = document.getElementById('main-content');
    if (mainContentElement) {
      mainContentElement.focus();
    }
  }

  /**
   * Updates CSS active classes and accessibility focus tags on header links.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  updateNavigationUI() {
    if (this.activeView === 'dashboard') {
      this.navDashboard.classList.add('active');
      this.navDashboard.setAttribute('aria-current', 'page');
      this.navActions.classList.remove('active');
      this.navActions.removeAttribute('aria-current');
    } else {
      this.navActions.classList.add('active');
      this.navActions.setAttribute('aria-current', 'page');
      this.navDashboard.classList.remove('active');
      this.navDashboard.removeAttribute('aria-current');
    }
  }

  /**
   * Prompts user before clearing state data and returning to onboarding.
   * 
   * @returns {void}
   * @throws {never} This function does not throw errors.
   */
  handleReset() {
    const confirmed = confirm('Are you sure you want to reset your EcoPulse profile? This will permanently delete your tracked stats, streak, and checklist.');
    if (confirmed) {
      stateManager.reset();
      this.activeView = 'dashboard';
      this.updateNavigationUI();
      
      const announcer = document.getElementById('screen-reader-announcer');
      if (announcer) {
        announcer.textContent = 'Profile has been reset. Returning to onboarding step 1.';
      }
    }
  }

  /**
   * Core rendering engine. Dynamically loads pages based on onboarding completeness.
   * Wraps rendering in a try-catch block for resilience.
   * 
   * @param {Object} state - Current read-only application state.
   * @returns {void}
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  render(state) {
    try {
      if (!state.onboarded) {
        this.mainNav.style.display = 'none';
        this.streakIndicator.style.display = 'none';

        const onboarding = new OnboardingComponent(this.appRoot, () => {
          this.activeView = 'dashboard';
          this.updateNavigationUI();
          this.render(stateManager.state);
        });
        onboarding.render();
      } else {
        this.mainNav.style.display = 'block';
        
        this.streakIndicator.style.display = 'inline-flex';
        this.streakCount.textContent = `${state.streak} Action${state.streak === 1 ? '' : 's'}`;

        if (this.activeView === 'dashboard') {
          const dashboard = new DashboardComponent(this.appRoot, state);
          dashboard.render();

          const coachContainer = document.getElementById('dashboard-coach-panel');
          if (coachContainer) {
            const coach = new CoachComponent(coachContainer, state);
            coach.render();
          }
        } else {
          const actionsList = new ActionsComponent(this.appRoot, state);
          actionsList.render();
        }
      }
    } catch (error) {
      console.error('App render encountered an error:', error);
      this.appRoot.innerHTML = `
        <div class="alert-banner info" role="alert" style="border-color: var(--error-color); max-width: 600px; margin: 2rem auto;">
          <strong style="color: var(--error-color);">Application Error:</strong> EcoPulse encountered a critical error while updating the screen. Please try resetting your profile or reloading.
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
