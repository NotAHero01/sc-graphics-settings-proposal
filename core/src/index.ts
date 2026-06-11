// Public API for @scgs/core.
//
// This barrel is the ONLY entry point the UI may import from. Sub-modules
// (model, analysis, tracking, verification, language) are implemented in later
// phases and re-exported here as they land.
//
// The core is pure TypeScript: no React, no DOM. The UI depends on the core;
// the core never depends on the UI.
export {};
