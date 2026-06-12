import type { AnalysisTarget, ProbableBottleneck } from '@scgs/core';
import { BOTTLENECK_OPTIONS, TARGET_OPTIONS } from './types';

interface ContextControlsProps {
  readonly bottleneck: ProbableBottleneck;
  readonly target: AnalysisTarget;
  readonly onBottleneckChange: (value: ProbableBottleneck) => void;
  readonly onTargetChange: (value: AnalysisTarget) => void;
}

/**
 * The context that drives analysis: the player's probable Bottleneck and what
 * they are trying to achieve. Changing these re-runs the analysis in core and
 * updates every relevance badge. This panel also states the product honesty
 * commitments in plain sight.
 */
export function ContextControls({
  bottleneck,
  target,
  onBottleneckChange,
  onTargetChange,
}: ContextControlsProps) {
  return (
    <section className="border-b border-neutral-700 py-3">
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">Probable bottleneck</span>
          <select
            className="border border-neutral-600 bg-neutral-900 px-2 py-1"
            value={bottleneck}
            onChange={(e) => onBottleneckChange(e.target.value as ProbableBottleneck)}
          >
            {BOTTLENECK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-neutral-400">Goal</span>
          <select
            className="border border-neutral-600 bg-neutral-900 px-2 py-1"
            value={target}
            onChange={(e) => onTargetChange(e.target.value as AnalysisTarget)}
          >
            {TARGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="mt-2 max-w-3xl text-xs leading-relaxed text-neutral-500">
        This tool does not optimise for you and does not promise results. It highlights
        which settings are <em>probably</em> relevant to your situation and asks you to
        verify any change in gameplay. Graphics settings cannot fix server or streaming
        limits.
      </p>
    </section>
  );
}
