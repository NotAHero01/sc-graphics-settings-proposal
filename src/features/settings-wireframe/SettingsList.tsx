import type { AnalysisResult, CatalogueItem, SettingId, SettingValue } from '@scgs/core';
import { RELEVANCE_LABEL, formatCategory, valueLabel } from './types';

interface SettingsListProps {
  readonly sectionLabel: string;
  readonly items: readonly CatalogueItem[];
  readonly analysisById: ReadonlyMap<SettingId, AnalysisResult>;
  readonly values: Record<SettingId, SettingValue>;
  readonly changedIds: ReadonlySet<SettingId>;
  readonly selectedId: SettingId;
  readonly onSelect: (id: SettingId) => void;
}

/**
 * Left panel: the settings for the currently selected submenu subsection. Each
 * row reflects core data — current value, the relevance badge from
 * `analyseSettings`, a changed marker, and a marker when the setting carries a
 * server/streaming caveat. Empty subsections show a placeholder.
 */
export function SettingsList({
  sectionLabel,
  items,
  analysisById,
  values,
  changedIds,
  selectedId,
  onSelect,
}: SettingsListProps) {
  return (
    <section className="py-2">
      <h3 className="px-4 py-1 text-xs uppercase tracking-wide text-neutral-500">{sectionLabel}</h3>

      {items.length === 0 ? (
        <p className="px-4 py-6 text-sm text-neutral-500">No settings in this section yet.</p>
      ) : (
        <ul>
          {items.map((item) => {
            const analysis = analysisById.get(item.id);
            const isSelected = item.id === selectedId;
            const isChanged = changedIds.has(item.id);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`flex w-full items-center gap-3 px-4 py-2 text-left ${
                    isSelected ? 'bg-neutral-800' : 'hover:bg-neutral-900'
                  }`}
                >
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{item.displayName}</span>
                      {isChanged && (
                        <span className="border border-neutral-500 px-1 text-[10px] text-neutral-300">
                          Changed
                        </span>
                      )}
                      {item.serverStreamingCaveat && (
                        <span
                          className="border border-neutral-600 px-1 text-[10px] text-neutral-400"
                          title="This setting cannot fix a server/streaming limit"
                        >
                          Server caveat
                        </span>
                      )}
                    </span>
                    <span className="block text-[11px] text-neutral-500">
                      {formatCategory(item.category)}
                    </span>
                  </span>

                  <span className="text-xs text-neutral-400">
                    {valueLabel(item.id, values[item.id])}
                  </span>

                  {analysis && (
                    <span className="w-28 shrink-0 border border-neutral-600 px-1 text-center text-[10px] text-neutral-300">
                      {RELEVANCE_LABEL[analysis.relevance]}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
