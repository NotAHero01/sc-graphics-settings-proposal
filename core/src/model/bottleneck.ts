/**
 * The kinds of limit that can constrain perceived performance.
 *
 * `server-streaming` is included deliberately. Some perception issues — stutter,
 * desync, hitching while the world streams in — originate in the game server or
 * the streaming pipeline and are NOT solved by changing client-side graphics
 * settings. The model must be able to express this, so the system never implies
 * that lowering graphics fixes a server Bottleneck.
 */
export type BottleneckType =
  | 'cpu'
  | 'gpu'
  | 'vram'
  | 'system'
  | 'server-streaming';

/**
 * Calibrated likelihood language. The model never asserts certainty about a
 * Bottleneck; it only expresses how likely an effect is. There is intentionally
 * no "certain" member.
 */
export type Likelihood = 'unlikely' | 'possible' | 'likely';

/**
 * How relevant adjusting a setting is to a given Bottleneck, expressed
 * probabilistically.
 *
 * `note` carries an optional honest caveat for this specific pairing (for
 * example, why a setting that usually helps the GPU will not help when the limit
 * is elsewhere).
 */
export interface BottleneckRelevance {
  readonly bottleneck: BottleneckType;
  readonly likelihood: Likelihood;
  readonly note?: string;
}
