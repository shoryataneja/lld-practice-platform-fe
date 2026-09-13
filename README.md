# LLD Practice Platform

A web app where learners practice **Low-Level Design (LLD)** by solving a design
problem in four structured sections and receiving AI-generated feedback against a
fixed 8-criterion rubric. The product is scoped as a narrow MVP that demonstrates
the learner loop end-to-end: **pick a problem → write a design → submit → get
graded feedback → revise**.

This document describes the system as implemented. It is part of the assignment
hand-in along with
[`RESEARCH_NOTE.md`](RESEARCH_NOTE.md),
[`DESIGN_NOTE.md`](DESIGN_NOTE.md), and
[`AI_USAGE.md`](AI_USAGE.md).

---

## The learner journey

1. **Landing.** The home page explains the loop and shows two live KPIs —
   the number of available problems and the number of attempts made so far
   (both computed from the database, not hard-coded).
2. **Sign up / log in.** Email + password. Passwords are hashed with bcrypt;
   sessions are JWT tokens stored in an HttpOnly cookie. A **demo account** is
   seeded so evaluators can try the product instantly (see
   [Demo account](#demo-account)).
3. **Browse problems.** Five seeded practice problems cover a range of
   difficulty (`EASY` → `HARD`):
   - Parking Lot (`EASY`)
   - Vending Machine (`MEDIUM`)
   - Elevator (`MEDIUM`)
   - Library Management (`MEDIUM`)
   - Movie Ticket Booking (`HARD`)

   Problems can be searched by title from any page.
4. **Read the problem.** A problem detail page shows the statement, difficulty,
   and a "Start practicing" action.
5. **Draft the design.** A practice workspace presents **four sections**:
   - **Requirements & Assumptions**
   - **Classes, Responsibilities & Relationships**
   - **Design / Reasoning / Trade-offs**
   - **Code (optional)**

   The draft is persisted automatically (`Save`), and submitting **saves the
   draft first** so the evaluator always grades the latest content.
6. **Get graded feedback.** On submit, the attempt is evaluated immediately and
   synchronously. Every attempt receives:
   - an overall score out of 100,
   - a 1–2 sentence summary,
   - per-criterion results (8 criteria, each up to 10 points) with *evidence*
     (what was found), *concern* (a specific weakness, when present) and
     *suggestion* (one actionable improvement), plus a confidence value.
7. **Revise.** The submission stays editable while it is a draft; a new attempt
   can be started per problem. The **History** page lists past attempts, their
   status, and their score; the **Evaluation** page shows the full breakdown.

---

## What is implemented (MVP scope)

- **Authentication**: register, log in, log out, session restore; bcrypt hashing,
  JWT in an HttpOnly cookie; route protection and ownership checks per resource.
- **Problems**: 5 seeded problems, list + detail endpoints, difficulty tags.
- **Attempts**: create, save draft sections, submit, list (summary), read (detail).
  One attempt is created per problem per learner at a time; a new attempt always
  starts as a `DRAFT`.
- **Evaluation**: an `AI` evaluator (Groq, structured JSON output) with a
  deterministic **rule-based fallback** so the product degrades gracefully when
  the AI provider is unavailable or misconfigured. The two share a contract and
  are selectable behind a single interface.
- **Feedback display**: per-criterion breakdown with evidence / concern /
  suggestion, overall score, and status-driven UI.
- **History & search**: attempt history with status badges and score; global
  search on problems, history and Learn pages.
- **Tests**: 44 automated tests on the backend (evaluator, AI evaluator, API,
  auth). The frontend builds and lints cleanly (React + Vite, ESLint).

### Intentional out-of-scope (not implemented)

These are noted so the surface area is honest about the MVP boundary:

- **No async / queued evaluation.** Grading runs synchronously inside the submit
  request. The schema reserves `EVALUATING`, `PENDING` and `RUNNING` states for
  future async evaluation, but the live flow only ever uses `DRAFT → SUBMITTED →
  COMPLETED | FAILED`.
- **No human/peer evaluation.** `EvaluatorType.HUMAN` exists in the schema but
  is not wired to any flow.
- **No class-diagram submissions.** `SubmissionFormat.STRUCTURED_TEXT` is used;
  `CLASS_DIAGRAM` exists in the schema only.
- **No admin / problem-authoring UI.** Problems are seeded via a script.
- **The Learn page is content-placeholder only.** It is a styled static page
  ("coming soon" topics) and does not yet hold lessons.
- **The section tabs in the practice workspace are decorative.** The first tab
  is always styled active and all four sections are rendered stacked; the tab
  row does not switch the visible section.

---

## Tech stack

| Layer      | Choice | Notes |
|------------|--------|-------|
| Frontend   | React 19, Vite, React Router 7 | Plain CSS (BEM-ish component classes); no UI kit |
| Backend    | Node.js, Express 5, ES modules via CommonJS | REST JSON API |
| Database   | PostgreSQL (Prisma ORM 7, Neon driver adapter) | Schema managed by Prisma migrations |
| Auth       | bcryptjs + `jsonwebtoken` | HttpOnly cookie `lld_session` |
| AI grading | Groq (OpenAI-compatible chat completions API) | Structured `json_object` output; temperature 0.2 |
| Tests      | Node's built-in test runner (`node --test`) | 44 tests |
| Deploy     | Render (BE) + static host (FE, reverse proxy for `/api`) | See [Deployment](#deployment) |

---

## Repository layout

```
lld-learning-platform/
├── README.md              ← this file
├── RESEARCH_NOTE.md       ← problem context + research + MVP direction
├── DESIGN_NOTE.md         ← system design, domain model, trade-offs
├── AI_USAGE.md            ← AI-assisted engineering decisions
├── lld-learning-platform-be/
│   ├── prisma/schema.prisma
│   ├── src/
│   │   ├── index.js          ← entrypoint (node src/index.js)
│   │   ├── app.js            ← Express app
│   │   ├── config.js         ← env loading + validation
│   │   ├── prisma.js         ← Prisma client (Neon driver adapter)
│   │   ├── db/seed.js        ← demo user + 5 problems
│   │   ├── routes/           ← auth, problems, attempts, health
│   │   ├── services/         ← auth, evaluator, aiEvaluator, criteria
│   │   └── middleware/       ← auth guard, error handler
│   └── test/                 ← 44 tests (node --test)
└── lld-learning-platform-fe/
    ├── src/
    │   ├── api.js            ← /api client (credentials: include)
    │   ├── context/          ← AuthContext, SearchContext
    │   ├── components/       ← layout, ui primitives, Icon
    │   └── pages/            ← Home, Problems, ProblemDetail, Practice,
    │                           Evaluation, History, Learn, Login, Signup, 404
    └── vite.config.js        ← dev proxy /api → :4000
```

---

## Getting started (local development)

### Prerequisites

- Node.js 18+, npm
- A PostgreSQL database (the default dev setup uses **Neon**; you can also point
  `DATABASE_URL` at local Postgres)
- A **Groq API key** for AI grading (optional — without it the app falls back to
  the rule-based evaluator)

### 1. Backend

```bash
cd lld-learning-platform-be
cp .env.example .env        # if present; otherwise create .env (see below)
npm install
npx prisma migrate deploy   # apply migrations
npm run db:seed             # demo user + 5 problems
npm run dev                 # or: npm start  (node src/index.js)
```

`.env` variables consumed by the backend (`src/config.js`):

| Variable            | Required | Default              | Notes |
|---------------------|----------|----------------------|-------|
| `DATABASE_URL`      | ✓        | —                    | Postgres connection string |
| `JWT_SECRET`        | ✓ (prod) | —                    | **Throws** when missing and `NODE_ENV=production` |
| `GROQ_API_KEY`      | opt      | —                    | Enables AI evaluator (auto mode) |
| `GROQ_MODEL`        | opt      | `openai/gpt-oss-120b` | Chat model used for grading |
| `GROQ_TIMEOUT_MS`   | opt      | `60000`              | Abort after this long |
| `EVALUATOR_TYPE`    | opt      | `auto`               | `auto` \| `ai` \| `rule-based` |
| `PORT`              | opt      | `4000`               | HTTP port |
| `CORS_ORIGIN`       | opt      | `*` (origin:true)    | Frontend origin; set in prod |
| `SESSION_TTL_DAYS`  | opt      | `7`                  | Cookie + token lifetime |
| `SESSION_COOKIE_NAME`| opt     | `lld_session`        | Cookie name |
| `NODE_ENV`          | opt      | `development`        | Drives cookie `secure`/`sameSite` |

> **Security requirement:** `JWT_SECRET` is mandatory when `NODE_ENV=production`.
> The cookie is `HttpOnly` and `SameSite=Lax` in development / `SameSite=None`
> + `Secure` in production.

### 2. Frontend

```bash
cd lld-learning-platform-fe
npm install
npm run dev                # Vite dev server on :5173, proxies /api → :4000
```

### 3. Verify

```bash
# backend tests
cd lld-learning-platform-be && npm test        # → 44 tests, all passing
# frontend checks
cd lld-learning-platform-fe && npm run lint && npm run build
```

---

### Demo account



- **Email:** `testuser2@gmail.com`
- **Password:** `testuser@12345`

---

## API overview (implemented routes)

Base paths: `/api` (frontend calls everything relative to `/api`).

| Method & path                          | Purpose |
|----------------------------------------|---------|
| `GET /api/health`                      | Liveness probe |
| `POST /api/auth/signup`                | Register (email, name, password) |
| `POST /api/auth/login`                 | Log in (sets cookie) |
| `POST /api/auth/logout`                | Log out (clears cookie) |
| `GET /api/auth/me`                     | Current user (session restore) |
| `GET /api/problems`                    | List published problems |
| `GET /api/problems/:slug`              | Problem detail |
| `POST /api/problems/:slug/attempts`    | Start a new draft attempt |
| `GET /api/attempts`                    | My attempts (summary + score) |
| `GET /api/attempts/:id`                | My attempt (detail, own only) |
| `PUT /api/attempts/:id/sections`       | Save draft sections (`{ sections: [{key, content}] }`) |
| `POST /api/attempts/:id/submit`        | Save-mark-submit → synchronous evaluation |

All learners' endpoints enforce **ownership**: an attempt can only be read,
edited, or submitted by the learner who created it. Sections may only be edited
while the attempt is still a `DRAFT`; submitting a non-draft returns `409`.

---

## Evaluation design (summary)

- **Contract.** Both graders implement `evaluate({ submission, problem })` and
  return `{ results, summary }` where each result is `{ criterion, score,
  maxScore, evidence, concern, suggestion, confidence }`.
- **Rubric.** 8 criteria (each `0–10`), defined in `src/services/criteria.js`:
  Requirement Understanding · Class Responsibilities · Coupling / Cohesion ·
  Encapsulation / Interfaces · Abstraction / Design Patterns · Extensibility ·
  Edge Cases / Testability · Quality of Explanation. Score is derived as
  `Σ score / Σ maxScore × 100`.
- **Selection.** `resolveEvaluatorType()` picks `AI` when a Groq key is present
  (or when `EVALUATOR_TYPE=ai`), else `RULE_BASED`. If the AI call fails at
  runtime, the request **falls back to the rule-based evaluator** so a grading
  outage never blocks the learner loop.
- **AI reliability.** Responses must be valid JSON containing exactly the 8
  known criteria (no duplicates, no unknown keys); scores are clamped to a
  0–10 integer, evidence/suggestion must be non-empty strings, and confidence
  is clamped to `[0,1]`. Output is validated and reordered into canonical
  criterion order before persisting.
- **Failure handling.** If both paths fail, the evaluation is marked `FAILED`,
  the attempt is marked `FAILED`, the error is logged, and the client gets an
  error response it can surface.

See [`DESIGN_NOTE.md`](DESIGN_NOTE.md) for the full design rationale and
[`AI_USAGE.md`](AI_USAGE.md) for the AI-specific engineering decisions.

---

## Deployment

1. serve the built frontend and proxy `/api` → backend (recommended), or
2. run the backend behind the same origin with a reverse proxy (e.g. an Express
   static host + `app.use('/api', ...)`), or
3. add an explicit API base override.

CORS: production should set `CORS_ORIGIN` to the exact frontend origin (no
trailing slash). If left unset in production the server still responds with
permissive `origin:true`; that is fine for a demo but should be locked down.

Required env vars in any production host:

- `NODE_ENV=production` (Render sets this automatically)
- `JWT_SECRET` — **required in production** (the app refuses to boot without it)
- `DATABASE_URL`
- `GROQ_API_KEY` (recommended, otherwise grading is rule-based)
- `CORS_ORIGIN` — the deployed frontend URL

Steps for the two-app layout on **Render** (or equivalent):

1. **Database**: provision Postgres (e.g. Neon free tier), run
   `npx prisma migrate deploy` + `npm run db:seed` once.
2. **Backend service**: root dir `lld-learning-platform-be`, start command
   `npm start`; add the env vars above. Health check: `/api/health`.
3. **Frontend**: build with `npm run build`, serve the `dist/` folder, and
   reverse-proxy `/api/*` to the backend service URL.

---

## Design decisions & trade-offs (short list)

Full rationale lives in the design and AI documents. Highlights:

- **Narrow MVP**: one learner role, text-only submissions, five problems,
  synchronous grading — enough to prove the feedback loop end-to-end.
- **Two graders behind one interface** gives the product a cheap, deterministic
  baseline and a high-quality AI pass with graceful degradation.
- **Structured submissions over free-form**: four named sections make grading
  tractable and feedback actionable, and keep the schema simple.
- **Save-before-submit**: fixes a real bug where feedback was generated from an
  empty submission even though the learner had typed content (persisted on first
  run) — the submit action now persists the draft first.
- **Synchronous evaluation** trades throughput for simplicity; the schema already
  models `PENDING/RUNNING` states so async evaluation is a future extension, not
  a migration.
- **JWT cookie, not localStorage**: HttpOnly cookie avoids XSS token theft and is
  simpler than a refresh-token flow for this scope.

---

## Known limitations

- Evaluation is synchronous — the UI waits on a single request (we host a 60s
  abort for the AI call).
- Groq is a demo-grade provider choice; any OpenAI-compatible endpoint could be
  swapped in by changing one constant.
- The rule-based fallback scores keyword/structure heuristics, not semantics;
  it is a "degraded mode", intentionally simpler than the AI grader.
- No pagination on history (fine at this scale).
- Demo/quality bar: no rate limiting, no refresh-token rotation, no email
  verification — acceptable for an assignment MVP, listed here for honesty.
- Learn page and a couple of UI tabs are placeholders (see
  [out-of-scope](#intentional-out-of-scope-not-implemented)).

---

## Future work (not part of this assignment)

- Async, queued evaluation with live status polling (`EVALUATING` state exists).
- Class-diagram/`CLASS_DIAGRAM` submissions and image support.
- Re-attempt history per problem and difficulty-based score comparison.
- Human/peer review channel (`EvaluatorType.HUMAN`).
- Problem-authoring/admin UI with `isPublished` gating.
- Real lessons on the Learn page; pagination; rate limiting; email verification.