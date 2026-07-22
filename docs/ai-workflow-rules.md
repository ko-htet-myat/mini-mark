# AI Workflow Rules � Mini Market Myanmar

## Core Principle

This project uses **spec-driven development**. No implementation code is written until a spec and plan exist and have been explicitly approved by the human.

---

## Workflow for Non-Trivial Changes

A **non-trivial change** is any: new feature, API change, database schema change, new route, or significant refactor.

### Step 1 � Write the Spec

Create the spec file:

```
specs/<YYYY-MM-DD>-<short-name>/spec.md
```

The spec must include:

- **What** is being built and why
- **Acceptance criteria** (testable, user-facing)
- **Out of scope** for this spec
- **Open questions** that affect implementation

> ?? Do NOT write any implementation code until the spec is approved by the human.

### Step 2 � Write the Plan

Once the spec is approved, create:

```
specs/<YYYY-MM-DD>-<short-name>/plan.md
```

The plan must include:

- Files to create / modify / delete
- DB schema changes (if any)
- Component breakdown
- Data flow description

> ?? Do NOT write any implementation code until the plan is approved by the human.

### Step 3 � Break Down into Tasks

Create:

```
specs/<YYYY-MM-DD>-<short-name>/tasks.md
```

Each task must be:

- A single, checkable unit of work
- Testable (has a pass/fail criterion)
- Small enough to implement without branching

Format:

```markdown
- [ ] Task description
  - [ ] Sub-task if needed
```

### Step 4 � Implement One Task at a Time

- Mark task `[/]` (in progress) when starting
- Mark task `[x]` (done) only after running associated tests
- **Never mark a task complete without running its tests**

### Step 5 � Handle Divergence

If reality diverges from the plan:

1. **Stop implementing**
2. Update `plan.md` to reflect the new understanding
3. Get explicit approval before continuing

---

## Trivial Changes (No Spec Required)

These can go straight to implementation:

- Typo fixes
- Config tweaks (e.g., adding a Tailwind token)
- Dependency version bumps
- Adding a translation key
- Minor style adjustments

---

## Scoping Rules

| Situation                       | Action                                            |
| ------------------------------- | ------------------------------------------------- |
| Feature request is vague        | Ask for clarification before writing spec         |
| Spec requires a DB change       | Include migration in plan, call out explicitly    |
| Plan depends on an external API | Research the API before committing to approach    |
| Task is blocked                 | Note the blocker in `tasks.md`, do not skip ahead |

---

## Reading Context Before Implementation

Before any architectural decision or implementation, read these files in order:

1. `docs/project-overview.md`
2. `docs/architecture.md`
3. `docs/ui-context.md`
4. `docs/code-standards.md`
5. `docs/ai-workflow-rules.md`  this file
6. `docs/progress-tracker.md`

---

## Updating Context Files

| Trigger                                        | What to update             |
| ---------------------------------------------- | -------------------------- |
| Meaningful implementation change               | `docs/progress-tracker.md` |
| Architecture boundary changes                  | `docs/architecture.md`     |
| New colour token / font / component convention | `docs/ui-context.md`       |
| New coding rule established                    | `docs/code-standards.md`   |
| Scope added or removed                         | `docs/project-overview.md` |

Always update the relevant context file **before** continuing implementation if a change affects documented invariants.

---

## Delivery Approach

- Deliver one feature at a time to the working baseline
- Each delivery must leave the codebase in a buildable, lint-passing state
- Avoid speculative abstractions � only abstract when the pattern repeats 3+ times
- Prefer explicit over clever � readable code wins over clever code
