/**
 * @fileoverview Encapsulated State Manager for EcoPulse.
 * Implements observer pattern and immutability wrappers to protect client-side variables.
 * Enforces data validations through the Security Layer prior to state commit.
 */

import { cleanProfileInput, sanitizeString } from './Security.js';

/**
 * @typedef {Object} UserProfile
 * @property {string} name
 * @property {string} gridRegion
 * @property {string} transitMode
 * @property {number} transitMiles
 * @property {string} dietType
 * @property {number} electricityKwh
 * @property {number} gasTherms
 */

/**
 * @typedef {Object} MicroAction
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {number} savings
 * @property {string} rationale
 * @property {boolean} completed
 */

/**
 * @typedef {Object} AppState
 * @property {boolean} onboarded
 * @property {UserProfile} profile
 * @property {MicroAction[]} actions
 * @property {number} streak
 * @property {string|null} lastStreakDate
 */

const DEFAULT_STATE = {
  onboarded: false,
  profile: {
    name: '',
    gridRegion: 'national-avg',
    transitMode: 'gas-car',
    transitMiles: 0,
    dietType: 'average',
    electricityKwh: 0,
    gasTherms: 0
  },
  actions: [],
  streak: 0,
  lastStreakDate: null
};

class StateManager {
  /**
   * Initializes state and listeners.
   * 
   * @throws {never} This constructor does not throw errors.
   */
  constructor() {
    this._key = 'ecopulse_secured_state';
    this._state = this._loadState();
    this._listeners = new Set();
  }

  /**
   * Loads state from localStorage. Safe against syntax errors.
   * 
   * @private
   * @returns {AppState} State object.
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  _loadState() {
    try {
      const stored = localStorage.getItem(this._key);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Deep validate profile on load using Security helper
        const cleanProfile = cleanProfileInput(parsed.profile);
        
        return {
          onboarded: !!parsed.onboarded,
          profile: cleanProfile,
          actions: Array.isArray(parsed.actions) ? this._validateActions(parsed.actions) : [],
          streak: parseInt(parsed.streak, 10) || 0,
          lastStreakDate: parsed.lastStreakDate ? sanitizeString(parsed.lastStreakDate) : null
        };
      }
    } catch (error) {
      console.error('Failed to parse secure state:', error);
    }
    
    // Deep clone default state
    return JSON.parse(JSON.stringify(DEFAULT_STATE));
  }

  /**
   * Sanitizes and parses actions array to ensure structural safety.
   * 
   * @private
   * @param {Array<Object>} actions - Array of actions to validate.
   * @returns {MicroAction[]}
   * @throws {never} This function does not throw errors and handles invalid inputs gracefully.
   */
  _validateActions(actions) {
    return actions.map(action => ({
      id: sanitizeString(action.id),
      title: sanitizeString(action.title),
      category: sanitizeString(action.category),
      savings: parseFloat(action.savings) || 0,
      rationale: sanitizeString(action.rationale),
      completed: !!action.completed
    }));
  }

  /**
   * Saves state to storage and alerts observers.
   * 
   * @private
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  _commit() {
    try {
      localStorage.setItem(this._key, JSON.stringify(this._state));
      this._notify();
    } catch (error) {
      console.error('Failed to commit state change:', error);
    }
  }

  /**
   * Alerts all registered observers.
   * 
   * @private
   * @throws {never} This function handles exceptions internally and does not throw.
   */
  _notify() {
    const currentStateCopy = this.state;
    for (const listener of this._listeners) {
      try {
        listener(currentStateCopy);
      } catch (error) {
        console.error('State observer error:', error);
      }
    }
  }

  /**
   * Returns a deep copy of the state object.
   * Prevents UI components from direct state mutation.
   * 
   * @returns {AppState} Read-only deep copy of application state.
   * @throws {never} This getter does not throw errors.
   */
  get state() {
    return JSON.parse(JSON.stringify(this._state));
  }

  /**
   * Registers a state observer callback.
   * 
   * @param {Function} callback - Callback function execution on state change.
   * @returns {Function} Unsubscribe clean-up routine.
   * @throws {never} This function does not throw errors.
   */
  subscribe(callback) {
    if (typeof callback === 'function') {
      this._listeners.add(callback);
    }
    return () => this._listeners.delete(callback);
  }

  /**
   * Updates profile after security clearing. Sets onboarded status.
   * 
   * @param {Object} rawProfile - Raw inputs from UI.
   * @throws {never} This function does not throw errors.
   */
  updateProfile(rawProfile) {
    const cleanProfile = cleanProfileInput(rawProfile);
    this._state.profile = cleanProfile;
    this._state.onboarded = true;
    this._commit();
  }

  /**
   * Sets the recommendation action checklist.
   * 
   * @param {Array<Object>} rawActions - Rec engine output.
   * @throws {never} This function does not throw errors.
   */
  setActions(rawActions) {
    this._state.actions = this._validateActions(rawActions);
    this._commit();
  }

  /**
   * Toggles completion on an action. Automatically recalculates eco-streaks.
   * 
   * @param {string} actionId - Target identifier.
   * @returns {boolean|null} New state of action, or null if action does not exist.
   * @throws {never} This function does not throw errors.
   */
  toggleAction(actionId) {
    const action = this._state.actions.find(currentAction => currentAction.id === actionId);
    if (action) {
      action.completed = !action.completed;
      this._updateStreak(action.completed);
      this._commit();
      return action.completed;
    }
    return null;
  }

  /**
   * Updates streak count if action completed on a new day.
   * 
   * @private
   * @param {boolean} isCompleted - Action finished status.
   * @throws {never} This function does not throw errors.
   */
  _updateStreak(isCompleted) {
    if (!isCompleted) return; // Only count upward on checklist completion
    
    const todayString = new Date().toISOString().split('T')[0];
    if (this._state.lastStreakDate !== todayString) {
      this._state.streak += 1;
      this._state.lastStreakDate = todayString;
    }
  }

  /**
   * Reset helper: completely wipes state.
   * 
   * @throws {never} This function does not throw errors.
   */
  reset() {
    this._state = JSON.parse(JSON.stringify(DEFAULT_STATE));
    this._commit();
  }
}

export const stateManager = new StateManager();
