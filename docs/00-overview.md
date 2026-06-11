# Overview

> Status: exploratory proposal. Not validated with users.

## The problem

Graphics settings menus in PC games typically present a long, flat list of
options. They assume the player already knows which settings matter for their
hardware, what each option costs, and how to tell whether a change helped. Most
players do not. The result is guesswork: people copy presets from a forum, lower
everything at once, or change nothing because the menu is intimidating.

In a Star Citizen / AAA-class title the problem is sharper, because performance
is shaped by several different limits at once — the CPU, the GPU, the available
VRAM, and the server/streaming pipeline — and lowering graphics settings only
affects some of them.

## The thesis

The menu does not decide the configuration for the player. Instead it:

1. **Explains relevance** — which settings actually matter for *this* player's
   situation, rather than presenting all settings as equally important.
2. **Identifies the probable Bottleneck** — CPU, GPU, VRAM, or server/streaming —
   from hardware and Telemetry, expressed as a probability, not a verdict.
3. **Tracks changes** — what the player changed, when, and from what to what.
4. **Helps verification** — whether a change appears to have helped in gameplay,
   compared honestly against the previous state.

## The differentiator

Two principles set this proposal apart and are non-negotiable:

- **Probabilistic, not absolute.** Guidance is always framed as *probable*.
  The system does not promise outcomes.
- **Client-side vs server/streaming honesty.** The system distinguishes what the
  player can influence locally from what is limited by the server or streaming.
  It never implies that lowering graphics settings fixes a server Bottleneck.

These principles are what make the proposal credible to a AAA studio. They are
recorded as a domain rule, not merely as wording — see
[`01-principles.md`](01-principles.md).

## Scope of this document set

- [`01-principles.md`](01-principles.md) — the honesty principles in detail.
- [`02-architecture.md`](02-architecture.md) — how the system is structured so
  these principles are enforced, not just stated.
- [`decisions/`](decisions/) — Architecture Decision Records (ADRs).
