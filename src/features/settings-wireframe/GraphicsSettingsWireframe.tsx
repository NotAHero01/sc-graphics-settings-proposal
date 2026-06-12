import { useMemo, useState } from 'react';
import {
  addSettingChange,
  analyseSettings,
  createChangeSession,
  getSetting,
  listSettings,
  summariseVerification,
} from '@scgs/core';
import type {
  AnalysisResult,
  ImpactMagnitude,
  ProbableBottleneck,
  AnalysisTarget,
  CatalogueItem,
  SettingId,
  SettingValue,
  VerificationOutcome,
} from '@scgs/core';
import { ContextControls } from './context-controls';
import { SettingsList } from './SettingsList';
import { SettingDetailPanel } from './SettingDetailPanel';
import { SettingsFooter } from './SettingsFooter';
import {
  DIAGNOSTICS_TAB,
  OUTCOME_OPTIONS,
  PRIMARY_TABS,
  SUBSECTIONS,
  defaultValueFor,
  subSectionsForPrimary,
} from './types';

const CATALOGUE = listSettings();

const INITIAL_VALUES = Object.fromEntries(
  CATALOGUE.map((item) => [item.id, defaultValueFor(item.id)]),
) as Record<SettingId, SettingValue>;

// Illustrative only: a static figure derived from the catalogue's qualitative
// VRAM impact. This is NOT telemetry and is clearly labelled as estimated.
const VRAM_WEIGHT: Record<ImpactMagnitude, number> = {
  none: 0,
  low: 1,
  medium: 2,
  variable: 2,
  high: 3,
};
const VRAM_ESTIMATE_PCT = Math.round(
  (CATALOGUE.reduce((sum, item) => sum + VRAM_WEIGHT[item.impact.vram], 0) /
    (CATALOGUE.length * 3)) *
    100,
);

function itemsForSubsection(subsectionId: string): CatalogueItem[] {
  const subsection = SUBSECTIONS.find((s) => s.id === subsectionId);
  if (!subsection) return [];
  return subsection.settingIds
    .map((id) => getSetting(id))
    .filter((item): item is CatalogueItem => item !== undefined);
}

export function GraphicsSettingsWireframe() {
  const [primaryId, setPrimaryId] = useState('graphics');
  const [subsectionId, setSubsectionId] = useState('display');
  const [selectedId, setSelectedId] = useState<SettingId>('resolution');
  const [bottleneck, setBottleneck] = useState<ProbableBottleneck>('unknown');
  const [target, setTarget] = useState<AnalysisTarget>('performance');
  const [values, setValues] = useState<Record<SettingId, SettingValue>>(INITIAL_VALUES);
  const [applied, setApplied] = useState(false);
  const [observation, setObservation] = useState<VerificationOutcome>('not-tested');

  const changedIds = useMemo(
    () => CATALOGUE.filter((item) => values[item.id] !== INITIAL_VALUES[item.id]).map((i) => i.id),
    [values],
  );
  const changedSet = useMemo(() => new Set(changedIds), [changedIds]);

  // Tracking session, rebuilt from the diff using the core helpers — one change
  // per distinct setting, so attribution reflects how many settings differ.
  const session = useMemo(() => {
    let next = createChangeSession({
      id: 'wireframe-session',
      probableBottleneck: bottleneck,
      target,
    });
    for (const item of CATALOGUE) {
      if (values[item.id] !== INITIAL_VALUES[item.id]) {
        next = addSettingChange(next, {
          settingId: item.id,
          previousValue: INITIAL_VALUES[item.id],
          nextValue: values[item.id],
        });
      }
    }
    return next;
  }, [values, bottleneck, target]);

  const analysis = useMemo(
    () => analyseSettings({ probableBottleneck: bottleneck, target, changedSettings: changedIds }),
    [bottleneck, target, changedIds],
  );
  const analysisById = useMemo(() => {
    const map = new Map<SettingId, AnalysisResult>();
    for (const result of analysis) map.set(result.settingId, result);
    return map;
  }, [analysis]);

  const verification = useMemo(
    () => summariseVerification(session, { outcome: observation }),
    [session, observation],
  );

  const changedCount = changedIds.length;
  const validation =
    changedCount === 0 ? 'No changes' : applied ? 'Verification recommended' : 'Changes pending';

  const isDiagnostics = primaryId === DIAGNOSTICS_TAB;
  const subsections = subSectionsForPrimary(primaryId);
  const activeSubsection = SUBSECTIONS.find((s) => s.id === subsectionId);
  const visibleItems = useMemo(() => itemsForSubsection(subsectionId), [subsectionId]);
  const selectedItem = getSetting(selectedId);

  function selectPrimary(id: string) {
    setPrimaryId(id);
    if (id === DIAGNOSTICS_TAB) return;
    const first = subSectionsForPrimary(id)[0];
    if (first) selectSubsection(first.id);
  }

  function selectSubsection(id: string) {
    setSubsectionId(id);
    const first = itemsForSubsection(id)[0];
    if (first) setSelectedId(first.id);
  }

  function changeValue(id: SettingId, next: SettingValue) {
    setValues((prev) => ({ ...prev, [id]: next }));
    setApplied(false);
  }
  function resetChanges() {
    setValues(INITIAL_VALUES);
    setApplied(false);
    setObservation('not-tested');
  }
  function applyChanges() {
    if (changedCount > 0) setApplied(true);
  }

  return (
    <div className="app-root bg-neutral-950 text-neutral-100">
      <div className="app-surface">
        {/* Top-centre primary navigation (bounded height) */}
        <nav className="app-nav flex items-center justify-center gap-1 border-b border-neutral-700">
          {PRIMARY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => selectPrimary(tab.id)}
              className={`px-4 py-1 text-sm ${
                tab.id === primaryId ? 'border-b-2 border-neutral-200' : 'text-neutral-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <ContextControls
          bottleneck={bottleneck}
          target={target}
          onBottleneckChange={setBottleneck}
          onTargetChange={setTarget}
        />

        {/* Secondary submenu row — structural filter; single bounded row, scrolls horizontally */}
        {!isDiagnostics && (
          <div className="app-subnav flex items-center gap-1 border-b border-neutral-800">
            {subsections.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => selectSubsection(sub.id)}
                className={`shrink-0 border px-3 py-1 text-xs ${
                  sub.id === subsectionId
                    ? 'border-neutral-300 text-neutral-100'
                    : 'border-neutral-700 text-neutral-400'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Main body: two-column grid; columns scroll internally, stack on narrow screens */}
        <main className="app-body">
          <div className="main-grid">
            <div className="main-col main-col--left">
              {isDiagnostics ? (
                <DiagnosticsPanel
                  changedCount={changedCount}
                  observation={observation}
                  onObservationChange={setObservation}
                  summary={verification.summary}
                  warnings={verification.warnings}
                  outcome={verification.outcome}
                  confidence={verification.confidence}
                />
              ) : (
                <SettingsList
                  sectionLabel={activeSubsection?.label ?? ''}
                  items={visibleItems}
                  analysisById={analysisById}
                  values={values}
                  changedIds={changedSet}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              )}
            </div>

            <div className="main-col">
              <SettingDetailPanel
                item={selectedItem}
                analysis={analysisById.get(selectedId)}
                currentValue={values[selectedId]}
                initialValue={INITIAL_VALUES[selectedId]}
                isChanged={changedSet.has(selectedId)}
                verification={verification}
                onChangeValue={changeValue}
              />
            </div>
          </div>
        </main>

        <SettingsFooter
          changedCount={changedCount}
          validation={validation}
          vramEstimatePct={VRAM_ESTIMATE_PCT}
          onApply={applyChanges}
          onReset={resetChanges}
        />
      </div>
    </div>
  );
}

interface DiagnosticsPanelProps {
  readonly changedCount: number;
  readonly observation: VerificationOutcome;
  readonly onObservationChange: (value: VerificationOutcome) => void;
  readonly summary: string;
  readonly warnings: readonly string[];
  readonly outcome: VerificationOutcome;
  readonly confidence: string;
}

/** Diagnostics / verification view, fed entirely by `summariseVerification`. */
function DiagnosticsPanel({
  changedCount,
  observation,
  onObservationChange,
  summary,
  warnings,
  outcome,
  confidence,
}: DiagnosticsPanelProps) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <header>
        <h2 className="text-lg">Diagnostics &amp; verification</h2>
        <p className="text-sm text-neutral-400">
          Record what you observed after changing settings. The summary never decides for
          you — it reflects your observation and hedges it honestly.
        </p>
      </header>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-neutral-400">After your change, you observed</span>
        <select
          className="border border-neutral-600 bg-neutral-900 px-2 py-1"
          value={observation}
          onChange={(e) => onObservationChange(e.target.value as VerificationOutcome)}
        >
          {OUTCOME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <section className="border border-neutral-800 p-3 text-sm">
        <p className="text-neutral-300">{summary}</p>
        <p className="mt-2 text-xs text-neutral-500">
          Outcome: {outcome} · Confidence: {confidence} · {changedCount} changed
        </p>
        {warnings.length > 0 && (
          <ul className="mt-2 list-disc pl-5 text-xs text-neutral-400">
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
