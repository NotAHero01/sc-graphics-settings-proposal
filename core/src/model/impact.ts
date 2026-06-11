/**
 * Relative, qualitative magnitude of a setting's cost on a resource.
 *
 * These are design-time estimates, not measured benchmark values, and must be
 * read as approximate. `variable` means the cost depends heavily on the scene or
 * other settings.
 */
export type ImpactMagnitude = 'none' | 'low' | 'medium' | 'high' | 'variable';

/**
 * Rough cost profile of a setting across the client-side resources the player
 * can influence. Server/streaming limits are intentionally not part of an impact
 * profile, because graphics settings do not spend that budget — see
 * `BottleneckType` and the `serverStreamingCaveat` on a catalogue item.
 */
export interface ImpactProfile {
  readonly gpu: ImpactMagnitude;
  readonly cpu: ImpactMagnitude;
  readonly vram: ImpactMagnitude;
}
