interface SettingsFooterProps {
  readonly changedCount: number;
  readonly validation: string;
  readonly vramEstimatePct: number;
  readonly onApply: () => void;
  readonly onReset: () => void;
}

/** Wireframe footer: input hints, apply/reset, change count, estimated VRAM, validation state. */
export function SettingsFooter({
  changedCount,
  validation,
  vramEstimatePct,
  onApply,
  onReset,
}: SettingsFooterProps) {
  return (
    <footer className="app-footer flex items-center justify-between gap-6 border-t border-neutral-700 text-sm">
      {/* Left: keyboard / controller hints (illustrative). */}
      <div className="flex gap-4 text-xs text-neutral-500">
        <span>Esc Back</span>
        <span>↑↓ Navigate</span>
        <span>←→ Change value</span>
        <span>Enter Details</span>
      </div>

      {/* Centre: apply / reset. */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onApply}
          disabled={changedCount === 0}
          className="border border-neutral-500 px-3 py-1 disabled:opacity-40"
        >
          Apply Changes
        </button>
        <button
          type="button"
          onClick={onReset}
          disabled={changedCount === 0}
          className="border border-neutral-600 px-3 py-1 disabled:opacity-40"
        >
          Reset Changes
        </button>
      </div>

      {/* Right: change count, estimated VRAM bar, validation state. */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-neutral-400">
          {changedCount} changed {changedCount === 1 ? 'setting' : 'settings'}
        </span>

        <span className="flex items-center gap-2 text-neutral-500">
          <span>VRAM (est.)</span>
          <span className="block h-2 w-24 border border-neutral-600">
            <span
              className="block h-full bg-neutral-500"
              style={{ width: `${Math.min(Math.max(vramEstimatePct, 0), 100)}%` }}
            />
          </span>
        </span>

        <span className="border border-neutral-600 px-2 py-1 text-neutral-300">{validation}</span>
      </div>
    </footer>
  );
}
