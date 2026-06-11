# ADR 0002 — Dependency direction: UI → core, never the reverse

- **Status:** accepted
- **Date:** 2026-06-12

## Context

[ADR 0001](0001-core-as-separate-workspace.md) makes the core a separate package.
This ADR fixes the direction of dependency between the two packages and the
single entry point through which they communicate.

## Decision

- The UI (`src/`) may depend on `@scgs/core`. The core may **never** depend on
  the UI.
- The UI imports the core **only** through its public barrel,
  `core/src/index.ts`. Deep imports into core sub-paths (e.g.
  `@scgs/core/src/analysis/...`) are not allowed.
- Translation between core results and UI shapes happens in `src/adapters/`.
  Components consume adapter output and the Zustand store; they do not embed
  domain rules.

## Consequences

- The public surface of the core is explicit and reviewable in one file.
- Internal core modules can be refactored without breaking the UI, as long as
  the barrel is stable.
- A clear place (`adapters/`) exists for the unavoidable mapping work, keeping it
  out of components and out of the core.

## Alternatives considered

- **Allow deep imports for convenience.** Faster short-term, but couples the UI
  to the core's internal structure and defeats the barrel.
- **Let the store call core directly with no adapter layer.** Workable, but mixes
  mapping concerns into state and spreads them across the UI.
