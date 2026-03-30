# Construction Budget V4 — Claude Code Guide

## Project Overview

A React + TypeScript web app for managing construction project budgets. It replicates a detailed spreadsheet format and supports property details, project scope, AI-assisted estimation, GC onboarding, walkthrough dashboards, and more.

Originally built for Google AI Studio (uses `@google/genai` / Gemini). **To run locally you need a Gemini API key.**

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (via CDN in dev)
- **Shepherd.js** — guided onboarding tours
- **SheetJS (xlsx)** — parsing uploaded `.xlsx` budget files
- **@google/genai** — Gemini AI for estimation, budget parsing, scope generation

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Set your Gemini API key
```bash
cp .env.local.example .env.local
# Then edit .env.local and paste your key
```

Get a key at https://aistudio.google.com/app/apikey

### 3. Run in dev mode
```bash
npm run dev
```

The app opens at http://localhost:5173

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key |

---

## Project Structure

```
construction-budget-v4/
├── App.tsx                  # Root component — all state lives here
├── index.tsx                # Widget entry point (mount/unmount API)
├── index.html               # HTML shell
├── types.ts                 # All TypeScript types/interfaces
├── constants.ts             # Initial state, config, AI system prompts
├── styles.css               # Custom CSS (Tailwind extended)
├── vite.config.ts           # Vite config (UMD widget build)
├── components/
│   ├── Step1Form.tsx        # Property details step
│   ├── Step2Budget.tsx      # Line-item budget entry (main view)
│   ├── Step2Contractor.tsx  # GC / contractor details
│   ├── Step4Review.tsx      # Review & submission
│   ├── Sidebar.tsx          # Navigation sidebar
│   ├── WelcomeScreen.tsx    # Landing/onboarding screen
│   ├── AIReviewModal.tsx    # AI budget review & reconciliation
│   ├── EstimatorModal.tsx   # AI cost estimator
│   ├── WalkthroughDashboard.tsx  # Property walkthrough tracker
│   ├── WalkthroughRoomView.tsx   # Room-level walkthrough
│   ├── AnalystReport.tsx    # Deal analysis report
│   ├── PrintableReport.tsx  # Print-friendly output
│   └── ...many more
├── utils/
│   ├── riskEngine.ts        # Risk score + deal grade calculations
│   ├── scoring.ts           # Application strength scoring
│   ├── budgetGuidanceEngine.ts  # Budget validation guidance
│   └── offlineStorage.ts   # IndexedDB for offline assets
├── walkthroughConstants.ts  # Room/item definitions for walkthrough
└── tutorialSteps.ts         # Shepherd.js tour step definitions
```

---

## Key Architectural Patterns

- **All state is centralized in `App.tsx`** — passed down as props. There is no global state library (no Redux/Zustand).
- **AI calls use `@google/genai`** via the `GEMINI_API_KEY` env var. Look for `GoogleGenAI` usage in `App.tsx` for the pattern.
- **Budget data** is stored as `BudgetCategoryData[]` — categories containing `BudgetItem[]`. See `types.ts`.
- **Local persistence** uses `localStorage` (key: `constructionBudgetData_v4`) + IndexedDB for binary assets (photos).
- The app can run as a **standalone widget** (UMD build) mounted via `window.ConstructionBudget.mount()`, or as a standard SPA in dev.

---

## Build for Production (Widget)

```bash
npm run build
```

Outputs `dist/construction-budget-widget.umd.js` — a self-contained bundle with CSS injected. Embed in any HTML page:

```html
<div id="construction-budget-app"></div>
<script src="construction-budget-widget.umd.js"></script>
<script>ConstructionBudget.mount();</script>
```

---

## Common Tasks for Claude Code

- **Add a new budget category**: Add to `INITIAL_BUDGET_CATEGORIES` in `constants.ts` and the `BudgetCategoryData` type in `types.ts`.
- **Add a new form field**: Add to `PropertyDetails` in `types.ts`, `INITIAL_PROPERTY_DETAILS` in `constants.ts`, and the JSX in `Step1Form.tsx`.
- **Modify AI prompts**: Edit `ESTIMATOR_SYSTEM_INSTRUCTION` or `BUDGET_PARSER_SYSTEM_INSTRUCTION` in `constants.ts`.
- **Add a new route/view**: Add a value to the `currentView` state in `App.tsx` and a conditional render block.
- **Style changes**: Use Tailwind utility classes directly in JSX. Global overrides go in `styles.css`.
