# ADR 0001 — Core as a separate workspace package

- **Status:** accepted
- **Date:** 2026-06-12

## Context

The proposal's credibility depends on a clean separation between domain logic
(bottleneck analysis, relevance, tracking, verification, probabilistic language)
and the UI. If business rules leak into React components, the proposal becomes a
demo rather than a defensible design, and the logic cannot later be driven by
real Telemetry without a rewrite.

A separation enforced only by convention (e.g. a `core/` folder inside `src/`)
erodes over time, because nothing stops a component importing a helper or a
domain rule importing a React type.

## Decision

The core logic lives in its own pnpm workspace package, `@scgs/core`, with its
own `package.json` and `tsconfig.json`. The repository root is the app package
(Vite/React) and depends on `@scgs/core` through the workspace.

The core's TypeScript configuration excludes the DOM library, so any accidental
use of browser APIs fails to compile.

## Consequences

- The separation is physical: the core cannot see the app, so it cannot depend
  on it.
- The domain logic is independently type-checkable and testable without a
  browser.
- The same core can later be driven by real Telemetry without touching the UI.
- Small upfront cost: a workspace and a second package to manage.

## Alternatives considered

- **`src/core/` folder, single package.** Cheaper to set up, but the boundary is
  unenforced and tends to rot.
- **Separate repository.** Stronger isolation, but too heavy for an exploratory
  proposal and slows iteration.
