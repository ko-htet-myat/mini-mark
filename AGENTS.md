<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Workflow: Spec-driven development

For any non-trivial change (new feature, API change, schema change):

1. Do NOT write implementation code until a spec exists.
2. Create /specs/<date>-<short-name>/spec.md — get explicit human
   approval before proceeding.
3. Create plan.md in the same folder — get explicit human approval
   before writing code.
4. Break the plan into tasks.md — small, checkable, testable units.
5. Implement one task at a time. Mark it done in tasks.md as you go.
6. If reality diverges from the plan mid-implementation, stop and
   update plan.md — don't silently improvise.

Trivial changes (typos, config tweaks, dependency bumps) can skip
this and go straight to implementation.

Never mark a task complete without running its associated tests.

## Application Building Context

Read the following files in order before implementing
or making any architectural decision:

1. `docs/project-overview.md` — product definition,
   goals, features, and scope
2. `docs/architecture.md` — system structure,
   boundaries, storage model, and invariants
3. `docs/ui-context.md` — theme, colors, typography,
   and component conventions
4. `docs/code-standards.md` — implementation rules
   and conventions
5. `docs/ai-workflow-rules.md` — development workflow,
   scoping rules, and delivery approach
6. `docs/progress-tracker.md` — current phase,
   completed work, open questions, and next steps

Update `context/progress-tracker.md` after each
meaningful implementation change.

If implementation changes the architecture, scope, or
standards documented in the context files, update the
relevant file before continuing.
