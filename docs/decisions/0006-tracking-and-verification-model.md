# ADR 0006 — Tracking and verification model

- **Status:** accepted
- **Date:** 2026-06-12

## Context

The thesis has four parts: which settings are relevant, the probable Bottleneck,
**what changed**, and **whether a change helped in gameplay**. Phases 1 and 2
covered the first two. Phase 3 models the last two as pure data and pure
functions in the core, before any UI exists.

This is the part of the system most prone to dishonesty: it is tempting to
declare that a change "worked". The model must resist that and stay observational.

## Decision

### 1. Tracking is modelled in core before UI

A change is a domain fact — a setting moved from one value to another, in some
order, in some context. Modelling it as serialisable data in
`core/src/tracking/` keeps it independent of any screen, testable in isolation,
and ready for a UI or future Telemetry to populate. Putting it in the UI first
would scatter the shape and couple it to presentation.

### 2. Tracking records changes but does not judge automatically

`createChangeSession` and `addSettingChange` only **record** what changed. They
never infer that a change was good or bad. Verification is a separate, explicit
step driven by the player's observation. The model has no path that turns a
recorded change into a judgement on its own.

### 3. Verification language is observational and probabilistic

`VerificationOutcome` is the player's reported observation
(`improved` / `worsened` / `unchanged` / `inconclusive` / `not-tested`).
`summariseVerification` never upgrades that observation; it can only hedge it.
Confidence reuses the model's `Likelihood`, which has no "certain" member, and
the summary is phrased as a reading, not a verdict. `inconclusive` and
`not-tested` are first-class outcomes, not failures.

When several settings changed at once, the summary warns that attribution is
weaker and caps confidence accordingly — honest hedging, not a decision.

### 4. No real Telemetry or persistence yet

The core reads no clock, no storage and no browser APIs. Ordering uses a simple
`sequence` marker; any timestamp is an optional caller-supplied number. Values
are plain serialisable data. We do not fabricate Telemetry or measurements.

### 5. How this prepares later UI and Telemetry

The UI will create a session, record changes, collect the player's observation
and render the summary — holding no logic of its own. Future Telemetry will
populate the same `PlayerContext` and observation inputs and feed the same pure
functions, so the reasoning will not need rewriting. Server/streaming caveats
from the catalogue are surfaced here too, so the honesty guarantee survives into
verification.

## Consequences

- "What changed" and "did it help" are pure, serialisable, and UI-agnostic.
- The player's observation is always the source of truth for verification.
- Multiple simultaneous changes visibly weaken attribution.
- Server/streaming honesty is preserved through to the verification summary.
- No measured numbers exist yet; a later ADR will cover Telemetry feeding this.

## Alternatives considered

- **Auto-judge whether a change helped.** Rejected: contradicts the thesis and
  claims certainty we cannot have.
- **Persist sessions to localStorage now.** Rejected: out of scope, and the core
  must not touch browser APIs.
- **Use `Date` objects inside core.** Rejected in favour of serialisable
  `sequence` markers and optional numeric timestamps.
