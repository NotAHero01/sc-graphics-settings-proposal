import type { BottleneckType } from '../model/bottleneck';
import type { SettingId } from '../model/setting';

/**
 * The probable Bottleneck a player may have. Extends the model's `BottleneckType`
 * with `unknown`, used when the limit has not been identified. There is
 * deliberately no "certain" notion here.
 */
export type ProbableBottleneck = BottleneckType | 'unknown';

/**
 * What the player is trying to achieve. Used as a gentle ranking hint only; it
 * never overrides the honesty rules.
 */
export type AnalysisTarget =
  | 'visual-quality'
  | 'performance'
  | 'stability'
  | 'troubleshooting';

/**
 * Optional, player-reported symptoms. These are subjective observations, not
 * measurements, and only nudge ranking. `server-lag-perception` is included so a
 * player can express "it feels like the server", which steers away from graphics
 * fixes rather than towards them.
 */
export type Symptom =
  | 'stutter'
  | 'low-fps'
  | 'hitching'
  | 'texture-pop-in'
  | 'input-lag'
  | 'server-lag-perception';

/**
 * The deliberately small input to the analysis layer. No hardware database, no
 * FPS numbers, no real Telemetry yet — those will populate this same shape later
 * without changing the analysis functions.
 */
export interface PlayerContext {
  readonly probableBottleneck: ProbableBottleneck;
  readonly target: AnalysisTarget;
  readonly symptoms?: readonly Symptom[];
  /** Settings the player has recently changed, for later explanation. */
  readonly changedSettings?: readonly SettingId[];
}
