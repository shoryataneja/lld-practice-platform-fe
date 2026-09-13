# Research Note — Low-Level Design Practice Platform

_Companion to `README.md`, `DESIGN_NOTE.md`, and `AI_USAGE.md`. This note records
the learner problem, what is already out there, the gaps we observed, and why the
MVP is scoped the way it is._

---

## 1. The learner problem

Candidates preparing for **low-level design (LLD) interviews** face a specific
training loop:

1. They get a design prompt (parking lot, vending machine, elevator…).
2. They produce a design — usually classes, responsibilities, relationships,
   decisions, and optionally code.
3. They need **structured, timely feedback** to know how good the design is and
   what to fix.

The gap in most self-study setups is step 3. When there is no evaluator, a
solution, or a rubric, the learner cannot tell whether their answer is strong,
average, or off-track. Paid LLD cohorts provide this feedback, but they are
expensive and slow (human review). The web is full of blog-style "solutions"
that show *an* answer, not a *graded* answer tied to their own write-up.

## 2. What already exists (brief landscape)

Existing practice resources cluster into a few categories:

- **Puzzle-style / unit-test platforms** (e.g. LeetCode, HackerRank, Codewars).
  Excellent for algorithmic tasks because right/wrong is objectively checkable.
  They do **not** grade open-ended design prose or trade-off reasoning — the
  core of LLD.
- **System-design resources and courses** (e.g. Grokking the System Design
  Interview, byte-sized walkthroughs, newsletters, YouTube).
  These teach content well but are **one-way**: read/watch → you are on your own.
  No submission, no grading, no loop.
- **LLD content aggregators / gists.** GitHub repos of design problems with
  "solutions" attached. Helpful as reference; again no personalized graded
  feedback, and solutions are often static with little attention to rubric
  consistency.
- **Mock-interview / human review services.** Provide real feedback but at high
  cost and latency; not suited for high-volume daily practice.

**Observation:** most existing tools optimise for either *objective grading with
constrained inputs* or *content delivery with no grading*. Few products sit in
the middle — free-text design submissions with immediate, rubric-aligned
feedback. That middle is where an LLD practice platform can add value.

## 3. Why AI changes the feasibility of that middle

Human review is the reason free-text grading is scarce and expensive. Generative
models change the economics: a well-scoped prompt plus structured output can
produce a rubric-consistent review in seconds and at negligible cost. Two
engineering concerns immediately follow:

- **Consistency.** Since interviews are judged on *patterns* (requirement
  understanding, responsibilities, coupling, abstraction, extensibility,
  edge cases, explanation quality), the grader should be pinned to a **fixed
  rubric** rather than judging ad hoc. Otherwise each attempt is graded by a
  different standard.
- **Graceful degradation.** A grader that hard-fails when the AI provider is
  down would make the product worthless at the worst moment (submission time).
  A deterministic fallback is cheap to build and keeps the loop alive.

These two concerns shaped the architecture in `DESIGN_NOTE.md` and `AI_USAGE.md`.

## 4. Observed gaps in current practice

From the learner's point of view, the recurring complaints are:

1. **No feedback at all** for most self-study attempts.
2. **No rubric** — even where feedback exists, it is not tied to a consistent
   scale, so progress is hard to measure.
3. **No written record / history** — feedback lives in someone's head or a chat
   window; attempts are not comparable over time.
4. **Canned solutions** reward reading, not producing; the learner never
   practises producing under a structure.

## 5. Product direction that follows

A single, focused loop that addresses all four gaps:

> pick a problem → write a structured design → submit →
> get per-criterion, rubric-aligned feedback → review history and revise.

The loop is the product. Everything else (content library, auth, community,
human review) is secondary and deliberately deferred.

## 6. Why this MVP scope

The assignment asks for an MVP that *demonstrates* the core behaviour reliably.
We deliberately kept the surface narrow:

- **One practice format** — structured text in four named sections
  (requirements/assumptions, classes/responsibilities/relationships,
  decisions/trade-offs, optional code). Structured input makes grading tractable
  and feedback actionable; free-form text would weaken both.
- **A small seed problem set** — five canonical LLD problems across
  EASY/MEDIUM/HARD (parking lot, vending machine, elevator, library management,
  movie ticket booking). Enough to explore difficulty, small enough to maintain.
- **One learner role** — custom accounts stored with hashed passwords; sessions
  via JWT cookie. No roles/payments/teams.
- **Synchronous grading** — submit now, wait for the result inside the request.
  No queues, no polling. The schema reserves async states for later but the live
  flow stays simple.
- **Two graders behind one interface** — a deterministic rule-based evaluator
  and an AI evaluator sharing a contract, selected automatically. This gives the
  MVP a working baseline with zero external dependencies and a clear upgrade
  path to richer AI feedback.
- **Graded history** — every attempt persists with its evaluation, which also
  doubles as proof-of-loop for the demo.

**Line we did not cross:** we did not build lessons, community/peer review,
async evaluation, diagram uploads, or admin tooling. Those are real, but none of
them is required to *demonstrate* the learner feedback loop, and each would
expand the attack surface of the MVP.

## 7. Risks and mitigations in the MVP

| Risk | Mitigation |
|------|------------|
| AI grader is inconsistent across attempts | Fixed 8-criterion rubric, pinned model, temperature 0.2, strict JSON validation + canonical reordering, evidence/suggestion required |
| AI provider is down / misconfigured | Deterministic rule-based fallback on AI failure; grader selected by availability |
| Learner submits empty/missing content | Save-before-submit fixes the "graded an empty submission" bug; evaluators surface missing sections as low-score evidence |
| Feedback too generic | Per-criterion `evidence` is mandated to quote or summarise concrete submission content |
| Scoring not comparable | Single derived 0–100 score + stored per-criterion results on every attempt |
| Over-scoping the MVP | Cut-list above is explicit and documented; schema-only features are clearly labelled in `DESIGN_NOTE.md` |

## 8. Open questions (future)

- Should async evaluation replace synchronous grading once attempt volume grows?
- Is a 4-section structur the right shape, or do learners need free-form "sketch"
  input (class diagram / image)?
- Can the rule-based grader be replaced by a cheaper local model to make
  `EVALUATOR_TYPE` tiers meaningful in free-mode?