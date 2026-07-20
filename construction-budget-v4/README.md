<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Construction Budget V4

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

AI features (budget parsing, cost estimation, scope audit, bulk photo tagging) call Claude Opus 4.8 through a server-side proxy (`api/claude.ts`) and **do not work under plain `npm run dev`** — Vite doesn't run Vercel serverless functions locally. See `CLAUDE.md` for details on deploying with `ANTHROPIC_API_KEY` configured.
