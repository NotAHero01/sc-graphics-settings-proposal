import type { SettingId } from '../model/setting';
import type { AnalysisTarget, ProbableBottleneck } from '../analysis/player-context';
import type { SettingChange, SettingValue } from './setting-change';

/**
 * An ordered set of changes the player made in one sitting, with the optional
 * context they were working under. Immutable: the helpers below return new
 * sessions rather than mutating.
 */
export interface ChangeSession {
  readonly id: string;
  readonly label?: string;
  readonly probableBottleneck?: ProbableBottleneck;
  readonly target?: AnalysisTarget;
  readonly changes: readonly SettingChange[];
}

/** Parameters for starting a session. No changes are recorded yet. */
export interface NewChangeSession {
  readonly id: string;
  readonly label?: string;
  readonly probableBottleneck?: ProbableBottleneck;
  readonly target?: AnalysisTarget;
}

/** Start an empty change session. Pure. */
export function createChangeSession(input: NewChangeSession): ChangeSession {
  return {
    id: input.id,
    label: input.label,
    probableBottleneck: input.probableBottleneck,
    target: input.target,
    changes: [],
  };
}

/** Input for recording one change. Sequence is assigned by the session. */
export interface SettingChangeInput {
  readonly settingId: SettingId;
  readonly previousValue: SettingValue;
  readonly nextValue: SettingValue;
  readonly reason?: string;
  readonly probableBottleneck?: ProbableBottleneck;
  readonly target?: AnalysisTarget;
  readonly at?: number;
}

/**
 * Record a change, returning a new session. The change inherits the session's
 * Bottleneck/target unless the input overrides them. This only records; it makes
 * no judgement about the change.
 */
export function addSettingChange(
  session: ChangeSession,
  input: SettingChangeInput,
): ChangeSession {
  const change: SettingChange = {
    settingId: input.settingId,
    previousValue: input.previousValue,
    nextValue: input.nextValue,
    sequence: session.changes.length,
    reason: input.reason,
    probableBottleneck: input.probableBottleneck ?? session.probableBottleneck,
    target: input.target ?? session.target,
    at: input.at,
  };
  return { ...session, changes: [...session.changes, change] };
}
