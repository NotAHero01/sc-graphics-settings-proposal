import { listSettings } from '../model/catalogue';
import type { AnalysisResult, RelevanceLevel } from './analysis-result';
import type { PlayerContext } from './player-context';
import { assessRelevance } from './relevance';

/** Sort order for relevance levels: most relevant first. */
const RELEVANCE_ORDER: Record<RelevanceLevel, number> = {
  high: 0,
  medium: 1,
  low: 2,
  'unlikely-to-help': 3,
};

/**
 * Analyse the whole catalogue against a player's context and return ranked,
 * explained results.
 *
 * Every setting is returned — including those that are unlikely to help — so the
 * player can understand the full picture. Nothing is decided or applied; each
 * result is an explanation. Confidence is hedged and server/streaming caveats are
 * preserved.
 */
export function analyseSettings(context: PlayerContext): readonly AnalysisResult[] {
  const changed = new Set(context.changedSettings ?? []);

  const results = listSettings().map((item): AnalysisResult => {
    const assessment = assessRelevance(item, context);
    return {
      settingId: item.id,
      displayName: item.displayName,
      category: item.category,
      relevance: assessment.relevance,
      reason: assessment.reason,
      clientImpact: item.impact,
      serverStreamingCaveat: item.serverStreamingCaveat,
      verification: item.verification,
      likelihood: assessment.likelihood,
      recentlyChanged: changed.has(item.id) ? true : undefined,
    };
  });

  // Stable sort: relevance first, then recently changed (most relevant to "what
  // changed"), then settings that carry a server/streaming caveat (educational),
  // then catalogue order.
  return [...results].sort((a, b) => {
    const byRelevance = RELEVANCE_ORDER[a.relevance] - RELEVANCE_ORDER[b.relevance];
    if (byRelevance !== 0) return byRelevance;

    if (a.recentlyChanged !== b.recentlyChanged) return a.recentlyChanged ? -1 : 1;

    const aCaveat = a.serverStreamingCaveat ? 0 : 1;
    const bCaveat = b.serverStreamingCaveat ? 0 : 1;
    if (aCaveat !== bCaveat) return aCaveat - bCaveat;

    return 0;
  });
}
