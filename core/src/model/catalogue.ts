import type { CatalogueItem, SettingId } from './setting';

/**
 * The initial, intentionally small graphics settings catalogue.
 *
 * Impact and relevance are qualitative design-time estimates, not measured
 * values, and all Bottleneck relevance is expressed probabilistically. Several
 * entries carry a `serverStreamingCaveat` to state honestly when the setting
 * cannot fix a server or streaming problem.
 */
export const GRAPHICS_CATALOGUE: readonly CatalogueItem[] = [
  {
    id: 'resolution',
    displayName: 'Resolution',
    category: 'display',
    valueType: 'enum',
    options: [
      { value: '1920x1080', label: '1920 × 1080' },
      { value: '2560x1440', label: '2560 × 1440' },
      { value: '3840x2160', label: '3840 × 2160' },
    ],
    explanation: {
      summary: 'The number of pixels the game renders.',
      whatItDoes:
        'A higher resolution looks sharper but asks the GPU to shade many more pixels each frame.',
    },
    impact: { gpu: 'high', cpu: 'low', vram: 'medium' },
    relevance: [
      { bottleneck: 'gpu', likelihood: 'likely' },
      { bottleneck: 'vram', likelihood: 'possible' },
      {
        bottleneck: 'cpu',
        likelihood: 'unlikely',
        note: 'Resolution mostly loads the GPU; a CPU limit usually persists at lower resolutions.',
      },
    ],
    verification: {
      observe: 'GPU usage and Frame-time in a demanding scene',
      expectedSignal:
        'If the GPU was the limit, lowering resolution may reduce Frame-time and GPU usage.',
    },
  },
  {
    id: 'render-scale',
    displayName: 'Render Scale',
    category: 'upscaling',
    valueType: 'scalar',
    range: { min: 50, max: 200, step: 5, unit: '%' },
    explanation: {
      summary: 'Renders the 3D image above or below the output resolution, then rescales it.',
      whatItDoes:
        'Below 100% the GPU shades fewer pixels, which can raise frame rate at the cost of sharpness.',
    },
    impact: { gpu: 'high', cpu: 'low', vram: 'low' },
    relevance: [
      { bottleneck: 'gpu', likelihood: 'likely' },
      {
        bottleneck: 'cpu',
        likelihood: 'unlikely',
        note: 'Render Scale changes GPU pixel work; it will not relieve a CPU limit.',
      },
    ],
    verification: {
      observe: 'Frame-time and GPU usage at a fixed viewpoint',
      expectedSignal:
        'A GPU-limited scene may show lower Frame-time as Render Scale is reduced.',
    },
  },
  {
    id: 'upscaling',
    displayName: 'Upscaling',
    category: 'upscaling',
    valueType: 'enum',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'quality', label: 'Quality' },
      { value: 'balanced', label: 'Balanced' },
      { value: 'performance', label: 'Performance' },
    ],
    explanation: {
      summary: 'Reconstructs a higher-resolution image from a lower-resolution render.',
      whatItDoes:
        'More aggressive modes render fewer pixels for more performance, trading some image clarity.',
    },
    impact: { gpu: 'high', cpu: 'low', vram: 'low' },
    relevance: [
      { bottleneck: 'gpu', likelihood: 'likely' },
      { bottleneck: 'vram', likelihood: 'possible' },
      {
        bottleneck: 'cpu',
        likelihood: 'unlikely',
        note: 'Upscaling reduces GPU pixel work and rarely helps when the CPU is the limit.',
      },
    ],
    verification: {
      observe: 'GPU usage and frame rate before and after enabling Upscaling',
      expectedSignal:
        'If the GPU was the limit, a more aggressive mode may raise frame rate.',
    },
  },
  {
    id: 'texture-quality',
    displayName: 'Texture Quality',
    category: 'textures',
    valueType: 'enum',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'ultra', label: 'Ultra' },
    ],
    explanation: {
      summary: 'The resolution of textures loaded into memory.',
      whatItDoes:
        'Higher settings use more VRAM. Running short of VRAM can cause hitching as textures stream in and out.',
    },
    impact: { gpu: 'low', cpu: 'low', vram: 'high' },
    relevance: [
      { bottleneck: 'vram', likelihood: 'likely' },
      {
        bottleneck: 'gpu',
        likelihood: 'unlikely',
        note: 'If VRAM is ample, lowering Texture Quality rarely changes frame rate much.',
      },
    ],
    verification: {
      observe: 'VRAM usage and whether texture hitching appears',
      expectedSignal:
        'If VRAM was the limit, lowering this may reduce hitching and VRAM pressure.',
    },
    serverStreamingCaveat:
      'Hitching while new areas load can come from world streaming on the server side. Lowering Texture Quality may ease local VRAM pressure but will not fix server-driven streaming stutter.',
  },
  {
    id: 'shadow-quality',
    displayName: 'Shadow Quality',
    category: 'lighting',
    valueType: 'enum',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
      { value: 'ultra', label: 'Ultra' },
    ],
    explanation: {
      summary: 'The resolution and draw distance of shadows.',
      whatItDoes:
        'Higher shadow detail costs GPU time, and shadow setup can add CPU cost in complex scenes.',
    },
    impact: { gpu: 'high', cpu: 'medium', vram: 'low' },
    relevance: [
      { bottleneck: 'gpu', likelihood: 'likely' },
      { bottleneck: 'cpu', likelihood: 'possible' },
    ],
    verification: {
      observe: 'Frame-time in scenes with many shadow-casting lights',
      expectedSignal:
        'A GPU- or CPU-limited scene may show lower Frame-time at reduced Shadow Quality.',
    },
    serverStreamingCaveat:
      'Shadow Quality does not affect server desync or network stutter; it only changes local rendering cost.',
  },
  {
    id: 'cloud-quality',
    displayName: 'Cloud Quality',
    category: 'atmosphere',
    valueType: 'enum',
    options: [
      { value: 'low', label: 'Low' },
      { value: 'medium', label: 'Medium' },
      { value: 'high', label: 'High' },
    ],
    explanation: {
      summary: 'The detail of volumetric clouds.',
      whatItDoes:
        'Volumetric clouds are GPU-intensive, especially while flying through atmosphere near planets.',
    },
    impact: { gpu: 'high', cpu: 'low', vram: 'medium' },
    relevance: [
      {
        bottleneck: 'gpu',
        likelihood: 'likely',
        note: 'The cost is highest inside cloud layers and near planet surfaces.',
      },
    ],
    verification: {
      observe: 'Frame-time inside atmosphere versus in open space',
      expectedSignal:
        'If clouds were the GPU cost, Frame-time inside atmosphere may improve at lower settings.',
    },
    serverStreamingCaveat:
      'Frame drops near busy locations can be server-side. Cloud Quality only changes the local rendering cost of clouds.',
  },
  {
    id: 'volumetric-effects',
    displayName: 'Volumetric Effects',
    category: 'atmosphere',
    valueType: 'enum',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'low', label: 'Low' },
      { value: 'high', label: 'High' },
    ],
    explanation: {
      summary: 'Volumetric fog, light shafts and atmospheric scattering.',
      whatItDoes:
        'These effects add depth and mood but cost GPU time, particularly in foggy or backlit scenes.',
    },
    impact: { gpu: 'high', cpu: 'low', vram: 'low' },
    relevance: [{ bottleneck: 'gpu', likelihood: 'likely' }],
    verification: {
      observe: 'Frame-time in foggy or strongly backlit scenes',
      expectedSignal:
        'A GPU-limited scene with heavy fog may show lower Frame-time at reduced settings.',
    },
    serverStreamingCaveat:
      'Volumetric Effects are a local GPU cost only; they have no bearing on server or streaming performance.',
  },
  {
    id: 'anti-aliasing',
    displayName: 'Anti-Aliasing',
    category: 'post-processing',
    valueType: 'enum',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'low', label: 'Low' },
      { value: 'high', label: 'High' },
    ],
    explanation: {
      summary: 'Smooths jagged edges along surfaces.',
      whatItDoes:
        'Improves image stability with a usually moderate GPU cost that varies by method.',
    },
    impact: { gpu: 'medium', cpu: 'low', vram: 'low' },
    relevance: [
      { bottleneck: 'gpu', likelihood: 'possible' },
    ],
    verification: {
      observe: 'Frame-time and edge clarity when toggling the setting',
      expectedSignal:
        'If the GPU was near its limit, lowering Anti-Aliasing may give a small Frame-time reduction.',
    },
  },
  {
    id: 'motion-blur',
    displayName: 'Motion Blur',
    category: 'post-processing',
    valueType: 'toggle',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
    explanation: {
      summary: 'Blurs fast-moving parts of the image.',
      whatItDoes:
        'Largely a look-and-feel preference. Its performance cost is usually small.',
    },
    impact: { gpu: 'low', cpu: 'none', vram: 'none' },
    relevance: [
      {
        bottleneck: 'gpu',
        likelihood: 'unlikely',
        note: 'Mostly a visual preference; turning it off rarely changes frame rate meaningfully.',
      },
    ],
    verification: {
      observe: 'Personal comfort and motion clarity rather than Frame-time',
      expectedSignal:
        'Expect little measurable performance change; judge this one by feel.',
    },
    serverStreamingCaveat:
      'Motion Blur is cosmetic and does not affect server-side stutter or input feel caused by the network.',
  },
  {
    id: 'vsync',
    displayName: 'VSync',
    category: 'synchronisation',
    valueType: 'enum',
    options: [
      { value: 'off', label: 'Off' },
      { value: 'on', label: 'On' },
    ],
    explanation: {
      summary: 'Synchronises frames to the display to prevent tearing.',
      whatItDoes:
        'Removes screen tearing but can add input latency and cap frame rate. It is not a performance gain.',
    },
    impact: { gpu: 'none', cpu: 'none', vram: 'none' },
    relevance: [
      {
        bottleneck: 'gpu',
        likelihood: 'unlikely',
        note: 'VSync addresses tearing, not throughput; it will not raise frame rate.',
      },
    ],
    verification: {
      observe: 'Presence of tearing and input latency rather than raw frame rate',
      expectedSignal:
        'Expect tearing to disappear when on; expect no improvement in underlying performance.',
    },
    serverStreamingCaveat:
      'VSync does not fix server stutter or desync; it only governs how finished frames are presented to the display.',
  },
];

const CATALOGUE_BY_ID: ReadonlyMap<SettingId, CatalogueItem> = new Map(
  GRAPHICS_CATALOGUE.map((item) => [item.id, item]),
);

/** Returns the whole catalogue in display order. */
export function listSettings(): readonly CatalogueItem[] {
  return GRAPHICS_CATALOGUE;
}

/** Looks up a single catalogue item by its stable id, or `undefined`. */
export function getSetting(id: SettingId): CatalogueItem | undefined {
  return CATALOGUE_BY_ID.get(id);
}
