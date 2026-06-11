// Public API for @scgs/core.
//
// This barrel is the ONLY entry point the UI may import from. The UI imports
// from "@scgs/core" and never from deep core paths.
//
// The core is pure TypeScript: no React, no DOM. The UI depends on the core;
// the core never depends on the UI.

// Domain model — types
export type { SettingCategory } from './model/category';
export type {
  BottleneckType,
  Likelihood,
  BottleneckRelevance,
} from './model/bottleneck';
export type { ImpactMagnitude, ImpactProfile } from './model/impact';
export type {
  SettingId,
  SettingValueType,
  SettingOption,
  ScalarRange,
  Explanation,
  VerificationHint,
  CatalogueItem,
} from './model/setting';

// Domain model — catalogue
export { GRAPHICS_CATALOGUE, listSettings, getSetting } from './model/catalogue';
