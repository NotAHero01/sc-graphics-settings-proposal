# Principles

> Status: exploratory proposal. Not validated with users.

These principles are the spine of the proposal. They are commitments about
behaviour, not stylistic preferences, and they are enforced in the core domain
logic rather than left to the discretion of UI copy.

## 1. Probabilistic, not absolute

The system never promises an outcome. It expresses guidance as a probability or
a likelihood, grounded in the available evidence (hardware and Telemetry).

- Preferred: "Your GPU is **probably** the main limit in this scene."
- Avoid: "This will fix your frame rate."

Reasons:

- Performance depends on many factors the menu cannot fully observe.
- Overconfident guidance that turns out wrong destroys trust instantly.
- A AAA audience includes experienced players who will spot false certainty.

This is encoded as a domain rule: the language layer in the core only emits
calibrated, hedged statements. See ADR
[`0003-language-en-gb.md`](decisions/0003-language-en-gb.md) for language form,
and the analysis/language modules (later phases) for the probabilistic model.

## 2. Client-side impact vs server / streaming limits

The system distinguishes clearly between:

- **Client-side limits** — CPU, GPU, VRAM. The player can influence these by
  changing settings.
- **Server / streaming limits** — caused by the game server or the streaming
  pipeline. The player generally cannot influence these by changing graphics
  settings.

The system **never implies that lowering graphics settings fixes a server
Bottleneck.** When the probable limit is server/streaming, the honest message is
that adjusting graphics is unlikely to help, and why.

This is the single most important credibility safeguard in the proposal. It is
treated as an invariant of the core analysis, not as a UI afterthought.

## 3. Help the player understand, do not decide for them

The menu surfaces relevance, probable Bottleneck, and verification. It does not
silently auto-apply a configuration. The player remains in control and learns
something about their own system in the process.

## 4. Verification over promises

Rather than promising that a change will help, the system helps the player
**check** whether it did, by comparing gameplay Telemetry before and after a
change — again expressed in probabilistic terms.

## Consequences

- The core owns these rules; the UI presents their results.
- Any feature that would require an absolute promise, or that would blur the
  client/server distinction, is out of scope by definition.
