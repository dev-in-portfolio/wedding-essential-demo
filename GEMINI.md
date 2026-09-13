# Web Development & Build Verification Invariants

When working on any web applications, portals, or demonstration websites in this workspace:

1. **Mandatory Production Build Verification**:
   - Always run the production build command (e.g., `npm run build`) after making code changes.
   - Confirm zero build errors, zero broken imports, and verified asset bundling into `dist/`.

2. **Mandatory Headless Visual Inspection**:
   - Do NOT declare a UI, styling, or layout task complete without visually inspecting the rendered site on a local server.
   - Launch headless Chrome/Edge via `puppeteer-core` to capture high-resolution screenshots.
   - Minimum verification coverage:
     - **Desktop Viewport (1440x900)**: Hero, typography hierarchy, card alignments, and grid balance.
     - **Mobile Viewport (390x844)**: Responsive stacking, touch targets, hamburger toggle, and full-screen drawer navigation.
     - **Interactive Overlays**: Modals, dialogues, and drawer open states.
   - Inspect rendered images with `view_file` to detect visual flaws:
     - **Containing-Block Traps**: Elements with `backdrop-filter`, `transform`, or `filter` on parents creating unintended coordinate bounds for `position: fixed` children.
     - **Grid Orphans**: Inflexible `auto-fit` minimum widths causing uneven orphan items on the final row.
     - **Mobile Clipping & Scroll Spacing**: Header overlap, lack of `scroll-margin-top`, or unscrollable full-height overlays.
