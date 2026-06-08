# EcoPulse 🍀

**EcoPulse** is an empathetic, privacy-first, and highly efficient carbon footprint tracker and personalized sustainability coach. Built as a single-page application (SPA) with zero external runtime dependencies, the entire repository is extremely lightweight (under 100 KB) and runs entirely in the browser using HTML5, CSS3, and ES Modules.

All user data and calculations are processed and saved locally in `localStorage`, guaranteeing complete data privacy.

---

## 🛠️ System Architecture & Codebase Layout

The codebase follows a modular design separating state, math logic, recommendation rules, and UI components:

```
ecopulse/
├── index.html               # Semantic HTML5 shell with ARIA accessibility hooks
├── package.json             # Module definition and local development scripts
├── README.md                # System documentation
├── css/
│   └── style.css            # Custom HSL-based design system, glassmorphism, & variables
├── js/
│   ├── app.js               # Router, event hub, and main application bootstrap
│   ├── state.js             # Reactive, LocalStorage-backed state with XSS sanitization
│   ├── calculator.js        # Core carbon emission math (transport, energy, diet)
│   ├── engine.js            # Rules-based sustainability recommendation engine
│   └── components/
│       ├── onboarding.js    # Multi-step accessible questionnaire wizard
│       ├── dashboard.js     # Carbon breakdown, gauge visualization, and averages comparison
│       ├── actions.js       # Micro-Actions checklist with category filters
│       └── coach.js         # Empathetic coach panel delivering encouraging messages
└── __tests__/
    ├── calculator.test.js   # Unit tests for emission math
    ├── engine.test.js       # Unit tests for recommendation rules
    └── run-tests.js         # Lightweight Node-native test runner
```

---

## 🧠 Core Calculations & Recommendation Logic

### 1. Carbon Calculations (`calculator.js`)
EcoPulse computes carbon footprints (in **Metric Tons of CO2e per year**) across four main pillars:
*   **Transportation:** 
    *   *Gasoline Cars:* Assumes average fuel efficiency of 22 mpg (~0.40 kg CO2e / mile) multiplied by annual miles.
    *   *Electric Vehicles (EVs):* Multiplies electricity consumed (assumes 3.3 miles per kWh) by the regional electrical grid intensity.
    *   *Public Transit:* Emits ~0.14 kg CO2e / mile.
    *   *Active Transit:* Emits 0.0 kg CO2e.
*   **Home Energy (Electricity):** Computed using monthly kWh consumption multiplied by the regional grid carbon intensity:
    *   *Coal-Heavy Grids:* 0.82 kg CO2e / kWh (e.g., WY, IN, WV).
    *   *National Average Grids:* 0.37 kg CO2e / kWh.
    *   *Hydro-Clean Grids:* 0.04 kg CO2e / kWh (e.g., WA, OR, VT).
*   **Home Energy (Natural Gas):** Computed using monthly therms multiplied by natural gas emission factor (5.3 kg CO2e / therm).
*   **Diet:** Tiered baseline profiles:
    *   *Meat Lover:* 3.3 MT CO2e / year.
    *   *Balanced:* 2.5 MT CO2e / year.
    *   *Vegetarian:* 1.7 MT CO2e / year.
    *   *Vegan:* 1.5 MT CO2e / year.
*   **Waste:** A standard baseline of 0.5 MT CO2e / year per individual.

### 2. Personalized Micro-Actions (`engine.js`)
Instead of generic advice, EcoPulse uses conditional logic on user profile inputs to output custom **Micro-Actions** (e.g. weekly CO2e offsets):
*   *If driving gas vehicles:* Prioritizes actions for **Transit Swapping** (swapping 2 weekly trips) and **Eco-Driving** (e.g. checking tire pressure to improve fuel economy by 10%).
*   *If located in a Coal-Heavy grid:* Triggers actions for **Peak Shaving** (shifting heavy laundry or dishwashing load past 10 PM) and **Vampire Power Mitigation** (unplugging standby appliances).
*   *If meat-heavy diet:* Prioritizes introducing **Meatless Mondays** and swapping dairy milks for oat/soy milk.
*   *If vegan/vegetarian diet:* Highlights **Composting** and **Food Waste Prevention** as the primary agricultural leverage points.

---

## ♿ Accessibility & Inclusive Design (WCAG 2.1 AA)

Accessibility is baked into the foundation:
1.  **Semantic HTML5:** Renders logical structure using `<header>`, `<main>`, `<section>`, and `<nav>`.
2.  **Screen Reader Announcements:** A hidden `aria-live` region (`#screen-reader-announcer`) announces view updates, progress changes, and action completions dynamically.
3.  **Keyboard Navigable:** All buttons, custom options, and checkboxes are keyboard-focusable, supporting clear visual `:focus-visible` outlines in high-contrast cyan (`#22d3ee`).
4.  **High Contrast ratios:** Main colors have a contrast ratio of > 4.5:1 against the dark background, exceeding WCAG 2.1 AA requirements.
5.  **Skip Navigation:** A native "Skip to main content" link is available for keyboard users.

---

## 🔒 Security & Performance

*   **XSS Mitigation:** All text input fields (e.g., username) are sanitized using an HTML entity escape mapping before storing or rendering.
*   **No External Assets:** All icons are inline SVGs. Custom fonts are loaded from Google Fonts. There are no tracking scripts, analytics, or external frameworks.
*   **No NPM Bloat:** Runs entirely on native browser features (Web APIs, ES Modules, localStorage, CSS custom properties) making runtime performance instantaneous.

---

## ⚡ Setup & Testing

### Prerequisites
*   Node.js (v18 or higher recommended) installed locally.

### 1. Install & Start Development Server
Since the application uses ES Modules, it cannot be run directly via `file://` URLs in modern browsers due to CORS security. Start the local server:

```bash
# Start the HTTP server (will listen on http://localhost:8080)
npx http-server -p 8080
```

Open `http://localhost:8080` in your web browser.

### 2. Run Automated Tests
EcoPulse has a custom unit test suite verifying the mathematical calculations and recommendation routing rules. To run:

```bash
npm test
```
This runs `node __tests__/run-tests.js` out-of-the-box with zero third-party testing dependency installations.
