# ADR 0005 — Analysis layer

- **Status:** accepted
- **Date:** 2026-06-12

## Context

Phase 1 produced a data-driven catalogue of graphics settings. Phase 2 adds the
first layer that *reads* that catalogue against a player's situation and explains
which settings are relevant and why. This is the layer that turns a flat list
into understanding, so its commitments need recording before the UI consumes it.

The proposal's thesis stands: the menu does not decide the configuration for the
player. The analysis layer must therefore explain and rank, never decide or
optimise, and it must stay probabilistic.

## Decision

### 1. Analysis is pure TypeScript in the core

The analysis lives in `core/src/analysis/` as pure functions with no React, no
DOM and no I/O. Given a `PlayerContext`, `analyseSettings` returns plain data.
This keeps the reasoning testable in isolation, reusable across any presentation,
and re-checkable by a reviewer reading a single function. It also keeps the
honesty rules (probabilistic language, client-vs-server distinction) in one place
rather than scattered through UI code.

### 2. Analysis returns explanations, not decisions

Each result carries a relevance level, a plain-language `reason`, the likely
client-side impact, a verification hint, and a hedged likelihood. It never
returns "set this to X" or auto-applies anything. The player remains in control;
the layer's job is to help them understand, not to choose for them.

### 3. Results are ranked and relevant, not absolute

`analyseSettings` returns every setting, each scored against the player's probable
Bottleneck and ordered by relevance, rather than declaring a single correct
answer. Relevance is a small ordinal scale (`high` / `medium` / `low` /
`unlikely-to-help`), and confidence is expressed with the catalogue's likelihood
language, which has no "certain" member. A setting the catalogue honestly marks
as unlikely to help is reported as such and is never promoted by symptom or target
hints.

### 4. Server / streaming caveats are preserved

When the probable Bottleneck is `server-streaming`, the layer does not recommend
graphics settings as a fix. It explains that the limit is not on the player's
machine and surfaces each setting's `serverStreamingCaveat`. Caveats are also
preserved for individual settings under other Bottlenecks. This is the central
honesty guarantee and is enforced in the analysis, not left to UI copy.

### 5. Future telemetry and verification plug in here later

The input is a small, hand-supplied `PlayerContext` (probable Bottleneck, target,
optional symptoms, optional changed settings). We deliberately do **not** model
hardware databases, FPS numbers or real Telemetry yet, and we do not fake them.
When real Telemetry and verification arrive, they will populate `PlayerContext`
and feed the same pure functions, so the reasoning does not need rewriting.

## Consequences

- The UI calls one function and renders explanations; it holds no analysis logic.
- The client-vs-server honesty is structural and centralised.
- Symptoms and target gently influence ranking but can never manufacture
  certainty or override an honest "unlikely to help".
- No measured numbers exist yet; a later ADR will cover how Telemetry feeds this
  layer once it is real.

## Alternatives considered

- **Return a recommended configuration.** Rejected: contradicts the thesis and
  implies certainty we do not have.
- **Fake Telemetry/FPS now to look complete.** Rejected: dishonest and would bake
  in fragile assumptions before measurement exists.
- **Put scoring in the UI.** Rejected: scatters honesty rules and couples
  reasoning to presentation.
