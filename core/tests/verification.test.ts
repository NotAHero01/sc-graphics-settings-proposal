import { describe, it, expect } from 'vitest';
import {
  createChangeSession,
  addSettingChange,
  summariseVerification,
} from '../src/index';
import type { ChangeSession, VerificationOutcome } from '../src/index';

function sessionWithResolutionChange(): ChangeSession {
  return addSettingChange(createChangeSession({ id: 's1' }), {
    settingId: 'resolution',
    previousValue: '3840x2160',
    nextValue: '2560x1440',
  });
}

describe('summariseVerification', () => {
  it('keeps every outcome first-class and never rewrites the observation', () => {
    const session = sessionWithResolutionChange();
    const outcomes: readonly VerificationOutcome[] = [
      'improved',
      'worsened',
      'unchanged',
      'inconclusive',
      'not-tested',
    ];

    for (const outcome of outcomes) {
      const summary = summariseVerification(session, { outcome });
      // The player's observation is the source of truth; it is reported verbatim.
      expect(summary.outcome).toBe(outcome);
      expect(summary.summary.length).toBeGreaterThan(0);
    }
  });

  it('weakens attribution and caps confidence when several settings changed', () => {
    let session = createChangeSession({ id: 's1' });
    session = addSettingChange(session, {
      settingId: 'resolution',
      previousValue: '3840x2160',
      nextValue: '2560x1440',
    });
    session = addSettingChange(session, {
      settingId: 'shadow-quality',
      previousValue: 'high',
      nextValue: 'low',
    });

    // Even a confident "improved" cannot stay high with two changes at once.
    const summary = summariseVerification(session, { outcome: 'improved', confidence: 'likely' });

    expect(summary.attribution).toBe('weak-multiple-changes');
    expect(summary.confidence).toBe('possible');
    expect(summary.warnings.some((w) => w.includes('2 settings'))).toBe(true);
  });

  it('keeps a server/streaming reminder visible when the bottleneck is server-streaming', () => {
    let session = createChangeSession({ id: 's1', probableBottleneck: 'server-streaming' });
    session = addSettingChange(session, {
      settingId: 'resolution',
      previousValue: '3840x2160',
      nextValue: '2560x1440',
    });

    const summary = summariseVerification(session, { outcome: 'improved' });

    expect(summary.serverStreamingReminder).toBeTruthy();
    expect(summary.warnings).toContain(summary.serverStreamingReminder);
  });

  it('keeps a caveat visible when a changed setting carries one', () => {
    // Texture Quality carries a server/streaming caveat even without a server bottleneck.
    const session = addSettingChange(createChangeSession({ id: 's1' }), {
      settingId: 'texture-quality',
      previousValue: 'ultra',
      nextValue: 'high',
    });

    const summary = summariseVerification(session, { outcome: 'improved' });

    expect(summary.serverStreamingReminder).toBeTruthy();
  });

  it('does not auto-judge that a change helped', () => {
    const session = sessionWithResolutionChange();

    // A "worsened" observation is never softened into an improvement.
    expect(summariseVerification(session, { outcome: 'worsened' }).outcome).toBe('worsened');

    // With no changes recorded, the result is not-tested, not a success.
    const empty = createChangeSession({ id: 's0' });
    const summary = summariseVerification(empty, { outcome: 'improved' });
    expect(summary.outcome).toBe('not-tested');
    expect(summary.attribution).toBe('none');
  });
});
