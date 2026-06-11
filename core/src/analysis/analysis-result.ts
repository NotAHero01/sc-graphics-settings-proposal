import type { SettingCategory } from '../model/category';
import type { ImpactProfile } from '../model/impact';
import type { Likelihood } from '../model/bottleneck';
import type { SettingId, VerificationHint } from '../model/setting';

/**
 * How relevant a setting is to the player's situation, as a small ordinal scale.
 * `unlikely-to-help` is a first-class outcome: the layer must be able to say a
 * setting is honestly not worth changing for the current limit.
 */
export type RelevanceLevel = 'high' | 'medium' | 'low' | 'unlikely-to-help';

/**
 * One explained, ranked result for a single setting. This is data: an
 * explanation for the player, not a decision taken on their behalf.
 */
export interface AnalysisResult {
  readonly settingId: SettingId;
  readonly displayName: string;
  readonly category: SettingCategory;
  readonly relevance: RelevanceLevel;
  /** Plain-language, en-GB explanation of why this relevance was assigned. */
  readonly reason: string;
  /** The setting's likely client-side cost (GPU/CPU/VRAM), from the catalogue. */
  readonly clientImpact: ImpactProfile;
  /** Preserved where the setting cannot address a server/streaming limit. */
  readonly serverStreamingCaveat?: string;
  readonly verification: VerificationHint;
  /** Hedged confidence. The type has no "certain" member by design. */
  readonly likelihood: Likelihood;
  /** True when the player flagged this setting as recently changed. */
  readonly recentlyChanged?: boolean;
}
