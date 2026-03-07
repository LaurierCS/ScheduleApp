# 🚦 Schedule App — Copilot Workspace Instructions

This project is a full‑stack schedule application with a **React/Vite frontend** and an **Express/TypeScript backend**.  Use these notes to orient the AI agent and yourself when navigating, editing, or extending the codebase.

---

## ⚙️ Primary commands

Most development is driven from the workspace root using `pnpm` (version 8+).

```bash
# install everything at once
pnpm install

# run both sides concurrently (dev workflow)
pnpm dev

# run only frontend / backend
e.g. pnpm frontend  # cd frontend && pnpm dev
     pnpm backend   # cd backend  && pnpm dev

# build (root orchestrates)
pnpm build
# or per subproject: pnpm frontend:build / pnpm backend:build
```

Each subproject also exposes its own scripts under `frontend/package.json` and `backend/package.json`.
The CI workflows (`.github/workflows/*-ci.yml`) mostly run `tsc --noEmit`, `pnpm lint`, and a build step.

> **Note:** there are currently no unit or integration tests; CI merely type‑checks and builds.

---

## 🏗 Architecture & directory layout

```
scapp/
├─ frontend/          # React + Vite + Tailwind (TSX)
│   ├─ src/
│   │   ├─ features/  # by domain (admin, auth, candidate, etc.)
│   │   ├─ ui/        # shared components
│   │   └─ utils/     # network, routing, helpers
│   └─ ...            # config files, tsconfigs, public
└─ backend/           # Express API with Mongoose models
    ├─ src/
    │   ├─ controllers/            # request handlers
    │   ├─ models/                 # mongoose schemas
    │   ├─ routes/                 # express routers
    │   ├─ middleware/             # auth, error, etc.
    │   ├─ utils/                  # jwt, logger, helpers
    │   └─ validators/             # zod schemas
    └─ ...                        # config, migrations, etc.
```

Both sides are written in TypeScript.  The backend targets `es2020`, uses `ts-node-dev`/`nodemon` in dev, and outputs to `dist/` when built.

---

## 🛠 Conventions & style

* **TypeScript strictness**: follow existing patterns for `interface`/`type` definitions.  zod is used extensively for validation.
* **File length**: prefer keeping files under **250 lines**.  If a controller/model grows too large, split it.
* **Comments**: mirror style seen around the repo — concise JSDoc‑style above exported functions, inline comments for non‑obvious logic.
* **Imports**: use relative paths within each subproject; avoid deep `../../..` when a utility index exists.
* **Error handling**: custom `CustomError` subclasses are thrown and caught by centralized `errorMiddleware`.
* **Environment vars**: examples live in `backend/.env` and `frontend/.env.example`; backend reads via `dotenv`.
* **Ports**: default frontend `5173` (VITE_PORT), backend `5000` (PORT).  Conflicts usually mean adjust the `.env` file.

> **Tip**: read through an existing controller/model pair to understand the pattern before adding new endpoints.

---

## 📁 Key files worth scanning

* `README.md` – existing setup instructions (used to generate these notes).
* `backend/src/utils/jwt.ts` – token helpers used across auth flows.
* `frontend/src/utils/api.ts` – wrapper for fetch calls and auth headers.
* `backend/src/routes/index.ts` – central router aggregator.
* `frontend/vite.config.ts` – port and environment configuration logic.

---

## 🚧 Common pitfalls

* Omitting `await` on mongoose operations causes unhandled promise warnings.
* Zod validation schemas must match the shape used by controllers; keep them in sync.
* Frontend linting is enforced via `pnpm lint` (ESLint + prettier).  Run it locally before pushing.
* When adding new front/back dependency, run `pnpm install` in the appropriate folder and commit updated lockfile.

---

## 🔄 Workflow hints for the AI agent

1. **Understand context first** – open a relevant controller or component, note surrounding patterns.
2. **Preserve existing style** – mimic variable naming, error messages, response formats.
3. **Keep changes small** – prefer adding new files over making one massive edit; follow the 250‑line rule.
4. **Run build/type‑check** after edits (use provided scripts) to ensure nothing breaks.
5. **Use `pnpm lint`** in the frontend directory when touching UI code.

> If unsure where to make changes, search for similar functionality (e.g. `login.ts` for auth) and mirror its structure.

---

## 🔍 Example prompts to try

* “Add a new API endpoint `GET /api/teams/:id/members` returning users in a team, with zod validation and a controller test stub.”
* “Create a reusable `Modal` component in `frontend/src/ui` and use it on the dashboard page.”
* “Fix lint errors in `frontend/src/features/auth/Login.tsx`.”
* “Update `backend/src/utils/logger.ts` to include request ids, and modify middleware accordingly.”

---

## 📌 Next customizations to consider

1. **Create an applyTo instruction** for `backend/**` vs `frontend/**` to tailor guidance per subproject.
2. **Add a prompt template** that scaffold new features (endpoint + frontend page) with boilerplate comments.
3. **Build a simple skill** to list environment variable names and default values (could read `.env` files).

*We’ll evolve this document as the codebase grows.*

---

*(end of instructions)*
