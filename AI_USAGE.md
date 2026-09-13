# AI Usage Note — LLD Practice Platform

_How AI was actually used to build this assignment, documented per the hand-in
requirements. Each decision below is real (traceable to the code) and records
what was suggested vs what was accepted/rejected, what was settled on, and why._

> Scope note: this document is about **AI-assisted engineering decisions** —
> the choices made while building the product. The product itself *grades
> learners with AI* (the Groq evaluator), which is the application domain and is
> documented in `DESIGN_NOTE.md` and `README.md`.

---

## Decision 1 — Use a hosted evaluator with a deterministic fallback

**Context / problem.** The product's core value is immediate rubric-aligned
feedback on free-text LLD submissions. Generating that feedback in-house (parse +
heuristics + rules) is fragile for open-ended prose; relying on a paid model only
is a single point of failure and gives an unverifiable "always 100%" experience
in our local/testing run, where no AI key is present.

**Suggested.** Use the Groq API (OpenAI-compatible chat completions) as the AI
evaluator, AND keep a small rule-based evaluator that implements the same
interface as the fallback, with `no-key / key-present` auto-selection.

**Accepted.** An `AiEvaluator` (Groq, `json_object`, temperature 0.2, 60s abort)
and a deterministic `RuleBasedEvaluator` both implement
`evaluate({ submission, problem }) → { results, summary }`; `resolveEvaluatorType`
chooses `AI` when `GROQ_API_KEY` is present (or `EVALUATOR_TYPE=ai`) else
`RULE_BASED`.

**Rejected.** (i) AI-only with hard failure — a provider hiccup would make the
submission endpoint `500` at the worst possible moment. (ii) Heuristic-only —
keyword scoring was qualitatively worse on real prose and had no path to
improve. (iii) A local model — heavy for a serverless, single-request flow.

**Final.** Two graders behind one interface, auto-selected, with runtime
fallback `AI → RULE_BASED` if the AI call throws (the persisted `evaluation`
records which grader actually ran).

**Why it works.** The abstraction means the API/UI is provider-agnostic; the
same rubric constant feeds both graders so scores are comparable; offline dev
without a key is a first-class mode, and history stamps `evaluatorType`
transparently.

**Evidence.** `be/src/services/evaluator.js` (`EVALUATORS`, `resolveEvaluatorType`,
`getEvaluator`); `be/src/services/aiEvaluator.js`; `be/src/routes/attempts.js`
(AI-fail → rule fallback, lines ~151–162).

---

## Decision 2 — Enforce a strict, validated JSON contract from the model

**Context / problem.** Model output is untrusted. If the grader returned 7
criteria one time, 9 the next, or a score of "-3", the score page would break or
the stored history would be incoherent. The rubric must be stable across
attempts or "grading" is meaningless.

**Suggested.** Instead of free-form prose from the model, require a single JSON
object (`response_format: { type: 'json_object' }`) with exactly the 8 known
criteria, then **validate and canonicalise server-side** before persisting.

**Accepted.**
- System prompt lists the 8 criteria and mandates "exactly 8 entries, exact
  criterion values" and the exact result shape.
- `parseResponse` strips code fences, `JSON.parse`s, and throws on non-JSON.
- `validateResult` rejects: missing/duplicate/unknown criteria, wrong result
  count, non-finite scores, malformed entries, empty `evidence`/`suggestion`
  (defaulted), out-of-range confidence (clamped `[0,1]`).
- Scores are clamped to integer `[0,10]`; results are **reordered to canonical
  criterion order** so the stored row order is deterministic regardless of model
  output order.

**Rejected.** Trusting raw model output ("it usually works"); letting the model
pick arbitrary criterion labels (would fragment history and be unqueryable);
pinning to a paid closed API only (Groq endpoint is a single constant and the
code is endpoint-agnostic otherwise).

**Final.** Structured JSON out + strict validation + canonical reordering; any
violation throws, and the throw path is exactly what Decision 1's fallback
handles — so a bad-model-output incident degrades to the rule-based grader
instead of a broken page.

**Why it works.** Deterministic schema for `EvaluationResult` rows; comparable
scores across attempts; the validation layer doubles as the contract between the
AI and the rest of the system.

**Evidence.** `aiEvaluator.js` `buildSystemPrompt`, `parseResponse`,
`validateResult`, `callGroq` (`response_format`, `temperature`, `timeoutMs`).

---

## Decision 3 — 7 sections → consolidate to 4 meaningful sections

**Context / problem.** The practice form originally exposed **seven** tiny
boxes (requirements, assumptions, classes, responsibilities, relationships,
decisions, code). That was a poor learning UX and a *grading* problem: sections
were so granular that learners scattered their design across boxes and left most
empty, which produced terrible, non-content-specific feedback.

**Suggested.** Collapse the seven keys into **four** pedagogical sections while
keeping the backend/DB contract intact (sections are free key+content pairs, so
no schema change is needed):

- `requirements` → "Requirements & Assumptions"
- `classes` → "Classes, Responsibilities & Relationships"
- `decisions` → "Design / Reasoning / Trade-offs"
- `code` → "Code (optional)"

**Accepted.** The FE writes only these 4 keys. The BE evaluators read them with
**backward-compatible key fallback** (`pick('requirements')`,
`pick('assumptions', 'requirements')`, `pick('classes')`,
`pick('responsibilities', 'classes')`, `pick('relationships', 'classes')`,
`pick('decisions')`, `pick('code')`) — so any draft persisted under the old
7-key shape still grades correctly with no migration. The new 4-section
submission outscores the empty-baseline in tests.

**Rejected.** (i) Migrating the DB — unnecessary since `SubmissionSection.key`
is already free-form; a migration would add risk for zero product value.
(ii) A "megabox" single textarea — loses all per-section feedback shape.
(iii) Keeping 7 sections but adding prompts — treats the symptom.

**Final.** 4 sections on the frontend, key-tolerant reading on the backend,
legacy keys honoured via fallback, and legacy drafts merged into 4 keys when
loaded.

**Why it works.** Fewer, bigger, well-labelled boxes produce denser, relevant
content per criterion; graders spend budget on substance instead of
cross-mapping seven near-empty boxes; the change is invisible to the API.

**Evidence.** `fe/src/pages/PracticePage.jsx` (sections constant + `LEGACY_SECTION_MAP`);
`be/src/services/evaluator.js` (all `pick(...)` reads); new test in
`be/test/evaluator.test.js`.

---

## Decision 4 — Persist the draft before submitting (save-before-submit)

**Context / problem.** We reproduced a real bug: a learner types a full design,
hits **Submit**, and gets back feedback for an *empty* submission. Root cause:
the submit flow called the submit endpoint directly, never persisting the typed
sections first; the backend only grades `attempt.submission.sections` as stored
in the DB, which was empty. The AI grader therefore "graded nothing" and every
submission produced near-identical, content-free feedback — a demoralising,
useless loop.

**Suggested.** Make **submit always save first**: `submit()` builds the current
4-section payload (same `buildPayload()` the Save button uses), calls
`PUT /sections`, then `POST /submit`. If saving fails, abort the submit so we
never grade stale/empty content; optionally surface the reason.

**Accepted.**
- FE `submit()` saves the draft immediately before calling submit.
- Save and submit share one payload-builder, so there is exactly one source of
  truth for what the backend will grade.
- A failed save aborts the submit (no empty-API calls).

**Rejected.** (i) Backend-side fill-in — treating "empty sections" as "return
the pre-submit drafts" introduces implicit state and couples the submit route to
frontend caching. (ii) Discouraging users with a "did you write something?"
modal. (iii) A preflight warning only (non-deterministic).

**Final.** FE-saves-then-submits (deterministic, minimal); the backend keeps its
simple contract: `submit` grades exactly what is persisted. Verified live: a
typed 4-section submission returned `evaluatorType:"AI"`,
`provider:"groq"`, a score of 34, and *content-specific* per-criterion feedback
(the pre-fix baseline produced near-identical, empty-content feedback).

**Why it works.** Fixes the grader-input bug at its source (the submit path),
adds no BE coupling, and guarantees the grading contract holds: the AI/rule
evaluators always see what the learner actually wrote.

**Evidence.** `fe/src/pages/PracticePage.jsx` (submit → save → then API submit,
via the shared `buildPayload`); live Groq smoke test with a typed submission.

---

## Summary of AI usage

| # | Decision | Suggested | Accepted | Final |
|---|----------|-----------|----------|-------|
| 1 | Grading engine | Hosted AI + deterministic fallback | Yes | Two graders (Groq + rule-based), auto-selected, AI→rule fallback |
| 2 | Output contract | Strict validated JSON | Yes | `json_object`, 8-criterion validation, canonical order, scoring clamps |
| 3 | Form structure | Consolidate 7→4 sections | Yes | 4 FE sections, key-tolerant BE reads, legacy fallback, no migration |
| 4 | Submit correctness | Save before submit | Yes | Submit persists draft first; failed save aborts submit |

Every decision is implemented and testable in the repository; none were
"AI-hallucinated" features — each is traceable to its file above. Where AI was
used, it was used as a *stakeholder/interviewee* (the graded feedback) and as an
*engineering collaborator* (drafting these documents and pairing on the four
decisions) — and the external contract (Groq) was always treated as untrusted
input to be validated.