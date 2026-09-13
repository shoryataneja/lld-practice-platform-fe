# Design Note — LLD Practice Platform

_System design for the implemented MVP. Part of the assignment hand-in._
_See also `README.md` (overview) and `AI_USAGE.md` (AI decisions)._

This note covers: the MVP flow, the domain model and its responsibilities, the
submission model, the evaluation architecture (with the AI vs deterministic
split and its abstraction), the feedback structure, state transitions, trade-offs,
change/extensibility tests, and failure handling.

---

## 1. MVP flow (as implemented)

```
Learner
  │  sign up / log in (JWT cookie)
  ▼
Browse seeded problems ──────► read problem detail (difficulty, statement)
  │
  ▼
Start an attempt (→ DRAFT)     one draft per problem; retry later attempts
  │
  ▼
Practice workspace — 4 sections:
      requirements | classes | decisions | code
          └── Save persists sections (only while DRAFT)
  │
  ▼
Submit ──► save sections FIRST ──► try AI evaluator ──(fail)──► rule-based fallback
  │                                                                     │
  ▼                                                                     ▼
Attempt COMPLETED                                                     Attempt FAILED
  │
  ▼
Evaluation page: score (0–100) + summary + 8 criteria
                  (score, evidence, concern, suggestion, confidence)
History page: status badge + score per attempt
```

Key orthogonality: **editing** (`PUT sections`) and **grading** (`POST submit`)
are separate endpoints. Editing is only allowed while `DRAFT`; grading
transitions status to `SUBMITTED` and never goes back to editable.

## 2. Domain model and responsibilities

```
User ──< Attempt ──< Submission ──< SubmissionSection
                 └── Evaluation ──< EvaluationResult
Attempt ──> Problem
```

### User
Responsibility: identity and credential security.
- `email` unique, `name`, `passwordHash` (bcrypt, 10 rounds — never plaintext).
- Owns all attempts; every learner-scoped query filters by `learnerId`.

### Problem
Responsibility: canonical statement a learner practices against.
- `slug` unique (stable for URLs / seeding), `title`, `summary`, `description`,
  `difficulty` (`EASY|MEDIUM|HARD`), `isPublished` gate (seeded true).

### Attempt
Responsibility: **a single learner's run at one problem**; the unit of history.
- Identified by `attemptNumber` within `(learnerId, problemId)`
  (`@@unique([learnerId, problemId, attemptNumber])`).
- Tracks status (`DRAFT → SUBMITTED → COMPLETED | FAILED`), timestamps
  (`startedAt`, `submittedAt`, `completedAt`).
- Owns at most one `Submission` and one `Evaluation`.

### Submission / SubmissionSection
Responsibility: capture the learner's structured write-up.
- `Submission` is 1:1 with `Attempt`; `format` defaults `STRUCTURED_TEXT`
  (`CLASS_DIAGRAM` reserved, unused).
- `SubmissionSection` is a `(submissionId, key)` unique pair of `key + content`
  (keys are the 4 section names; content is free text). Saved via `upsert` so a
  section can be added/updated/deleted independently.

### Evaluation / EvaluationResult
Responsibility: persist one grading pass per attempt.
- `Evaluation` holds `status`, `evaluatorType` (`AI|RULE_BASED|HUMAN`; `HUMAN`
  reserved), `provider` (`groq` when AI), `modelName`, `summary`, `errorMessage`,
  and timing fields.
- `EvaluationResult` holds the per-criterion row: `criterion` (8-value enum),
  `score`, `maxScore`, `evidence`, `concern`, `suggestion`, `confidence`
  (`@@unique([evaluationId, criterion])`).

## 3. Submission model and section keys

The frontend owns exactly four section keys (see `fe/src/pages/PracticePage.jsx`):

| Key          | Label                                   | Purpose |
|--------------|-----------------------------------------|---------|
| `requirements` | Requirements & Assumptions             | Scope, must-have vs nice-to-have, explicit constraints/assumptions |
| `classes`    | Classes, Responsibilities & Relationships | Candidate classes, who owns what, composition/references/relationships |
| `decisions`  | Design / Reasoning / Trade-offs         | Choices, rejected alternatives, trade-offs accepted |
| `code`       | Code (optional)                         | Key class skeletons: interfaces, fields, methods |

**Backward compatibility.** The backend evaluators read these keys with a
primary-then-fallback strategy (`pick('assumptions', 'requirements')`, etc.) so
a draft persisted under an earlier, seven-key schema still grades correctly
without a migration. Details in `AI_USAGE.md` (decision 4).

Sections are persisted atomically: `PUT /sections` runs in a Prisma transaction
(upsert the submission, delete removed keys, upsert present keys). Empty/missing
sections are simply low-score evidence for the evaluator, never a schema error.

## 4. Evaluation architecture

### 4.1 Two graders, one interface (the abstraction)

Both graders implement the same contract:

```
evaluate({ submission, problem }) → { results, summary }
result  = { criterion, score, maxScore, evidence, concern, suggestion, confidence }
```

They are registered in an `EVALUATORS` map and selected through a single
function `getEvaluator(type)` / `resolveEvaluatorType(...)`:

- `EVALUATOR_TYPE=rule-based` → always `RULE_BASED`
- `EVALUATOR_TYPE=ai` → always `AI`
- `auto` (default) → `AI` if a Groq key is configured, else `RULE_BASED`

The grader choice is also stamped on the persisted `Evaluation`, so history shows
*how* an attempt was graded (`evaluatorType`, `provider`, `modelName`).

### 4.2 The rubric (shared constant)

`criteria.js` defines exactly 8 criteria and `MAX_SCORE = 10`:

1. Requirement Understanding
2. Class Responsibilities
3. Coupling / Cohesion
4. Encapsulation / Interfaces
5. Abstraction / Design Patterns
6. Extensibility
7. Edge Cases / Testability
8. Quality of Explanation

Both graders read the **same** constant, so rubric drift between AI and
rule-based paths is structurally impossible. Overall score is derived at read
time: `Σ score / Σ maxScore × 100` (see `routes/attempts.js :: derivedScore`).

### 4.3 AI grader (primary)

- Calls Groq chat completions (`https://api.groq.com/openai/v1/chat/completions`),
  model `openai/gpt-oss-120b`, `temperature: 0.2`, `max_tokens: 3200`,
  `response_format: { type: 'json_object' }`, 60s abort timeout.
- System prompt fixes: expert LLD interviewer persona, the 8 criteria verbatim,
  a numeric rubric (8–10 / 5–7 / 2–4 / 0–1), required per-criterion fields, and
  "exactly 8 results, exact criterion values".
- **Server-side validation and canonicalisation** are mandatory, because the model
  output is untrusted:
  - valid JSON (code fences stripped);
  - results must be exactly 8, no duplicates, no unknown criteria;
  - score must be finite → clamped to integer `[0,10]`;
  - `evidence` and `suggestion` must be non-empty strings (else defaults);
  - `confidence` clamped to `[0,1]`;
  - results reordered into canonical criterion order before persistence.

### 4.4 Rule-based evaluator (fallback / offline mode)

- Deterministic, no external dependencies; scores each criterion from keyword
  and structure heuristics over the four sections (word counts, class-name
  detection, pattern vocabulary, edge-case vocabulary, decision keywords).
- Produces the *same* result shape, so the API/UI layer is provider-agnostic.
- Confidence derived from total content length (clamped 0.6–0.95).
- Documented as "degraded mode": it measures text coverage, not design quality.

### 4.5 Failure handling (submit path)

```
resolve type → create Evaluation(RUNNING)
  → AI evaluate ──success──► persist COMPLETED + results ──► Attempt COMPLETED
       │ fail
       └─► warn log ─► rule-based evaluate ──success──► persist COMPLETED (type=RULE_BASED)
                                                 │ fail
                                                 └─► Evaluation FAILED(+errorMessage),
                                                      Attempt FAILED, error to client
```

Precisely:

- If the **AI** grader throws → log + transparently fall back to rule-based; the
  learner still gets graded feedback (history shows `evaluatorType: RULE_BASED`).
- If the **fallback also** throws → `Evaluation.status = FAILED` with error
  message, `Attempt.status = FAILED`, and the error propagates (client surfaces it).
- Non-AI mode failures propagate immediately (no fallback needed).
- Only `DRAFT` attempts can be submitted (`409` otherwise) and only the owning
  learner can read/edit/submit an attempt.

## 5. State transitions

```
                PUT /sections (owner only, DRAFT only)
                ──────────────────────────────────────► stays DRAFT
DRAFT ──POST /submit──► SUBMITTED ──AI success or fallback success──► COMPLETED
                                          │
                                          └─ both graders fail ──► FAILED
```

Schema additionally reserves `EVALUATING` (attempt) and `PENDING`/`RUNNING`
(evaluation) for a future async pipeline; the live flow uses
`RUNNING → COMPLETED|FAILED` for evaluation inside the request.

## 6. Change / extensibility tests

- **Swap providers.** Only `aiEvaluator.js` knows Groq; `getEvaluator('AI')`
  returns `AiEvaluator`. Changing the host/model is one file/one env var.
- **Change rubric.** `CRITERIA` is a single constant consumed by prompt builder,
  AI validation, rule-based scoring, and schema enum — adding/removing a
  criterion is a reviewable one-line change (plus migration for the enum).
- **Add a section.** `PracticePage.sections` + key fallback map are the only
  touch points; evaluators read via `pick(...)` and are already key-tolerant.
- **Async evaluation.** Rows/states already model `PENDING/RUNNING/EVALUATING`;
  the submit route would just enqueue instead of awaiting the grader.
- **New evaluator type.** Register a class in `EVALUATORS` and extend the
  resolution function; schema already has `HUMAN`.

The contract-style double-grader design means the UI never knows whether the
grade came from Groq or from heuristics.

## 7. Trade-offs made (and why)

1. **Deterministic + AI graders, not "AI only".** Adds a second code path, but
   buys availability, testability, offline dev, and a trustworthy score baseline.
2. **Synchronous grading.** Simpler UX and code; blocks on the AI call (60s
   abort). Async was deferred because the MVP has modest traffic and the schema
   already supports the later change.
3. **Structured 4-section submission, not free-form.** Enables per-section
   feedback and keeps schema/grading tractable; costs a little authoring freedom.
   The optional `code` section hedges "but what about code?" without making it
   mandatory.
4. **Persist-before-grade (save before submit).** A tiny contract change with a
   large correctness win — verified against a live bug where an empty submission
   was graded even though the learner had typed content (the content was never
   persisted ahead of submit).
5. **JWT in an HttpOnly cookie.** Good default security posture for a session;
   no token-in-JS; simpler than refresh-token rotation. Costs CSRF consideration
   (mitigated by SameSite, and this app has no state-changing cross-site reads).
6. **Postgres + Prisma.** Real relational schema with enums/constraints is
   appropriate for the domain relationships (attempt↔submission↔evaluation 1:1)
   and cheap to reason about; migrations make the schema reviewable.

## 8. What the schema reserves but the product does not use (honesty)

- `AttemptStatus.EVALUATING`, `EvaluationStatus.PENDING` — future async pipeline.
- `SubmissionFormat.CLASS_DIAGRAM` — future diagram uploads.
- `EvaluatorType.HUMAN` — future human/peer review.
- `EvaluationResult.maxScore` is stored (always `MAX_SCORE` today) so partial
  weights are possible later without a migration.

These are deliberate affordances, not accidental features; the MVP never
exercises them.