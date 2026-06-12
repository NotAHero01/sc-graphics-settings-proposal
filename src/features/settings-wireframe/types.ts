// UI-only structural helpers for the settings wireframe.
//
// This file holds presentation concerns only: how settings are grouped into
// subsections on screen, which primary tab reveals which subsections, and small
// label formatters. It contains NO analysis or scoring logic — that lives in
// @scgs/core and is consumed, never duplicated.

import { getSetting } from '@scgs/core';
import type {
  AnalysisTarget,
  ImpactMagnitude,
  ProbableBottleneck,
  RelevanceLevel,
  SettingId,
  SettingValue,
  VerificationOutcome,
} from '@scgs/core';

/** Top-centre primary navigation. */
export interface PrimaryTab {
  readonly id: string;
  readonly label: string;
}

export const DIAGNOSTICS_TAB = 'diagnostics';

export const PRIMARY_TABS: readonly PrimaryTab[] = [
  { id: 'graphics', label: 'Graphics' },
  { id: 'display', label: 'Display' },
  { id: 'advanced', label: 'Advanced' },
  { id: DIAGNOSTICS_TAB, label: 'Diagnostics' },
];

/**
 * Secondary submenu sections. Each lists the settings it contains. Some are
 * intentionally empty for now (placeholders for areas the catalogue does not
 * model yet) and will show an empty state.
 */
export interface SubSection {
  readonly id: string;
  readonly label: string;
  readonly settingIds: readonly SettingId[];
}

export const SUBSECTIONS: readonly SubSection[] = [
  { id: 'display', label: 'Display', settingIds: ['resolution'] },
  { id: 'upscaling', label: 'Upscaling', settingIds: ['render-scale', 'upscaling'] },
  {
    id: 'graphics',
    label: 'Graphics',
    settingIds: ['texture-quality', 'shadow-quality', 'cloud-quality', 'volumetric-effects'],
  },
  { id: 'ray-tracing', label: 'Ray tracing', settingIds: [] },
  { id: 'post-fx', label: 'Post-FX', settingIds: ['anti-aliasing', 'motion-blur'] },
  { id: 'performance', label: 'Performance', settingIds: ['vsync'] },
  { id: 'advanced', label: 'Advanced', settingIds: [] },
  { id: 'debug', label: 'Debug', settingIds: [] },
];

/**
 * Which subsections each primary tab exposes. "Graphics" is the full workspace;
 * "Display" and "Advanced" are scoped subsets. Selecting a primary tab first,
 * then a subsection, gives the two-level menu hierarchy.
 */
export const PRIMARY_SUBSECTIONS: Record<string, readonly string[]> = {
  graphics: [
    'display',
    'upscaling',
    'graphics',
    'ray-tracing',
    'post-fx',
    'performance',
    'advanced',
    'debug',
  ],
  display: ['display', 'upscaling'],
  advanced: ['performance', 'advanced', 'debug'],
};

export function subSectionsForPrimary(primaryId: string): readonly SubSection[] {
  const ids = PRIMARY_SUBSECTIONS[primaryId] ?? [];
  return ids
    .map((id) => SUBSECTIONS.find((s) => s.id === id))
    .filter((s): s is SubSection => s !== undefined);
}

export const RELEVANCE_LABEL: Record<RelevanceLevel, string> = {
  high: 'High relevance',
  medium: 'Medium relevance',
  low: 'Low relevance',
  'unlikely-to-help': 'Unlikely to help',
};

export const BOTTLENECK_OPTIONS: readonly { value: ProbableBottleneck; label: string }[] = [
  { value: 'unknown', label: 'Unknown (not identified)' },
  { value: 'gpu', label: 'GPU' },
  { value: 'cpu', label: 'CPU' },
  { value: 'vram', label: 'VRAM' },
  { value: 'system', label: 'System' },
  { value: 'server-streaming', label: 'Server / streaming' },
];

export const TARGET_OPTIONS: readonly { value: AnalysisTarget; label: string }[] = [
  { value: 'performance', label: 'Performance' },
  { value: 'visual-quality', label: 'Visual quality' },
  { value: 'stability', label: 'Stability' },
  { value: 'troubleshooting', label: 'Troubleshooting' },
];

export const OUTCOME_OPTIONS: readonly { value: VerificationOutcome; label: string }[] = [
  { value: 'not-tested', label: 'Not tested yet' },
  { value: 'improved', label: 'Improved' },
  { value: 'worsened', label: 'Worsened' },
  { value: 'unchanged', label: 'Unchanged' },
  { value: 'inconclusive', label: 'Inconclusive' },
];

/** A neutral default "current value" per setting, so the wireframe has state to show. */
export function defaultValueFor(id: SettingId): SettingValue {
  const item = getSetting(id);
  if (!item) return '';
  if (item.valueType === 'scalar' && item.range) {
    const { min, max } = item.range;
    return Math.min(Math.max(100, min), max);
  }
  return item.options?.[0]?.value ?? '';
}

/** Human-readable label for a setting value. */
export function valueLabel(id: SettingId, value: SettingValue): string {
  const item = getSetting(id);
  if (!item) return String(value);
  const option = item.options?.find((o) => o.value === value);
  if (option) return option.label;
  if (item.range?.unit) return `${value}${item.range.unit}`;
  return String(value);
}

export function formatCategory(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
}

export function formatMagnitude(magnitude: ImpactMagnitude): string {
  return magnitude.charAt(0).toUpperCase() + magnitude.slice(1);
}
