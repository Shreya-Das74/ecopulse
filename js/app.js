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
   * 
   * @param {string} view - 'dashboard' or 'actions'.
   */
  switchView(view) {
    this.activeView = view;
    this.updateNavigationUI();
    this.render(stateManager.state);
  }

  /**
   * Updates CSS active classes and accessibility focus tags on header links.
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
   * 
   * @param {Object} state - Current read-only application state.
   */
  render(state) {
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
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
