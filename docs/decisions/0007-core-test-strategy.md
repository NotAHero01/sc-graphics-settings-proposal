# ADR 0007 — Core test strategy

- **Status:** accepted
- **Date:** 2026-06-12

## Context

The core now holds real branching logic: relevance scoring, attribution
weakening, and the server/streaming honesty rules. Until now these were enforced
only by reading the code. Phase 4 adds the first automated tests so the
behavioural guarantees — especially the honesty rules — cannot silently
regress.

A test runner must be chosen. The candidates were Node's built-in `node:test`
and Vitest.

## Decision

### Chosen runner: Vitest

The repository is already a Vite + TypeScript workspace, and Vite (hence esbuild)
is an existing dependency. Vitest reuses that exact toolchain, so it runs the
core's TypeScript directly with no extra transpile step, no loader flag, and no
separate `ts-node`/`tsx` dependency. `node:test` would have needed a TypeScript
execution shim (a runtime loader or a pre-compile step), which is more moving
parts and a second, divergent way of running TypeScript in the repo.

Vitest is also lightweight here: it adds one devDependency to the core package,
needs a six-line config, and its API (`describe`/`it`/`expect`) is standard and
maintainable. This is not a heavy stack — it is the smallest setup that runs the
core's TypeScript cleanly in this workspace.

Tests run in Vitest's `node` environment, with no DOM, reinforcing that the core
is pure and browser-free.

### Why tests live in the core package

The behaviour under test is the core's domain logic, so the tests belong beside
it in `@scgs/core` (`core/tests/`), runnable in isolation via
`pnpm --filter @scgs/core test`. This keeps the core independently verifiable and
avoids coupling its tests to the UI package.

### Scripts

- `pnpm --filter @scgs/core test` — core tests only.
- `pnpm test` — root alias for the core tests.
- `pnpm validate` — full check: core typecheck, app typecheck, core tests, build.

### What behaviour is protected first

The tests target the thesis-critical and honesty-critical behaviour, not
implementation detail:

- **Analysis** — GPU surfaces GPU-heavy settings above irrelevant ones; VRAM
  surfaces texture-related settings; CPU does not pretend Render Scale fixes a
  CPU limit; `server-streaming` recommends no graphics fix and preserves caveats;
  `unknown` stays conservative and educational.
- **Tracking** — sessions are serialisable; `addSettingChange` is immutable;
  change order/sequence is stable.
- **Verification** — all five outcomes stay first-class; multiple changes weaken
  attribution and cap confidence; server/streaming reminders remain visible; no
  function upgrades an observation into "it helped".

### Core TypeScript config

For now, `core/tsconfig.json` is a typecheck-only config covering both `src` and
`tests` with `noEmit`. The core package is currently consumed inside the
workspace and has no separate build/publish step. If the core package later needs
emitted JavaScript or declaration output, we will add a dedicated
`tsconfig.build.json` instead of weakening the test/typecheck setup.

### What is intentionally not tested yet

- Exhaustive per-setting catalogue values (we assert behaviour, not the whole
  catalogue, to avoid brittle duplication).
- Exact wording of explanations (we assert intent — caveats present, no
  certainty — not full strings).
- Anything UI, Telemetry, or persistence related, none of which exists yet.

## Consequences

- The honesty guarantees are now executable, not just documented.
- One devDependency and a small config; no second TypeScript execution path.
- New core behaviour is expected to arrive with matching tests.

## Alternatives considered

- **`node:test` + a TS loader (tsx).** Rejected: adds a separate transpile path
  and dependency for no gain in a workspace that already has Vite/esbuild.
- **No tests yet.** Rejected: the verification and analysis branching is now
  complex enough that regressions would be easy and silent.
