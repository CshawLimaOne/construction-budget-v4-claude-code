# Construction Budget V4 — Claude Code Guide

## Project Overview

A React + TypeScript web app for managing construction project budgets. It replicates a detailed spreadsheet format and supports property details, project scope, AI-assisted estimation, GC onboarding, walkthrough dashboards, and more.

AI features (budget parsing, cost estimation, scope audit, bulk photo tagging) call Claude Opus 4.8 via `@anthropic-ai/sdk`, through a Vercel serverless function (`api/claude.ts`) rather than directly from the browser - the client never holds an API key. **`npm run dev` cannot exercise these features** since Vite doesn't run Vercel functions locally; they only work once deployed (or via `vercel dev`).

---

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build tool)
- **Tailwind CSS** (via CDN in dev)
- **Shepherd.js** — guided onboarding tours
- **SheetJS (xlsx)** — parsing uploaded `.xlsx` budget files
- **@anthropic-ai/sdk** — Claude Opus 4.8 for estimation, budget parsing, scope audit, bulk photo tagging (server-side only, via `api/claude.ts`)

---

## Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. AI features require a deployed environment
The app itself needs no local API key. AI calls go through `api/claude.ts` (a Vercel serverless function), which reads `ANTHROPIC_API_KEY` from the server's environment - set that in the Vercel project's environment variables (or the equivalent for wherever `api/claude.ts` is deployed). There is nothing to configure in `.env.local` for this to work locally, because it *can't* work locally under plain `npm run dev` (see below).

### 3. Run in dev mode
```bash
npm run dev
```

The app opens at http://localhost:5173

---

## Environment Variables

| Variable | Required | Where it's set | Description |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes, for AI features | Server-side only (Vercel project settings, not `.env.local`) | Used by `api/claude.ts` to call Claude. Never exposed to the client. |

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
├── api/
│   └── claude.ts            # Vercel serverless function — holds ANTHROPIC_API_KEY, proxies Claude calls
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
│   ├── offlineStorage.ts   # IndexedDB for offline assets
│   ├── claudeClient.ts     # Client-side helper: POSTs to /api/claude for structured AI output
│   ├── budgetMath.ts       # roundBudget() — whole-dollar rounding
│   └── itemNumbering.ts    # computeMaxItemSuffix() — item # generation for AI-created items
├── walkthroughConstants.ts  # Room/item definitions for walkthrough
└── tutorialSteps.ts         # Shepherd.js tour step definitions
```

---

## Key Architectural Patterns

- **All state is centralized in `App.tsx`** — passed down as props. There is no global state library (no Redux/Zustand).
- **AI calls go through `callClaudeForStructuredOutput()`** (`utils/claudeClient.ts`), which POSTs to `/api/claude` (a Vercel serverless function) using a forced tool call for structured JSON output. Look for that function's usage in `App.tsx`, `ScopeAuditModal.tsx`, and `BulkPhotoUploader.tsx` for the pattern. All migrated features use `CLAUDE_MODELS.OPUS` (`constants.ts`).
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
