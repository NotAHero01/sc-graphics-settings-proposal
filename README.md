# SC Graphics Settings — Proposal & Prototype

An exploratory design proposal and interactive prototype for a PC graphics
settings menu in a Star Citizen / AAA-class game. The work is **not** validated
with users; it is a professional, exploratory proposal.

## Thesis

The menu does not decide the configuration for the player. It helps the player
**understand** which settings are relevant to their situation, identifies the
**probable bottleneck** (CPU, GPU, VRAM, or server/streaming), tracks the changes
they make, and helps them **verify** whether a change actually helped in gameplay.

All guidance is expressed as **probable, not certain**. The proposal is explicit
about the difference between client-side impact and server/streaming limits, and
never implies that lowering graphics settings fixes a server bottleneck.

## Project shape

- `core/` — pure TypeScript domain logic. No React, no DOM. Its own workspace
  package (`@scgs/core`). The UI may depend on the core; the core never depends
  on the UI.
- `src/` — the React + Tailwind + Zustand prototype. Presentation and interaction
  only; it consumes the core and never holds business rules.
- `docs/` — the versioned proposal, principles, architecture, and Architecture
  Decision Records (ADRs).

## Language

All project files are written in **English (UK) / en-GB**. Standard technical
terms (CPU, GPU, VRAM, Upscaling, Frame Generation, Render Scale, VSync, HDR,
Shader Cache, Bottleneck, Telemetry, Frame-time) are kept in their normal
industry form.

## Status

Phase 0 — scaffold and foundational documentation only. No product features are
implemented yet. Dependencies are declared but **not installed**.

## Getting started (later)

```sh
pnpm install
pnpm dev
```

> `pnpm install` has intentionally **not** been run yet.
