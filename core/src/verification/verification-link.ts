import { getSetting } from '../model/catalogue';
import type { SettingId } from '../model/setting';
import type { SettingChange } from '../tracking/setting-change';

/**
 * Guidance for verifying one recorded change: how to observe it in gameplay and
 * the caveat that applies. Linking is kept separate from summarising because it
 * is a distinct concern — preparing a check versus reporting one.
 */
export interface VerificationLink {
  readonly settingId: SettingId;
  readonly displayName: string;
  /** What to watch in gameplay, from the catalogue's verification hint. */
  readonly observe: string;
  /** The hedged signal an improvement might show. */
  readonly expectedSignal: string;
  /** Preserved where the setting cannot address a server/streaming limit. */
  readonly serverStreamingCaveat?: string;
}

/**
 * Link a recorded change to its catalogue verification hint, so the player knows
 * how to check it. Returns `undefined` if the setting is unknown. Pure.
 */
export function linkAnalysisToVerification(
  change: SettingChange,
): VerificationLink | undefined {
  const item = getSetting(change.settingId);
  if (!item) return undefined;
  return {
    settingId: item.id,
    displayName: item.displayName,
    observe: item.verification.observe,
    expectedSignal: item.verification.expectedSignal,
    serverStreamingCaveat: item.serverStreamingCaveat,
  };
}
