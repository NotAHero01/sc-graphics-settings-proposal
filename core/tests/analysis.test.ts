import { describe, it, expect } from 'vitest';
import { analyseSettings } from '../src/index';
import type { AnalysisResult, PlayerContext } from '../src/index';

function resultFor(results: readonly AnalysisResult[], id: string): AnalysisResult {
  const found = results.find((r) => r.settingId === id);
  if (!found) throw new Error(`expected a result for "${id}"`);
  return found;
}

function rankOf(results: readonly AnalysisResult[], id: string): number {
  return results.findIndex((r) => r.settingId === id);
}

describe('analyseSettings', () => {
  it('surfaces GPU-heavy settings above irrelevant ones for a GPU bottleneck', () => {
    const context: PlayerContext = { probableBottleneck: 'gpu', target: 'performance' };
    const results = analyseSettings(context);

    expect(resultFor(results, 'resolution').relevance).toBe('high');
    // Motion Blur is essentially irrelevant to a GPU limit and must rank below it.
    expect(resultFor(results, 'motion-blur').relevance).toBe('unlikely-to-help');
    expect(rankOf(results, 'resolution')).toBeLessThan(rankOf(results, 'motion-blur'));
  });

  it('surfaces texture-related settings for a VRAM bottleneck', () => {
    const results = analyseSettings({ probableBottleneck: 'vram', target: 'performance' });

    expect(resultFor(results, 'texture-quality').relevance).toBe('high');
  });

  it('does not pretend Render Scale fixes a CPU bottleneck', () => {
    const results = analyseSettings({ probableBottleneck: 'cpu', target: 'performance' });
    const renderScale = resultFor(results, 'render-scale');

    expect(renderScale.relevance).toBe('unlikely-to-help');
    expect(renderScale.likelihood).toBe('unlikely');
    expect(renderScale.reason.toLowerCase()).toContain('cpu');
  });

  it('recommends no graphics fix and preserves caveats for a server-streaming bottleneck', () => {
    const results = analyseSettings({
      probableBottleneck: 'server-streaming',
      target: 'troubleshooting',
    });

    // Nothing is presented as a fix.
    expect(results.every((r) => r.relevance === 'unlikely-to-help')).toBe(true);
    expect(results.every((r) => r.likelihood === 'unlikely')).toBe(true);

    // At least one caveat is preserved and reflected in the reasoning.
    const texture = resultFor(results, 'texture-quality');
    expect(texture.serverStreamingCaveat).toBeTruthy();
    expect(texture.reason.toLowerCase()).toContain('server');
  });

  it('returns conservative, educational results for an unknown bottleneck', () => {
    const results = analyseSettings({ probableBottleneck: 'unknown', target: 'troubleshooting' });

    // Never claims a setting is highly relevant or "likely" when the limit is unknown.
    expect(results.every((r) => r.relevance !== 'high')).toBe(true);
    expect(results.every((r) => r.likelihood !== 'likely')).toBe(true);
    // Framed as educational rather than prescriptive.
    expect(resultFor(results, 'resolution').reason.toLowerCase()).toContain(
      'has not been identified',
    );
  });
});
