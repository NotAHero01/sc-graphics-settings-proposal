# ADR 0003 — Language: English (UK) / en-GB across the project

- **Status:** accepted
- **Date:** 2026-06-12

## Context

The project must read as a single, professional proposal to a AAA studio. Mixing
languages, or mixing US and UK spelling, undermines that impression. A single
language standard needs to be set at the start and applied everywhere.

## Decision

All project files use **English (UK) / en-GB**. This applies to:

- product UI text;
- documentation;
- ADRs;
- proposal copy;
- the README;
- code comments where comments are written.

Standard technical terms are kept in their normal industry form and are **not**
anglicised or translated:

> CPU, GPU, VRAM, Upscaling, Frame Generation, Render Scale, VSync, HDR,
> Shader Cache, Bottleneck, Telemetry, Frame-time.

Spanish (or any other language) must not be mixed into project files.

## Consequences

- Spelling follows en-GB conventions (e.g. *behaviour*, *colour*, *optimise*,
  *catalogue*).
- The `<html lang>` attribute is `en-GB`.
- Reviewers can flag any non-en-GB text or mixed-language content as a defect.

## Alternatives considered

- **English (US) / en-US.** Equally professional, but en-GB was chosen as the
  house standard for this proposal.
- **Bilingual files.** Rejected: harder to maintain and reads as unfinished.
