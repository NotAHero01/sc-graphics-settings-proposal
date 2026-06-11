import type { Likelihood } from '../model/bottleneck';
import type { SettingId } from '../model/setting';
import type { Symptom } from '../analysis/player-context';

/**
 * The player's reported observation after a change. `inconclusive` and
 * `not-tested` are first-class results, not failures. There is deliberately no
 * outcome that asserts certainty.
 */
export type VerificationOutcome =
  | 'improved'
  | 'worsened'
  | 'unchanged'
  | 'inconclusive'
  | 'not-tested';

/**
 * What the player observed. This is the source of truth for verification; the
 * summary may hedge it but never overrides it.
 */
export interface VerificationObservation {
  readonly outcome: VerificationOutcome;
  /** Free-text, en-GB notes from the player. */
  readonly notes?: string;
  /** The player's own confidence in this observation. Never certain. */
  readonly confidence?: Likelihood;
  /** A symptom the player was focused on while checking. */
  readonly symptomFocus?: Symptom;
  /** Which setting's verification hint guided the observation, if any. */
  readonly verificationHintRef?: SettingId;
}
