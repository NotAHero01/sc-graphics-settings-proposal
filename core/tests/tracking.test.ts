import { describe, it, expect } from 'vitest';
import { createChangeSession, addSettingChange } from '../src/index';

describe('tracking', () => {
  it('creates serialisable session data', () => {
    const session = createChangeSession({
      id: 's1',
      label: 'Tuning for GPU',
      probableBottleneck: 'gpu',
      target: 'performance',
    });

    expect(session.changes).toHaveLength(0);
    // A round-trip through JSON proves there is nothing non-serialisable inside.
    expect(JSON.parse(JSON.stringify(session))).toEqual(session);
  });

  it('records a change immutably, without mutating the previous session', () => {
    const before = createChangeSession({ id: 's1', probableBottleneck: 'gpu' });
    const after = addSettingChange(before, {
      settingId: 'resolution',
      previousValue: '3840x2160',
      nextValue: '2560x1440',
    });

    expect(before.changes).toHaveLength(0); // unchanged
    expect(after).not.toBe(before);
    expect(after.changes).toHaveLength(1);
    expect(after.changes[0].sequence).toBe(0);
    // The change inherits the session's probable bottleneck.
    expect(after.changes[0].probableBottleneck).toBe('gpu');
  });

  it('keeps change order and sequence stable', () => {
    let session = createChangeSession({ id: 's1' });
    session = addSettingChange(session, {
      settingId: 'texture-quality',
      previousValue: 'ultra',
      nextValue: 'high',
    });
    session = addSettingChange(session, {
      settingId: 'shadow-quality',
      previousValue: 'high',
      nextValue: 'medium',
    });

    expect(session.changes.map((c) => c.settingId)).toEqual([
      'texture-quality',
      'shadow-quality',
    ]);
    expect(session.changes.map((c) => c.sequence)).toEqual([0, 1]);
  });
});
