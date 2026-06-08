# EcoPulse 🍀

**EcoPulse** is an empathetic, privacy-first, and highly efficient carbon footprint tracker and sustainability coach. Engineered using **Domain-Driven Design (DDD)** and strict modular separation of concerns, the codebase features zero runtime dependencies and stays well under 100 KB.

All data calculations are executed entirely on the client, ensuring complete user privacy.

---

## 🏗️ System Architecture & Codebase Layout

The project separates core business mathematical logic, data persistence, sanitization validation, and rendering layers:

```
ecopulse/
├── index.html               # Accessible HTML5 template with ARIA live region
├── package.json             # ES Module script and test configurations
├── README.md                # Technical system documentation
├── css/
│   └── style.css            # Dark-mode-first glassmorphic visual styles & design variables
├── js/
│   ├── app.js               # Router, event hub, and main application orchestrator
│   ├── Domain/
│   │   ├── Calculator.js    # Immutable carbon math functions (isolated domain layer)
│   │   └── Engine.js        # Rules-based recommendation engine matching profile context to actions
│   ├── Data/
│   │   ├── State.js         # Reactive LocalStorage-backed state with immutable state wrappers
│   │   └── Security.js      # OWASP XSS defense, regex name matching, and numeric range bounds checking
│   └── UI/
│       ├── Onboarding.js    # Multi-step questionnaire wizard
│       ├── Dashboard.js     # Carbon breakdown, circular SVG progress gauge, and coach details
│       ├── Actions.js       # Recommendations checklist with tag categories
│       └── Coach.js         # Coach dialog bubble and active savings tracker
└── __tests__/
    ├── security.test.js     # Sanitization, XSS checks, and error boundaries
    ├── calculator.test.js   # Calculations edge-case and boundary verification
    ├── engine.test.js       # Context-to-action integration tests
    └── run-tests.js         # Lightweight Node-native test runner
```

---

## 🔒 Security Safeguards & Privacy Mandates

EcoPulse prioritizes browser-side security and data integrity:

1. **XSS & Injection Protection (`Data/Security.js`):**
   * **HTML Escaping:** All user-provided strings are escaped using entity replacement mappings (`&`, `<`, `>`, `"`, `'`) before state saving or page insertion.
   * **Regex Name Validation:** Enforces the pattern `/^[a-zA-Z\s\-']{1,50}$/`. Anything outside this is rejected, blocking script injections (e.g. `<script>`).
2. **Numeric Boundary Checking:**
   * User values (miles, electricity, gas) are parsed, checked against hard limits (e.g., maximum monthly kWh of 10000), and fallback to `0` if invalid or negative, preventing mathematical overflows or negative emissions.
3. **Data Encapsulation & Immutability (`Data/State.js`):**
   * The application state is encapsulated in a class container. 
   * When components query state, it returns a **deep cloned copy** (`JSON.parse(JSON.stringify(this._state))`), ensuring components cannot directly mutate state variables. All changes must go through explicit state methods.
4. **Zero API Risks:**
   * The app is fully client-side. There are no API keys, credentials, or third-party tracking scripts.

---

## 🧪 Advanced Automated Test Suite

EcoPulse includes a zero-dependency, lightweight, native test suite testing math, security, and context-driven integration rules.

### Test Coverage Map

| Test Suite | File Path | Focus Area | Verified Scenarios |
| :--- | :--- | :--- | :--- |
| **Security & Validation** | `__tests__/security.test.js` | Injection Defense & Graceful recovery | Script tags sanitization, name format regex, numeric range clamping, corrupted payload fallbacks. |
| **Carbon Calculator** | `__tests__/calculator.test.js` | Emission math algorithms | Transit mode factors, clean/dirty electrical grids, dietary footprints, negative values, non-numeric fallbacks. |
| **Decision Engine** | `__tests__/engine.test.js` | Context-to-action matching | Heavy gas driver triggers carpooling actions, coal grid triggers off-peak appliance schedules, vegan diet triggers food waste rules. |

### How to Run Tests
To run the automated suite:
```bash
npm test
```

---

## ⚡ Setup & Development

### 1. Run Development Server
To run locally, start a lightweight web server to support ES Module imports:
```bash
npx http-server -p 8080
```
Open `http://localhost:8080` in your web browser.
