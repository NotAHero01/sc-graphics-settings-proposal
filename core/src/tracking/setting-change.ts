import type { SettingId } from '../model/setting';
import type { AnalysisTarget, ProbableBottleneck } from '../analysis/player-context';

/**
 * A graphics setting's value. Kept to simple, serialisable primitives:
 * enum/toggle values are strings, scalar values are numbers.
 */
export type SettingValue = string | number;

/**
 * A single recorded change to one setting. This is a fact, not a judgement —
 * nothing here says whether the change was good. Serialisable by design.
 */
export interface SettingChange {
  readonly settingId: SettingId;
  readonly previousValue: SettingValue;
  readonly nextValue: SettingValue;
  /**
   * Monotonic order within a session, starting at 0. Deterministic and not
   * wall-clock, so the core never has to read the system clock.
   */
  readonly sequence: number;
  readonly reason?: string;
  readonly probableBottleneck?: ProbableBottleneck;
  readonly target?: AnalysisTarget;
  /**
   * Optional epoch milliseconds, supplied by the caller. The core never
   * generates this itself; it only stores what it is given.
   */
  readonly at?: number;
}
