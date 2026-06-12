import type { ReactNode } from 'react';
import type {
  AnalysisResult,
  CatalogueItem,
  SettingId,
  SettingValue,
  VerificationSummary,
} from '@scgs/core';
import { formatMagnitude, valueLabel } from './types';

interface SettingDetailPanelProps {
  readonly item: CatalogueItem | undefined;
  readonly analysis: AnalysisResult | undefined;
  readonly currentValue: SettingValue | undefined;
  readonly initialValue: SettingValue | undefined;
  readonly isChanged: boolean;
  readonly verification: VerificationSummary;
  readonly onChangeValue: (id: SettingId, next: SettingValue) => void;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="border-t border-neutral-800 pt-3">
      <h4 className="mb-1 text-xs uppercase tracking-wide text-neutral-500">{title}</h4>
      {children}
    </section>
  );
}

/**
 * Right panel: the detail for the selected setting. Everything shown here comes
 * from @scgs/core — the explanation, impact profile, the analysis reason and
 * relevance, the server/streaming caveat, and the verification hint. The UI only
 * lays it out; it never recomputes any of it.
 */
export function SettingDetailPanel({
  item,
  analysis,
  currentValue,
  initialValue,
  isChanged,
  verification,
  onChangeValue,
}: SettingDetailPanelProps) {
  if (!item || currentValue === undefined) {
    return <p className="p-6 text-sm text-neutral-500">Select a setting to see its details.</p>;
  }

  const caveat = analysis?.serverStreamingCaveat ?? item.serverStreamingCaveat;

  return (
    <div className="flex flex-col gap-3 p-6">
      <header>
        <h2 className="text-lg">{item.displayName}</h2>
        <p className="text-sm text-neutral-400">{item.explanation.summary}</p>
        <p className="mt-1 text-xs text-neutral-500">{item.explanation.whatItDoes}</p>
      </header>

      {/* Abstract, wireframe-level preview placeholder. */}
      <div className="grid h-28 place-items-center border border-dashed border-neutral-700 text-xs text-neutral-500">
        Preview unavailable in wireframe
      </div>

      <Section title="Value">
        <p className="mb-2 text-sm">
          Current: <span className="text-neutral-300">{valueLabel(item.id, currentValue)}</span>
        </p>
        {item.valueType === 'scalar' && item.range ? (
          <input
            type="range"
            min={item.range.min}
            max={item.range.max}
            step={item.range.step}
            value={Number(currentValue)}
            onChange={(e) => onChangeValue(item.id, Number(e.target.value))}
            className="w-full"
          />
        ) : (
          <select
            className="border border-neutral-600 bg-neutral-900 px-2 py-1 text-sm"
            value={String(currentValue)}
            onChange={(e) => onChangeValue(item.id, e.target.value)}
          >
            {item.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        )}
      </Section>

      <Section title="Likely client-side impact">
        <ul className="flex gap-4 text-sm">
          <li>
            GPU: <span className="text-neutral-300">{formatMagnitude(item.impact.gpu)}</span>
          </li>
          <li>
            CPU: <span className="text-neutral-300">{formatMagnitude(item.impact.cpu)}</span>
          </li>
          <li>
            VRAM: <span className="text-neutral-300">{formatMagnitude(item.impact.vram)}</span>
          </li>
        </ul>
      </Section>

      {analysis && (
        <Section title="Relevance to your situation">
          <p className="text-sm text-neutral-300">
            {analysis.relevance} — likelihood: {analysis.likelihood}
          </p>
          <p className="mt-1 text-sm text-neutral-400">{analysis.reason}</p>
        </Section>
      )}

      {caveat && (
        <Section title="Server / streaming caveat">
          <p className="text-sm text-neutral-300">{caveat}</p>
        </Section>
      )}

      <Section title="How to verify in gameplay">
        <p className="text-sm text-neutral-400">
          Observe: <span className="text-neutral-300">{item.verification.observe}</span>
        </p>
        <p className="mt-1 text-sm text-neutral-400">
          What it may indicate:{' '}
          <span className="text-neutral-300">{item.verification.expectedSignal}</span>
        </p>
        <p className="mt-1 text-xs text-neutral-500">
          This is an indication, not a certainty. Confirm it yourself in gameplay.
        </p>
      </Section>

      <Section title="Changed-state summary">
        {isChanged && initialValue !== undefined ? (
          <p className="text-sm text-neutral-300">
            {valueLabel(item.id, initialValue)} → {valueLabel(item.id, currentValue)}
          </p>
        ) : (
          <p className="text-sm text-neutral-500">No change recorded for this setting.</p>
        )}
        {verification.attribution === 'weak-multiple-changes' && (
          <p className="mt-1 text-xs text-neutral-400">
            {verification.changeCount} settings changed at once, so any effect cannot be
            attributed to this setting with confidence.
          </p>
        )}
      </Section>
    </div>
  );
}
