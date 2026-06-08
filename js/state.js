/**
 * @fileoverview State management for EcoPulse.
 * Handles loading, saving, sanitizing, and updating the application state.
 */

/**
 * Safely sanitizes string inputs to prevent XSS.
 * @param {string} str - Unsanitized input.
 * @returns {string} Sanitized output.
 */
export function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"']/g, (m) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[m] || m;
  });
}

/**
 * Default initial state configuration.
 */
const DEFAULT_STATE = {
  onboarded: false,
  profile: {
    name: '',
    gridRegion: 'national-avg', // 'coal-heavy', 'national-avg', 'hydro-clean'
    transitMode: 'gas-car',     // 'gas-car', 'ev', 'transit', 'active'
    transitMiles: 0,
    dietType: 'average',        // 'meat-heavy', 'average', 'vegetarian', 'vegan'
    electricityKwh: 0,
    gasTherms: 0
  },
  actions: [],
  streak: 0,
  lastStreakDate: null
};

class StateManager {
  constructor() {
    this.key = 'ecopulse_state';
    this.state = this.loadState();
    this.listeners = new Set();
  }

  /**
   * Loads the state from localStorage, falling back to defaults.
   * @returns {Object} App state object.
   */
  loadState() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge with defaults to ensure structural integrity
        return {
          ...DEFAULT_STATE,
          ...parsed,
          profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) },
          actions: parsed.actions || []
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_STATE)); // deep clone
  }

  /**
   * Saves the state to localStorage and alerts listeners.
   */
  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  /**
   * Registers a listener callback for state changes.
   * @param {Function} listener
   */
  subscribe(listener) {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifies all listeners of state changes.
   */
  notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.state);
      } catch (e) {
        console.error('Error notifying listener:', e);
      }
    }
  }

  /**
   * Updates user profile state with sanitization and validation.
   * @param {Object} profileUpdate
   */
  updateProfile(profileUpdate) {
    const updated = { ...this.state.profile };

    if (profileUpdate.name !== undefined) {
      updated.name = sanitizeString(profileUpdate.name).trim();
    }
    if (profileUpdate.gridRegion !== undefined) {
      const validRegions = ['coal-heavy', 'national-avg', 'hydro-clean'];
      if (validRegions.includes(profileUpdate.gridRegion)) {
        updated.gridRegion = profileUpdate.gridRegion;
      }
    }
    if (profileUpdate.transitMode !== undefined) {
      const validTransit = ['gas-car', 'ev', 'transit', 'active'];
      if (validTransit.includes(profileUpdate.transitMode)) {
        updated.transitMode = profileUpdate.transitMode;
      }
    }
    if (profileUpdate.transitMiles !== undefined) {
      const miles = parseFloat(profileUpdate.transitMiles);
      updated.transitMiles = isNaN(miles) || miles < 0 ? 0 : miles;
    }
    if (profileUpdate.dietType !== undefined) {
      const validDiets = ['meat-heavy', 'average', 'vegetarian', 'vegan'];
      if (validDiets.includes(profileUpdate.dietType)) {
        updated.dietType = profileUpdate.dietType;
      }
    }
    if (profileUpdate.electricityKwh !== undefined) {
      const kwh = parseFloat(profileUpdate.electricityKwh);
      updated.electricityKwh = isNaN(kwh) || kwh < 0 ? 0 : kwh;
    }
    if (profileUpdate.gasTherms !== undefined) {
      const therms = parseFloat(profileUpdate.gasTherms);
      updated.gasTherms = isNaN(therms) || therms < 0 ? 0 : therms;
    }

    this.state.profile = updated;
    this.state.onboarded = true;
    this.save();
  }

  /**
   * Sets the active micro-actions list.
   * @param {Array<Object>} actions
   */
  setActions(actions) {
    this.state.actions = actions.map(action => ({
      id: sanitizeString(action.id),
      title: sanitizeString(action.title),
      category: sanitizeString(action.category),
      savings: parseFloat(action.savings) || 0,
      rationale: sanitizeString(action.rationale),
      completed: !!action.completed
    }));
    this.save();
  }

  /**
   * Toggles the completion status of a micro-action.
   * @param {string} actionId
   * @returns {boolean} New completed status, or null if action not found.
   */
  toggleAction(actionId) {
    const action = this.state.actions.find(a => a.id === actionId);
    if (action) {
      action.completed = !action.completed;
      this.updateStreak(action.completed);
      this.save();
      return action.completed;
    }
    return null;
  }

  /**
   * Updates user streak based on completed actions.
   * @param {boolean} isCompleted - Whether an action was marked complete.
   */
  updateStreak(isCompleted) {
    if (!isCompleted) return; // Only increment when finishing an action
    
    const todayStr = new Date().toISOString().split('T')[0];
    if (this.state.lastStreakDate !== todayStr) {
      this.state.streak += 1;
      this.state.lastStreakDate = todayStr;
    }
  }

  /**
   * Completely resets state back to default configuration.
   */
  reset() {
    this.state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this.save();
  }
}

export const stateManager = new StateManager();
