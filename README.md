# AI Triage Inbox

React + TypeScript SPA for triaging a mock support inbox: tabs, filters, pagination, message detail, bulk actions, and an AI-assist side panel with validation against mock “model” responses.

## Setup

**Prerequisites:** Node.js 20+ (LTS recommended) and npm.

1. Clone the repository and open the project root.
2. Install dependencies:
  ```bash
   npm install
  ```
3. Start the dev server (Vite):
  ```bash
   npm run dev
  ```
4. Open the app in the browser. The inbox lives at **`http://localhost:5173/inbox`** (root `/` redirects there).

**Other scripts**

- `npm run build` — TypeScript project references + production bundle.
- `npm run preview` — Serve the production build locally (better for performance-style Lighthouse runs than the dev server).
- `npm run lint` — ESLint.

## Feature summary

- **Inbox list:** Status tabs (New / In Progress / Done), search, priority filter, paginated table with selection.
- **Message detail:** Routed at `/inbox/:messageId`; read/update status, priority, and internal notes.
- **Bulk actions:** Mark selected messages as a chosen status.
- **Mock backend:** `mockNetwork` simulates 200–1200 ms latency and ~10–15% random failures; inbox and AI payloads come from JSON mocks.
- **AI assist panel:** Loads mock AI JSON per message; Zod validates shape; handles invalid JSON and empty states; optional cache store for repeated views.
- **UX:** Loading and error UI for inbox and AI paths; light/dark theme toggle (Tailwind v4).

## Tradeoffs

- **Mock JSON in the bundle** keeps the demo self-contained and easy to review, but increases JS payload versus a real API or lazy-loaded fixtures.
- **Simulated latency and failures** stress loading and error UX at the cost of slower “happy path” demos and noisier Lighthouse runs on dev (`vite` + HMR).
- **Client-only state (Zustand)** avoids backend complexity; refreshes reset data unless you add persistence.
- **Single detail route under `/inbox`** matches a mail-style layout; deep-linking is limited to message id only (no separate “settings” routes, etc.).

## Total hours spent

**16 hours** total, logged in blocks: **2 + 1 + 4 + 3 + 6** (setup → planning / component structure → inbox with channel tabs, search, filters, pagination → message detail edits → AI assist panel). Session notes live in [`TIMELOG.md`](./TIMELOG.md).

## Lighthouse screenshots

Lighthouse artifacts are **not committed** in this repo by default.

- **How to capture:** In Chrome, open DevTools → **Lighthouse** (or **Performance**) → run a report for **`http://localhost:5173/inbox`** (or `http://localhost:4173/inbox` after `npm run build && npm run preview` for a production-like score).
- **Where to put files for submission / review:** add a folder such as **`docs/lighthouse/`** at the project root and store PNG screenshots or exported HTML/JSON reports there, then commit if your brief requires it. If you already keep screenshots elsewhere, point reviewers to that path in your cover note or PR description.

