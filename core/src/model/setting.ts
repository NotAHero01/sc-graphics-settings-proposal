import type { SettingCategory } from './category';
import type { ImpactProfile } from './impact';
import type { BottleneckRelevance } from './bottleneck';

/**
 * Stable identifier for a graphics setting. Stable across versions and safe to
 * persist (used later by tracking). Adding a setting adds a member here.
 */
export type SettingId =
  | 'resolution'
  | 'render-scale'
  | 'upscaling'
  | 'texture-quality'
  | 'shadow-quality'
  | 'cloud-quality'
  | 'volumetric-effects'
  | 'anti-aliasing'
  | 'motion-blur'
  | 'vsync';

/** The shape of a setting's value. */
export type SettingValueType = 'enum' | 'toggle' | 'scalar';

/**
 * A selectable option for an `enum` setting, or a labelled state of a `toggle`.
 * `value` is stable and machine-facing; `label` is the en-GB display text.
 */
export interface SettingOption {
  readonly value: string;
  readonly label: string;
}

/** Numeric bounds for a `scalar` setting (for example Render Scale 50–200%). */
export interface ScalarRange {
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly unit?: string;
}

/**
 * User-facing explanation of a setting. en-GB, plain language, no promises.
 * `summary` is a one-line description; `whatItDoes` adds a little more context.
 */
export interface Explanation {
  readonly summary: string;
  readonly whatItDoes: string;
}

/**
 * How the player can check, in gameplay, whether a change to this setting
 * actually helped. Observational and probabilistic — never a guarantee.
 *
 * `observe` is what to watch (for example GPU usage or Frame-time); `expectedSignal`
 * describes, in hedged terms, what an improvement might look like.
 */
export interface VerificationHint {
  readonly observe: string;
  readonly expectedSignal: string;
}

/**
 * A single catalogue entry: the complete design-time description of one graphics
 * setting. This is data, not behaviour. Analysis (a later phase) reads it; it
 * decides nothing on its own.
 */
export interface CatalogueItem {
  readonly id: SettingId;
  readonly displayName: string;
  readonly category: SettingCategory;
  readonly valueType: SettingValueType;
  /** Present for `enum` and `toggle` settings. */
  readonly options?: readonly SettingOption[];
  /** Present for `scalar` settings. */
  readonly range?: ScalarRange;
  readonly explanation: Explanation;
  readonly impact: ImpactProfile;
  /** Probable relevance to each Bottleneck. Never expressed as certainty. */
  readonly relevance: readonly BottleneckRelevance[];
  readonly verification: VerificationHint;
  /**
   * Honest caveat shown when this setting cannot address a server/streaming
   * limit. Present on settings players commonly (and wrongly) expect to fix
   * stutter or desync that originates on the server.
   */
  readonly serverStreamingCaveat?: string;
}
