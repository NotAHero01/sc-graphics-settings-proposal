# Architecture

> Status: exploratory proposal. Not validated with users.
>
> This document is the source of truth for the core/UI separation.

## Principle: separate the domain from the presentation

The most important structural decision in this project is the separation between
**core logic** and **UI**. It is what makes the proposal credible and
future-proof: the same domain logic can later be driven by real Telemetry without
rewriting the interface.

The separation is enforced physically, not by convention. The core is its own
workspace package (`@scgs/core`). The UI may import from it; the core cannot
import from the UI, because it does not depend on it. See ADRs
[`0001`](decisions/0001-core-as-separate-workspace.md) and
[`0002`](decisions/0002-dependency-direction-ui-to-core.md).

## Dependency direction

```
src/ (UI)  ───────depends on──────▶  @scgs/core
   ▲                                      │
   └──────────  never  ◀──────────────────┘
```

The UI imports the core only through its public barrel, `core/src/index.ts`.
Components never import from deep core paths.

## What lives in `core/` (pure TypeScript, no React, no DOM)

| Module          | Responsibility |
| --------------- | -------------- |
| `model/`        | Settings catalogue, hardware profiles, and the shape of gameplay Telemetry. Data and types. |
| `analysis/`     | From hardware + Telemetry → probable Bottleneck and the relevance of each setting for this player. Holds the client-vs-server distinction. |
| `tracking/`     | Record of changes: what was changed, when, and the before/after values. |
| `verification/` | Compares a "before" gameplay sample against an "after" sample and reports, probabilistically, whether the change appears to have helped. |
| `language/`     | Turns numeric results into calibrated, hedged statements. Never absolute. |

The core's TypeScript configuration deliberately excludes the DOM library, so an
accidental dependency on browser APIs fails to compile.

## What lives in `src/` (React + Tailwind + Zustand)

| Folder        | Responsibility |
| ------------- | -------------- |
| `app/`        | Entry point and application shell. |
| `features/`   | Views per capability (settings, diagnosis, tracking, verification). |
| `components/` | Reusable, presentational UI. |
| `store/`      | Zustand state for UI interaction; calls into the core via adapters. |
| `adapters/`   | Translate core results into UI-friendly shapes. The boundary layer. |
| `styles/`     | Tailwind entry and global styles. |

Rule of thumb: if a decision about *which setting matters* or *what Bottleneck
the player has* is being made inside a React component, it is in the wrong place.

## Telemetry

Telemetry is consumed by the core behind an interface. In early phases it is
simulated; later it can be replaced with a real source without touching the UI.
The interface boundary is what makes that swap cheap.

## Documentation

`docs/` holds the versioned proposal (`00`–), and `docs/decisions/` holds ADRs —
one decision per file, dated, following [`0000-template.md`](decisions/0000-template.md).
