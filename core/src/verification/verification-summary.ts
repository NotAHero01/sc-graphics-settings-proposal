import { getSetting } from '../model/catalogue';
import type { Likelihood } from '../model/bottleneck';
import type { ChangeSession } from '../tracking/change-session';
import type { VerificationObservation, VerificationOutcome } from './verification-outcome';

/** How safely an observation can be attributed to a specific change. */
export type AttributionStrength = 'single-change' | 'weak-multiple-changes' | 'none';

/**
 * A hedged, observational summary of a verification check. It reflects the
 * player's observation, never a computed verdict, and keeps server/streaming
 * caveats visible when relevant.
 */
export interface VerificationSummary {
  readonly outcome: VerificationOutcome;
  /** Hedged confidence in the reading. Never "certain". */
  readonly confidence: Likelihood;
  readonly summary: string;
  readonly attribution: AttributionStrength;
  readonly changeCount: number;
  readonly warnings: readonly string[];
  readonly serverStreamingReminder?: string;
}

const CONFIDENCE_RANK: Record<Likelihood, number> = {
  unlikely: 0,
  possible: 1,
  likely: 2,
};

const CONFIDENCE_PHRASE: Record<Likelihood, string> = {
  unlikely: 'low',
  possible: 'moderate',
  likely: 'reasonable',
};

/** Caps a confidence at a maximum. Used to weaken attribution honestly. */
function capConfidence(value: Likelihood, cap: Likelihood): Likelihood {
  return CONFIDENCE_RANK[value] <= CONFIDENCE_RANK[cap] ? value : cap;
}

/** Conservative default confidence when the player did not state one. */
function defaultConfidence(outcome: VerificationOutcome): Likelihood {
  switch (outcome) {
    case 'improved':
    case 'worsened':
    case 'unchanged':
      return 'possible';
    case 'inconclusive':
    case 'not-tested':
      return 'unlikely';
  }
}

function buildServerStreamingReminder(
  session: ChangeSession,
  observation: VerificationObservation,
): string | undefined {
  const flaggedByContext =
    session.probableBottleneck === 'server-streaming' ||
    observation.symptomFocus === 'server-lag-perception';

  const caveats = session.changes
    .map((change) => getSetting(change.settingId)?.serverStreamingCaveat)
    .filter((caveat): caveat is string => Boolean(caveat));

  if (!flaggedByContext && caveats.length === 0) return undefined;

  if (flaggedByContext) {
    return 'The probable limit was on the server or streaming side. Server conditions vary between sessions, so an apparent improvement may not be due to these graphics changes.';
  }

  // Keep the most relevant caveat visible even when context did not flag it.
  return caveats[0];
}

function buildSummary(
  outcome: VerificationOutcome,
  confidence: Likelihood,
  attribution: AttributionStrength,
  changeCount: number,
): string {
  const attr =
    attribution === 'weak-multiple-changes'
      ? ` Note: ${changeCount} settings changed together, so attribution to any single setting is weak.`
      : '';
  const phrase = CONFIDENCE_PHRASE[confidence];

  switch (outcome) {
    case 'improved':
      return `You observed an improvement after the change. Confidence in this reading: ${phrase}.${attr}`;
    case 'worsened':
      return `You observed worse performance after the change. Confidence in this reading: ${phrase}.${attr}`;
    case 'unchanged':
      return `You observed no clear change. Confidence in this reading: ${phrase}.${attr}`;
    case 'inconclusive':
      return `The check was inconclusive — there is not enough signal to judge whether the change helped.${attr}`;
    case 'not-tested':
      return `This change has not been tested in gameplay yet, so there is nothing to conclude.${attr}`;
  }
}

/**
 * Summarise a verification check. The player's observation is the source of
 * truth: this function hedges and contextualises it, but never decides that a
 * change helped.
 */
export function summariseVerification(
  session: ChangeSession,
  observation: VerificationObservation,
): VerificationSummary {
  const changeCount = session.changes.length;
  const warnings: string[] = [];

  // No changes recorded → not-tested. A first-class result, not a failure.
  if (changeCount === 0) {
    return {
      outcome: 'not-tested',
      confidence: 'unlikely',
      summary: 'No setting changes have been recorded yet, so there is nothing to verify.',
      attribution: 'none',
      changeCount: 0,
      warnings,
    };
  }

  const outcome = observation.outcome;

  // Attribution weakens, and confidence is capped, when several settings changed.
  let attribution: AttributionStrength;
  let confidenceCap: Likelihood;
  if (changeCount === 1) {
    attribution = 'single-change';
    confidenceCap = 'likely';
  } else {
    attribution = 'weak-multiple-changes';
    confidenceCap = 'possible';
    warnings.push(
      `${changeCount} settings changed before this check, so any effect cannot be attributed to a single setting with confidence.`,
    );
  }

  const stated = observation.confidence ?? defaultConfidence(outcome);
  const confidence = capConfidence(stated, confidenceCap);

  const serverStreamingReminder = buildServerStreamingReminder(session, observation);
  if (serverStreamingReminder) warnings.push(serverStreamingReminder);

  return {
    outcome,
    confidence,
    summary: buildSummary(outcome, confidence, attribution, changeCount),
    attribution,
    changeCount,
    warnings,
    serverStreamingReminder,
  };
}
