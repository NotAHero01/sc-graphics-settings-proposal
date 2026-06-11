import type { CatalogueItem } from '../model/setting';
import type { ImpactMagnitude } from '../model/impact';
import type { Likelihood } from '../model/bottleneck';
import type { RelevanceLevel } from './analysis-result';
import type { AnalysisTarget, PlayerContext, Symptom } from './player-context';

/**
 * Pure relevance scoring. Given a catalogue item and a player's context, this
 * produces a relevance level, a hedged likelihood, and a plain-language reason.
 * It decides nothing and reads no I/O.
 */
export interface RelevanceAssessment {
  readonly relevance: RelevanceLevel;
  readonly likelihood: Likelihood;
  readonly reason: string;
}

/** The client-side resources a graphics setting can spend. */
type ClientResource = 'gpu' | 'cpu' | 'vram';

const RESOURCE_LABEL: Record<ClientResource, string> = {
  gpu: 'GPU',
  cpu: 'CPU',
  vram: 'VRAM',
};

/** Rough ordinal weight of a qualitative impact magnitude. Not a benchmark. */
function magnitudeWeight(magnitude: ImpactMagnitude): number {
  switch (magnitude) {
    case 'high':
      return 3;
    case 'medium':
    case 'variable':
      return 2;
    case 'low':
      return 1;
    case 'none':
      return 0;
  }
}

/** Maps a relevance level to hedged confidence language. Never "certain". */
function levelToLikelihood(level: RelevanceLevel, allowLikely: boolean): Likelihood {
  switch (level) {
    case 'high':
      return allowLikely ? 'likely' : 'possible';
    case 'medium':
    case 'low':
      return 'possible';
    case 'unlikely-to-help':
      return 'unlikely';
  }
}

/**
 * Whether the player's symptoms/target suggest extra attention to this setting.
 * Returns 0 or 1; it can only ever nudge `low` up to `medium`, never manufacture
 * a `high` and never rescue an honest `unlikely-to-help`.
 */
function contextBoost(
  item: CatalogueItem,
  resource: ClientResource,
  context: PlayerContext,
): number {
  let score = 0;
  for (const symptom of context.symptoms ?? []) {
    score += symptomAffinity(symptom, item, resource);
  }
  score += targetAffinity(context.target, item, resource);
  return score > 0 ? 1 : 0;
}

function symptomAffinity(
  symptom: Symptom,
  item: CatalogueItem,
  resource: ClientResource,
): number {
  switch (symptom) {
    case 'low-fps':
      return resource === 'gpu' && magnitudeWeight(item.impact.gpu) >= 3 ? 1 : 0;
    case 'stutter':
    case 'hitching':
    case 'texture-pop-in':
      return item.id === 'texture-quality' ? 1 : 0;
    case 'input-lag':
      return item.id === 'vsync' || item.id === 'motion-blur' ? 1 : 0;
    case 'server-lag-perception':
      // Steers away from graphics fixes, so it adds no relevance to any setting.
      return 0;
  }
}

function targetAffinity(
  target: AnalysisTarget,
  item: CatalogueItem,
  resource: ClientResource,
): number {
  switch (target) {
    case 'performance':
      return resource === 'gpu' && magnitudeWeight(item.impact.gpu) >= 3 ? 1 : 0;
    case 'stability':
      return item.id === 'texture-quality' ? 1 : 0;
    case 'visual-quality':
    case 'troubleshooting':
      return 0;
  }
}

function applyContextBoost(
  base: RelevanceLevel,
  item: CatalogueItem,
  resource: ClientResource,
  context: PlayerContext,
): RelevanceLevel {
  // Only a `low` can be nudged, and only to `medium`. Honesty is preserved.
  if (base !== 'low') return base;
  return contextBoost(item, resource, context) > 0 ? 'medium' : 'low';
}

function buildResourceReason(
  item: CatalogueItem,
  resource: ClientResource,
  level: RelevanceLevel,
  note: string | undefined,
): string {
  const label = RESOURCE_LABEL[resource];
  let base: string;
  switch (level) {
    case 'high':
      base = `${item.displayName} is ${label}-heavy, so it is likely to be relevant when the ${label} is the probable limit.`;
      break;
    case 'medium':
      base = `${item.displayName} can affect ${label} load, so it may be worth trying when the ${label} is the probable limit.`;
      break;
    case 'low':
      base = `${item.displayName} has only a small effect on ${label} load, so any change is likely to be minor.`;
      break;
    case 'unlikely-to-help':
      base = `${item.displayName} is unlikely to change ${label} load noticeably.`;
      break;
  }
  return note ? `${base} ${note}` : base;
}

function assessForResource(
  item: CatalogueItem,
  resource: ClientResource,
  context: PlayerContext,
): RelevanceAssessment {
  const entry = item.relevance.find((r) => r.bottleneck === resource);
  const label = RESOURCE_LABEL[resource];

  // Honesty cap: if the catalogue explicitly marks this as unlikely for the
  // resource, the result stays `unlikely-to-help` regardless of any boost.
  if (entry?.likelihood === 'unlikely') {
    return {
      relevance: 'unlikely-to-help',
      likelihood: 'unlikely',
      reason: entry.note ?? `${item.displayName} is unlikely to relieve a ${label} limit.`,
    };
  }

  let base: RelevanceLevel;
  if (entry?.likelihood === 'likely') {
    base = 'high';
  } else if (entry?.likelihood === 'possible') {
    base = 'medium';
  } else {
    const weight = magnitudeWeight(item.impact[resource]);
    base = weight >= 3 ? 'medium' : weight >= 1 ? 'low' : 'unlikely-to-help';
  }

  const level = applyContextBoost(base, item, resource, context);
  return {
    relevance: level,
    likelihood: levelToLikelihood(level, true),
    reason: buildResourceReason(item, resource, level, entry?.note),
  };
}

function assessForServerStreaming(item: CatalogueItem): RelevanceAssessment {
  // Never recommend graphics settings as a fix for a server/streaming limit.
  const base = `The probable limit is on the server or streaming side. ${item.displayName} only changes local rendering, so adjusting it is unlikely to resolve a server-driven problem.`;
  const reason = item.serverStreamingCaveat
    ? `${base} ${item.serverStreamingCaveat}`
    : base;
  return { relevance: 'unlikely-to-help', likelihood: 'unlikely', reason };
}

function assessForSystem(item: CatalogueItem): RelevanceAssessment {
  // System-level limits (RAM, storage, thermal, background load) are rarely
  // resolved by graphics settings. VRAM-heavy settings are a partial exception.
  if (magnitudeWeight(item.impact.vram) >= 3) {
    return {
      relevance: 'low',
      likelihood: 'possible',
      reason: `${item.displayName} uses significant VRAM. If a system-level memory limit is involved, easing VRAM use may help a little, but a system limit is rarely solved by graphics settings alone.`,
    };
  }
  return {
    relevance: 'unlikely-to-help',
    likelihood: 'unlikely',
    reason: `${item.displayName} is unlikely to resolve a system-level limit such as memory, storage or thermal throttling.`,
  };
}

function assessForUnknown(item: CatalogueItem): RelevanceAssessment {
  // The limit is not yet known, so results are educational and cautious: we
  // describe the setting rather than recommend it, and never claim "likely".
  const weight = Math.max(
    magnitudeWeight(item.impact.gpu),
    magnitudeWeight(item.impact.cpu),
    magnitudeWeight(item.impact.vram),
  );
  const level: RelevanceLevel = weight >= 3 ? 'medium' : weight >= 1 ? 'low' : 'unlikely-to-help';
  return {
    relevance: level,
    likelihood: levelToLikelihood(level, false),
    reason: `The probable limit has not been identified yet. ${item.explanation.summary} To learn whether it matters for you, observe ${item.verification.observe}.`,
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled probable Bottleneck: ${String(value)}`);
}

/**
 * Assess one catalogue item against the player's context. Pure; the entry point
 * `analyseSettings` maps this across the catalogue.
 */
export function assessRelevance(
  item: CatalogueItem,
  context: PlayerContext,
): RelevanceAssessment {
  switch (context.probableBottleneck) {
    case 'gpu':
    case 'cpu':
    case 'vram':
      return assessForResource(item, context.probableBottleneck, context);
    case 'server-streaming':
      return assessForServerStreaming(item);
    case 'system':
      return assessForSystem(item);
    case 'unknown':
      return assessForUnknown(item);
    default:
      return assertNever(context.probableBottleneck);
  }
}
