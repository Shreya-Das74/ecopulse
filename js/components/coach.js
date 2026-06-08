/**
 * @fileoverview Sustainability Coach component for EcoPulse.
 * Provides encouragement, calculates current weekly savings, and motivates action.
 */

export class CoachComponent {
  /**
   * @param {HTMLElement} container - Target mount element.
   * @param {Object} state - Application state object.
   */
  constructor(container, state) {
    this.container = container;
    this.state = state;
  }

  /**
   * Renders the sustainability coach feedback bubble and stats.
   */
  render() {
    const { profile, actions, streak } = this.state;
    
    // Calculate completed statistics
    const completedActions = actions.filter(a => a.completed);
    const completedCount = completedActions.length;
    const weeklySavings = completedActions.reduce((sum, a) => sum + a.savings, 0);
    const roundedSavings = Math.round(weeklySavings * 10) / 10;

    // Dynamically adjust coach recommendation speech
    let coachMessage = '';
    
    if (completedCount === 0) {
      coachMessage = `Welcome to your sustainability plan, <strong>${profile.name}</strong>! I've analyzed your profile and suggested several high-impact Micro-Actions below. Try checking one off to kickstart your green streak.`;
    } else if (streak >= 5) {
      coachMessage = `Wow, <strong>${profile.name}</strong>! A <strong>${streak}-action streak</strong> is outstanding! You're making real, measurable changes to our atmosphere. Keep that momentum going!`;
    } else if (completedCount > 0) {
      coachMessage = `Fantastic effort, <strong>${profile.name}</strong>! By completing <strong>${completedCount} action${completedCount > 1 ? 's' : ''}</strong>, you are preventing <strong>${roundedSavings} kg of CO2e</strong> from entering the atmosphere every single week! Which action is next?`;
    }

    // Edge cases / specialized recommendations
    if (completedCount === 0 && profile.gridRegion === 'coal-heavy') {
      coachMessage = `Hi <strong>${profile.name}</strong>! Since you live in a region with a coal-heavy grid, scheduling energy-intensive chores (like laundry) for off-peak hours is your absolute best starting point. Let's do it!`;
    } else if (completedCount === 0 && profile.transitMode === 'gas-car' && profile.transitMiles > 150) {
      coachMessage = `Greetings, <strong>${profile.name}</strong>! Your driving emissions represent your biggest footprint slice. Adopting eco-driving practices or carpooling once a week will make an immediate splash!`;
    }

    this.container.innerHTML = `
      <section class="card" aria-labelledby="coach-panel-title" style="border-color: var(--accent-light);">
        <h2 id="coach-panel-title" class="sr-only">Sustainability Coach</h2>
        
        <div class="coach-header">
          <div class="coach-avatar" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>
          <div>
            <h3 style="font-size: 1.25rem;">EcoPulse Coach</h3>
            <p style="font-size: 0.8rem; color: var(--text-secondary);">Your AI Sustainability Guide</p>
          </div>
        </div>

        <div class="coach-speech-bubble" aria-live="polite">
          <p>${coachMessage}</p>
        </div>

        <!-- Coach Stats -->
        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <span style="font-size: 0.9rem; color: var(--text-secondary);">Actions Completed</span>
            <span style="font-weight: 700; font-size: 1.1rem; color: var(--accent-secondary);">${completedCount}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.75rem;">
            <span style="font-size: 0.9rem; color: var(--text-secondary);">Active Savings</span>
            <span style="font-weight: 700; font-size: 1.1rem; color: var(--accent-primary);">${roundedSavings} kg CO2e / wk</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.25rem;">
            <span style="font-size: 0.9rem; color: var(--text-secondary);">Eco-Streak</span>
            <span class="coach-stat-pill" style="margin: 0; padding: 0.25rem 0.75rem;">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="stroke: var(--accent-primary);">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
              ${streak} Action${streak === 1 ? '' : 's'}
            </span>
          </div>
        </div>
      </section>
    `;
  }
}
