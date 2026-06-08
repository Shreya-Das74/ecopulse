/**
 * @fileoverview Main orchestrator and entry point for EcoPulse.
 * Handles client-side view routing, header updates, and reactive component rendering.
 */

import { stateManager } from './state.js';
import { OnboardingComponent } from './components/onboarding.js';
import { DashboardComponent } from './components/dashboard.js';
import { ActionsComponent } from './components/actions.js';
import { CoachComponent } from './components/coach.js';

class App {
  constructor() {
    this.appRoot = document.getElementById('app-root');
    this.mainNav = document.getElementById('main-nav');
    this.streakIndicator = document.getElementById('streak-indicator');
    this.streakCount = document.getElementById('streak-count');
    
    this.navDashboard = document.getElementById('nav-dashboard');
    this.navActions = document.getElementById('nav-actions');
    this.navReset = document.getElementById('nav-reset');

    // Routing parameter
    this.activeView = 'dashboard'; // 'dashboard' | 'actions'
  }

  /**
   * Initializes listeners and starts subscription.
   */
  init() {
    // Register event listeners for navigation header buttons
    this.navDashboard.addEventListener('click', () => this.switchView('dashboard'));
    this.navActions.addEventListener('click', () => this.switchView('actions'));
    this.navReset.addEventListener('click', () => this.handleReset());

    // Subscribe to state modifications for reactive rendering
    stateManager.subscribe((state) => this.render(state));

    // Execute first rendering cycle with initial state
    this.render(stateManager.state);
  }

  /**
   * Switches the active view route and triggers a re-render.
   * @param {string} view - 'dashboard' or 'actions'.
   */
  switchView(view) {
    this.activeView = view;
    this.updateNavigationUI();
    this.render(stateManager.state);
  }

  /**
   * Updates CSS classes and accessibility current-attributes on header navigation.
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
   * Prompts user before clearing state data and resetting to onboarding.
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
   * Core rendering orchestrator. Builds views dynamically based on onboarding status.
   * @param {Object} state - Current application state.
   */
  render(state) {
    if (!state.onboarded) {
      // Hide dashboard navigation elements
      this.mainNav.style.display = 'none';
      this.streakIndicator.style.display = 'none';

      // Load Onboarding wizard
      const onboarding = new OnboardingComponent(this.appRoot, () => {
        // Callback executed upon completion
        this.activeView = 'dashboard';
        this.updateNavigationUI();
        this.render(stateManager.state);
      });
      onboarding.render();
    } else {
      // Show navigation elements
      this.mainNav.style.display = 'block';
      
      // Update streak indicator
      this.streakIndicator.style.display = 'inline-flex';
      this.streakCount.textContent = `${state.streak} Action${state.streak === 1 ? '' : 's'}`;

      // Render the current view page
      if (this.activeView === 'dashboard') {
        const dashboard = new DashboardComponent(this.appRoot, state);
        dashboard.render();

        // Render the Coach component inside the dashboard grid panel
        const coachContainer = document.getElementById('dashboard-coach-panel');
        if (coachContainer) {
          const coach = new CoachComponent(coachContainer, state);
          coach.render();
        }
      } else {
        // Actions list view
        const actionsList = new ActionsComponent(this.appRoot, state);
        actionsList.render();
      }
    }
  }
}

// Bootstrap on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
