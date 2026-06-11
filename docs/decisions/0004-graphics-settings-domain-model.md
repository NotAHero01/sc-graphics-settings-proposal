# ADR 0004 — Graphics settings domain model

- **Status:** accepted
- **Date:** 2026-06-12

## Context

Phase 1 introduces the first domain model for the proposal: a description of
graphics settings, their likely cost, and their probable relevance to a player's
situation. This model is the foundation the later analysis, tracking and
verification work builds on, so its shape and its commitments need to be recorded
now.

The proposal's thesis is that the menu does not decide the configuration for the
player. It helps the player understand which settings are relevant, what probable
Bottleneck they may have, what changed, and whether a change helped in gameplay.
The model must serve that thesis rather than imply automatic optimisation.

## Decision

### 1. The model is data-driven

Settings are described as **data** (a catalogue of plain objects), not as code
branches or bespoke components. Each setting is one catalogue entry with its
category, value shape, explanation, impact profile, relevance hints and
verification hint.

A data-driven catalogue lets us add, reorder and revise settings without changing
logic or UI, keeps the model reviewable in one place, and makes it the single
source of truth that analysis and presentation both read.

### 2. The first model is intentionally small

The initial catalogue covers a deliberately small subset (around ten settings).
The goal of Phase 1 is to prove the *shape* of the model — the types and the
honest framing — not to be exhaustive. A small model is easier to review,
keeps the types honest, and avoids committing to fragile per-setting numbers
before the analysis layer exists. Breadth comes later.

### 3. Bottleneck language is probabilistic, not absolute

The model never asserts certainty. Relevance to a Bottleneck is expressed with
calibrated likelihood language (`unlikely` / `possible` / `likely`), and impact
is a qualitative magnitude, not a benchmark figure. We do not have, and will not
fabricate, measured per-system numbers. Overconfident guidance that proves wrong
destroys trust with an experienced audience, so the types make hedged language
the only option available.

### 4. Client-side effects are separated from server / streaming / system limits

`BottleneckType` distinguishes `cpu`, `gpu`, `vram`, `system` and
`server-streaming`. Crucially, `server-streaming` is a first-class member, and
catalogue items can carry a `serverStreamingCaveat` stating honestly when a
setting **cannot** fix a server or streaming problem. The model must be able to
say "changing this is unlikely to help, because the limit is not on your
machine." This is the single most important credibility safeguard and is
structural, not cosmetic.

### 5. The UI consumes the model only through `@scgs/core`

All model types and the catalogue are re-exported from `core/src/index.ts`. The
UI imports from `@scgs/core` and never from deep core paths. This keeps the
public surface explicit and lets the model's internals change without breaking
the UI. See ADRs
[`0001`](0001-core-as-separate-workspace.md) and
[`0002`](0002-dependency-direction-ui-to-core.md).

## Consequences

- Adding or revising a setting is a data edit, reviewable in isolation.
- The honest client-vs-server distinction is encoded in the type system, so it
  cannot be quietly dropped by presentation.
- Impact and relevance are qualitative for now; a future ADR will cover how, and
  whether, they become quantitative once real Telemetry exists.
- The model carries no behaviour yet — analysis that consumes it arrives in a
  later phase.

## Alternatives considered

- **Encode settings as code/components.** Rejected: couples data to logic/UI and
  scatters the source of truth.
- **Quantitative impact scores now.** Rejected: implies a precision we cannot
  justify without measurement, and contradicts the probabilistic principle.
- **Omit `server-streaming` from the model for now.** Rejected: it is the core
  honesty guarantee and must exist from the first model.
