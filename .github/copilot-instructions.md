## Copilot instructions — HealthSync (concise)

Purpose: give AI coding agents immediate, actionable context so they can make correct edits quickly.

- Project type: Single-page React app built with Vite (entry: `src/index.jsx`, root component `src/App.jsx`). Styles use Tailwind (`src/styles/tailwind.css`, `src/styles/index.css`).
- Key directories: `src/pages` (feature pages), `src/components` (reusable UI), `src/contexts` (AuthContext), `src/utils` (AI & parsing helpers).

Important architecture & data flow notes:

- This is a frontend-only demo/prototype: most persistent state is stored in browser `localStorage`. See keys used in `src/contexts/AuthContext.jsx` (e.g. `authToken`, `userRole`, `sessionStart`) and utils (`doctorAnalyses`, `patientMedicines`).
- Routing is role-based. `src/Routes.jsx` maps roles -> dashboards (`getRoleRoute`) and uses `ProtectedRoute` to enforce `allowedRoles` per route.
- AI features call the Google Generative Language endpoint directly from the client (see `src/utils/aiAnalysis.js` and `src/utils/prescriptionAnalysis.js`). The client expects an API key in `import.meta.env.VITE_GEMINI_API_KEY` sent as `X-goog-api-key` header.
- Vite config: `vite.config.mjs` sets dev server port to `4028`, uses `@dhiwise/component-tagger` plugin and `vite-tsconfig-paths`.

Developer workflows (commands):

- Install: `npm install` (or `yarn install`).
- Dev server: `npm start` runs Vite. Dev server runs on port 4028 as defined in `vite.config.mjs`.
- Build: `npm run build` (produces `dist`).
- Preview: `npm run serve` to preview built output.

Project-specific conventions and gotchas:

- Do NOT remove or modify the `rocketCritical` dependency block in `package.json` — the repo includes a `rocketCritical` hint that some tooling expects (see top-level `package.json`).
- Auth is demo-only: valid demo credentials live in `src/contexts/AuthContext.jsx` and are used for immediate login flows. Changing auth behavior requires updating localStorage keys consistently and `AuthProvider` logic.
- Global UI: `src/components/ui/Toast.jsx` is rendered once from `src/App.jsx` (Toast is included in App.jsx). When adding global notifications, prefer this Toast component so behavior and styling remain consistent.
- LocalStorage-driven features: many flows (sending analyses, medicine lists) write/read `localStorage`. Search for keys in `src/utils` to find where data is saved.

Integration points and external dependencies:

- Gemini API: `src/utils/*Analysis.js` call `https://generativelanguage.googleapis.com/...` and require `VITE_GEMINI_API_KEY` env var. Agents adding AI logic should gate calls behind feature flags or env checks to avoid leaking keys in public builds.
- OCR: Prescription uploads call Azure Computer Vision via `src/services/azureVision.js` (env vars: `VITE_AZURE_VISION_ENDPOINT`, `VITE_AZURE_VISION_KEY`). PDF text extraction still uses `react-pdftotext`/`jspdf` helpers when needed.
- Analytics and charts: `d3` and `recharts` are used in dashboard components under `src/pages/*/components`.

Concrete editing examples an agent may be asked to do:

- Add a new protected route for role `nurse`: update `src/Routes.jsx` (add route entry and include `nurse` in `getRoleRoute`), and ensure the route component uses `<ProtectedRoute allowedRoles={["nurse"]}>`.
- Add a local-only AI stub for development: copy `src/utils/aiAnalysis.js` and mock the fetch call when `import.meta.env.DEV` is true so CI/dev runs don't call external APIs.
- Fix session timeout behavior: `sessionTimeout` is defined in `AuthContext.jsx` (default 30 minutes). To change, update the `sessionTimeout` state and ensure `sessionStart` handling and `extendSession()` remain consistent.

Searchable entry points (use these when you need examples quickly):

- Routing & role mapping: `src/Routes.jsx`
- Auth & session storage: `src/contexts/AuthContext.jsx`
- AI calls & storing results: `src/utils/aiAnalysis.js`, `src/utils/prescriptionAnalysis.js`
- App shell & global UI: `src/App.jsx`, `src/components/ui/Toast.jsx`
- Styles & Tailwind: `src/styles/tailwind.css`, `tailwind.config.js`
- Vite server config & plugins: `vite.config.mjs`

Testing & linting notes:

- The repo includes testing libraries in `package.json` (React Testing Library, Jest helpers) but no test scripts are currently defined. Add tests under `src/__tests__` and update `package.json` scripts if adding CI.

Safety & environment guidance for agents:

- Never hardcode real API keys into code or commit env files. Use `import.meta.env.VITE_GEMINI_API_KEY` or a `.env` file excluded from source control.
- Because this app stores sensitive-like demo data in `localStorage`, prefer using incognito sessions for manual QA.

If anything here is unclear or you need more examples (component patterns, localStorage keys list, or test bootstrapping), ask for the specific area and I will expand with file references and small code examples.

— End of instructions
