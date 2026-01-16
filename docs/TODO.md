
# TODO – CyberSentinel Implementation Plan

## Overview

This TODO groups work **by module** while **following Phases 1–5** from `docs/requirements.md`. Each task uses checkboxes for tracking, and complex tasks include acceptance criteria. Dependencies are marked inline as `(depends on: …)`.

---

## Dependencies & Setup (Phase 1 – Scaffold)

- [ ] **Initialize Next.js + TS + Tailwind baseline**  
  - Ensure project uses latest Next.js App Router with TypeScript strict mode enabled.  
  - Confirm Tailwind is wired into `app/globals.css` and `postcss.config.mjs` / `tailwind.config` (if present).  
  - **Acceptance criteria**: App boots with a minimal dark background page, no TypeScript or build errors.

- [ ] **Install core dependencies**  
  - Run:  
    - `npm install mapcn maplibre-gl zustand framer-motion lucide-react date-fns @faker-js/faker`  
  - **Acceptance criteria**: `npm run dev` compiles without missing-module errors.

- [ ] **Setup shadcn/ui base configuration**  
  - Initialize shadcn/ui for the project (config, Tailwind plugin, `components` folder structure).  
  - **Acceptance criteria**: A sample shadcn `Button` renders correctly on a test page.

- [ ] **Add shadcn/ui primitives** (depends on: **Setup shadcn/ui base configuration**)  
  - [ ] Install and generate: `Card`, `Badge`, `ScrollArea`, `Button`, `Separator`, `Tooltip`.  
  - **Acceptance criteria**: All listed components can be imported from the local `components` and render without style or TS issues.

- [ ] **Global dark SOC theme wiring**  
  - Configure base background color `#09090b` (Zinc 950) and text colors in globals/Tailwind.  
  - Set global font stack to JetBrains Mono or Geist Mono and ensure it applies to all text.  
  - **Acceptance criteria**: Default page shows the dark SOC-style background and monospace typography.

---

## Data Layer (Phase 2 – Data Layer)

- [ ] **Define shared types for threats**  
  - Implement `AttackType`, `Severity`, and `ThreatEvent` interfaces as specified in `docs/requirements.md`, reusing the `City` interface from `lib/cities.ts`.  
  - Place types in a shared module (e.g., `lib/types/threats.ts`) for reuse across store, hooks, and components.  
  - **Acceptance criteria**: All references to threat data use these shared types with no `any`.

- [ ] **Utility helpers for random threat properties**  
  - Implement `getRandomSeverity()` and `getRandomAttackType()` utilities.  
  - Optionally add helpers for duration generation (3–10s) and derived severity color mapping.  
  - **Acceptance criteria**: Helpers are pure, typed, and covered by simple unit tests or story-level usage.

- [ ] **GeoJSON transformation utilities** (depends on: **Define shared types for threats**)  
  - Implement a utility that converts `activeThreats: ThreatEvent[]` into a `GeoJSON.FeatureCollection` for mapcn line rendering.  
  - Include per-feature properties for severity and type (for styling).  
  - **Acceptance criteria**: Given a sample list of threats, the function returns valid GeoJSON (can be logged and inspected in the map).

- [ ] **Regional statistics helpers** (optional, Phase 5-ready)  
  - Create functions that compute counts by `City.region`, severity, and type from `logs` or `activeThreats`.  
  - **Acceptance criteria**: Given a mock list of events, functions return accurate counts for NA/SA/EU/AS/OC/AF and per-severity totals.

---

## Zustand Store (Phase 2 – Data Layer)

- [ ] **Create `useThreatStore` with base state** (depends on: **Define shared types for threats**)  
  - State:  
    - `activeThreats: ThreatEvent[]` (max 30)  
    - `logs: ThreatEvent[]` (max 100)  
    - `stats` object (total attacks, attacks by region, severity distribution, top source region/country)  
    - `isLive: boolean`  
    - `filters` object (severity + attack type, and optional time range)  
    - `mapFeatures: GeoJSON.FeatureCollection | null`.  
  - **Acceptance criteria**: Store compiles and can be imported without circular dependencies.

- [ ] **Implement `addThreat(threat: ThreatEvent)` action**  
  - Append threat to `activeThreats` and `logs` while enforcing max sizes (30 and 100).  
  - Update `stats` incrementally for performance.  
  - **Acceptance criteria**: Repeated calls maintain bounded arrays and consistent stats.

- [ ] **Implement `toggleSimulation()` action**  
  - Flip `isLive` boolean.  
  - Tie into the simulation hook (start/stop interval).  
  - **Acceptance criteria**: UI-bound controls can pause and resume the generator via this action.

- [ ] **Implement `setFilters(filters: FilterState)` action**  
  - Update `filters` for severity and attack type (and time range).  
  - Ensure store exposes both raw logs and a derived, filtered view for components.  
  - **Acceptance criteria**: Changing filters updates derived selectors without mutating original data.

- [ ] **Implement debounced `updateMapFeatures()` action** (depends on: **GeoJSON transformation utilities**)  
  - Convert current `activeThreats` into `mapFeatures` using the utility function.  
  - Debounce updates to avoid excessive map re-renders under high event volume.  
  - **Acceptance criteria**: Under rapid `addThreat` calls, map updates at a reasonable cadence without noticeable jank.

---

## Threat Simulation Hook (Phase 2 – Data Layer)

- [ ] **Create `useThreatSimulation` hook** (depends on: **useThreatStore with base state**, **Utility helpers for random threat properties**)  
  - Use `setInterval` with randomized delays (500–2000ms) while `isLive` is `true`.  
  - On each tick:  
    - Pick `source` via `getRandomCity()` and `target` via `getRandomTarget(source)`.  
    - Generate `severity`, `type`, `duration`, and metadata (`ipAddress`, optional DDoS fields) using faker and helpers.  
    - Create a `ThreatEvent` and call `addThreat`.  
  - Clean up interval on unmount or when `isLive` becomes `false`.  
  - **Acceptance criteria**: When hook is used on the main page, events appear and stop in response to `isLive`.

- [ ] **Implement attack expiration logic**  
  - Track end time (`timestamp + duration`) and periodically remove expired threats from `activeThreats`.  
  - Ensure removal triggers `updateMapFeatures()` so lines disappear.  
  - **Acceptance criteria**: No more than ~30 active threats remain; old ones automatically drop off after 3–10s.

---

## Map Component (Phase 3 – Components)

- [ ] **Create `CyberMap` wrapper component** (depends on: **mapcn dependency installed**, **GeoJSON transformation utilities**, **useThreatStore with mapFeatures**)  
  - Use mapcn `<Map>` with dark style and proper viewport settings.  
  - Wire `mapFeatures` from the store into mapcn `<Source>` + `<Layer>` for LineStrings representing attacks.  
  - **Acceptance criteria**: With mock threats, lines are rendered between source and target coordinates on the globe/map.

- [ ] **Add severity-colored attack lines** (depends on: **CyberMap wrapper component**)  
  - Style lines by severity (green = low, yellow = medium, red = critical), using feature properties.  
  - Add opacity-based transitions for attack lifetime (CSS or mapcn-supported animation).  
  - **Acceptance criteria**: Critical vs low severity lines are visually distinct and fade out as attacks expire.

- [ ] **Add source/target markers with pulsing effect**  
  - Use mapcn `<Marker>` components for active source/target locations.  
  - Render custom SVG/HTML children with pulsing animation, colored by severity.  
  - **Acceptance criteria**: Each active threat shows clearly visible markers at source and target points.

- [ ] **Attach tooltips with attack details**  
  - Use shadcn `<Tooltip>` around markers or line hover regions.  
  - Show type, source/target cities, timestamp, and severity.  
  - **Acceptance criteria**: Hovering a marker reveals concise threat details with correct data.

---

## Dashboard UI (Phase 3 – Components)

- [ ] **Design full-screen bento-layout in `app/page.tsx`** (depends on: **Global dark SOC theme wiring**)  
  - Use CSS Grid or flex to allocate:  
    - Main map area (~80%)  
    - Top-left stats HUD  
    - Top-right control panel  
    - Bottom-right live log.  
  - **Acceptance criteria**: Layout matches the described regions and is responsive at typical desktop resolutions.

- [ ] **Implement `StatHUD` component** (depends on: **Zustand stats implementation**)  
  - Use shadcn `Card`, `Badge`, and `Separator` to show:  
    - Total attacks, active critical count, top source region/country, severity distribution.  
  - Visual styling with neon green/yellow/red accents.  
  - **Acceptance criteria**: Stats update in real time as new events are generated.

- [ ] **Implement `EventLog` component** (depends on: **Zustand logs state**, **Threat Simulation Hook**)  
  - Use shadcn `ScrollArea` for a terminal-style log at bottom-right.  
  - Use framer-motion to animate new entries (respecting `prefers-reduced-motion`).  
  - Show timestamp, type, severity, cities, and IP address per row.  
  - **Acceptance criteria**: New events appear at the top/bottom consistently, animation does not overwhelm, and log is limited to 100 entries.

- [ ] **Implement `ControlPanel` component** (depends on: **useThreatStore filters & toggleSimulation**)  
  - Add Play/Pause button using lucide-react icons bound to `toggleSimulation()`.  
  - Add severity and attack type filter checkboxes bound to `setFilters`.  
  - Add time range selector (Last 1min/5min/1hr) that filters the log view (and optionally stats).  
  - Add sound toggle UI (logic can be Phase 5).  
  - Add Export button for logs (logic can be Phase 5).  
  - **Acceptance criteria**: Changing controls visibly affects the map/log data displayed; Play/Pause reliably stops/starts events.

---

## Integration & Testing (Phase 4 – Integration)

- [ ] **Wire `useThreatSimulation` into `app/page.tsx`** (depends on: **Threat Simulation Hook**, **ControlPanel**, **CyberMap**, **EventLog**, **StatHUD**)  
  - Call the hook at the page level to drive global state.  
  - Ensure `isLive` from the store fully controls the simulation lifecycle.  
  - **Acceptance criteria**: Entire dashboard behaves as a cohesive system; toggling controls reflects across map, HUD, and log.

- [ ] **Connect filters throughout the dashboard**  
  - Map view: only render lines/markers for threats matching current filters.  
  - Log view: show filtered list based on severity/type/time range.  
  - Stats HUD: optionally reflect filtered vs global stats (decide and implement consistently).  
  - **Acceptance criteria**: Adjusting filters yields consistent filtered views across all modules.

- [ ] **Add basic unit/integration tests where feasible**  
  - Test utilities (severity/type generators, GeoJSON transformer, stats helpers).  
  - Test store actions (addThreat, toggleSimulation, filters, mapFeatures).  
  - Optionally add simple UI tests for key components (e.g., rendering under mock store state).  
  - **Acceptance criteria**: Test suite runs successfully and guards core data logic.

- [ ] **Manual performance test at ~30 active threats**  
  - Simulate or accelerate event generation to approach 30 concurrent active threats.  
  - Check FPS, map responsiveness, and log scrolling behavior.  
  - **Acceptance criteria**: Dashboard remains smooth on a typical dev machine with 30 active threats; no memory leaks obvious from DevTools.

---

## Polish & Enhancements (Phase 5 – Polish)

- [ ] **Sound effects for critical threats** (depends on: **ControlPanel sound toggle**)  
  - Add optional alert beep or subtle sound for new critical threats, respecting user settings.  
  - **Acceptance criteria**: Users can enable/disable sounds; no audio plays when disabled or for non-critical events (if that’s the chosen behavior).

- [ ] **Export logs as JSON/CSV** (depends on: **Zustand logs state**, **ControlPanel Export button**)  
  - Implement a function to transform current `logs` into JSON and CSV formats.  
  - Trigger file download (e.g., via `Blob` and `URL.createObjectURL`).  
  - **Acceptance criteria**: Clicking Export downloads a file; contents match currently visible or full logs (clearly documented in UI).

- [ ] **Accessibility pass**  
  - Ensure all controls are keyboard navigable and focus-visible.  
  - Add ARIA labels for key controls and landmarks.  
  - Add `aria-live` region to announce new critical threats to screen readers.  
  - **Acceptance criteria**: Dashboard is operable via keyboard only; screen reader announces critical events appropriately.

- [ ] **Reduced-motion handling**  
  - Respect `prefers-reduced-motion` for framer-motion animations, pulsing markers, and line transitions.  
  - **Acceptance criteria**: With reduced motion enabled, all non-essential animations are disabled or significantly toned down.

- [ ] **Visual refinement for SOC aesthetic**  
  - Tune colors, glow effects, borders, and typography to feel like a professional SOC dashboard.  
  - Validate contrast ratios for text and key UI controls.  
  - **Acceptance criteria**: UI feels cohesive, legible, and “production-ready” with a hacker/SOC vibe.

- [ ] **Optional advanced features (post-MVP)**  
  - Regional statistics visualizations (charts using region stats).  
  - Historical playback mode and scrubber.  
  - Heatmap overlay, real threat API integration, collaboration modes, custom alert rules.  
  - **Acceptance criteria**: Each enhancement is incremental and does not degrade core dashboard performance.