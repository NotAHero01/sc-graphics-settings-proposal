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

// Analysis layer — types
export type {
  ProbableBottleneck,
  AnalysisTarget,
  Symptom,
  PlayerContext,
} from './analysis/player-context';
export type { RelevanceLevel, AnalysisResult } from './analysis/analysis-result';
export type { RelevanceAssessment } from './analysis/relevance';

// Analysis layer — functions
export { analyseSettings } from './analysis/analyse-settings';
export { assessRelevance } from './analysis/relevance';

// Tracking — types
export type { SettingValue, SettingChange } from './tracking/setting-change';
export type {
  ChangeSession,
  NewChangeSession,
  SettingChangeInput,
} from './tracking/change-session';

// Tracking — functions
export { createChangeSession, addSettingChange } from './tracking/change-session';

// Verification — types
export type {
  VerificationOutcome,
  VerificationObservation,
} from './verification/verification-outcome';
export type {
  AttributionStrength,
  VerificationSummary,
} from './verification/verification-summary';
export type { VerificationLink } from './verification/verification-link';

// Verification — functions
export { summariseVerification } from './verification/verification-summary';
export { linkAnalysisToVerification } from './verification/verification-link';
