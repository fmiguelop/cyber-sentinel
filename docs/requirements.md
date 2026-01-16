# Project: CyberSentinel - Real-Time Threat Intelligence Dashboard

## 1. Project Overview

Goal: Build a high-performance, dark-mode geospatial dashboard that visualizes simulated cybersecurity threats (DDoS, Brute Force, Malware) in real-time. Key Mechanic: A "Live Map" where arcs fly from attacker coordinates to victim coordinates, accompanied by a scrolling log and summary statistics. Target Aesthetic: "Hacker/SOC (Security Operations Center)" interface. Dark backgrounds, neon accents (green/red/amber), monospace fonts, high data density.

## 2. Tech Stack Requirements

Framework: latest Next.js with App Router + React 18.

Language: TypeScript (Strict Mode).

Styling: Tailwind CSS + shadcn/ui (Card, Badge, ScrollArea, Button, Separator, Tooltip).

Map Engine: mapcn (https://mapcn.dev) - MapLibre wrapper with shadcn/ui integration.

Note: Use the mapcn documentation context. We do not need API keys. Use the default dark style.

State Management: Zustand (for high-frequency data updates without re-rendering the entire tree).

Icons: lucide-react.

Animation: framer-motion.

## 3. Architecture & Data Flow

### 3.1 Data Model (TypeScript Interfaces)

We need robust typing for the simulated data. Note: `cities.ts` already exists with City interface and helper functions.
```ts
// cities.ts is already scaffolded with:
// - City interface (name, country, lat, lng, region)
// - CITIES array with ~19 cities across all regions
// - getRandomCity() helper
// - getRandomTarget(sourceCity) helper to prevent self-attacks

type AttackType = 'DDoS' | 'Phishing' | 'Malware' | 'BruteForce';
type Severity = 'low' | 'medium' | 'critical';

// Reuse City interface from cities.ts for source/target
interface ThreatEvent {
  id: string;
  timestamp: number;
  source: City; // Use existing City interface
  target: City; // Use existing City interface
  type: AttackType;
  severity: Severity;
  duration: number; // in milliseconds
  metadata: {
    ipAddress: string;
    payloadSize?: number; // for DDoS events (in KB)
    packetCount?: number; // for DDoS events
  };
}
```

### 3.2 State Management (Zustand)

The store must handle the "live feed" efficiently. It should maintain a buffer of the last N events to prevent memory leaks.

Store Name: useThreatStore

State:

- activeThreats: `Array<ThreatEvent>` (Max 30 items visible on map for performance).

- logs: `Array<ThreatEvent>` (Max 100 items for the sidebar log).

- stats: Object tracking total attacks, top source country, active severity level, attacks by region.

- isLive: Boolean (to pause/play the simulation).

- filters: Object for severity and attack type filtering.

- mapFeatures: GeoJSON.FeatureCollection (derived/memoized state for map rendering).

Actions:

- addThreat(threat: ThreatEvent): Adds new threat, shifts old ones out if limit reached.

- toggleSimulation(): Pauses/Resumes the generator.

- setFilters(filters: FilterState): Updates active filters.

- updateMapFeatures(): Debounced function to convert threats to GeoJSON (prevents excessive map re-renders).

### 3.3 The "Mock Socket" Generator

Instead of a real backend, create a useThreatSimulation hook.

- Logic: Uses setInterval (randomized between 500ms - 2000ms) to generate a random ThreatEvent.

- Source Data: Use the existing `getRandomCity()` and `getRandomTarget()` helpers from `cities.ts`.

- Data Generation: Use @faker-js/faker for realistic IP addresses and metadata.

- Duration Logic: Each attack should have a realistic duration (3-10 seconds) to control how long arcs stay visible.

Example generator logic:
```ts
const source = getRandomCity();
const target = getRandomTarget(source); // Prevents self-attacks
const severity = getRandomSeverity(); // Helper you'll create
const type = getRandomAttackType(); // Helper you'll create

const threat: ThreatEvent = {
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  source,
  target,
  type,
  severity,
  duration: Math.random() * 7000 + 3000, // 3-10 seconds
  metadata: {
    ipAddress: faker.internet.ipv4(),
    payloadSize: type === 'DDoS' ? Math.floor(Math.random() * 1000) : undefined,
    packetCount: type === 'DDoS' ? Math.floor(Math.random() * 10000) : undefined,
  }
};
```

## 4. UI/UX Specifications

### 4.1 Layout (Grid System)

Use a full-screen, bento-box style layout (CSS Grid).

- Main Area (80%): The Map.

- Overlay Top-Left: "Global Defcon Status" (Stat Cards showing total attacks, top source region, severity distribution).

- Overlay Bottom-Right: "Live Event Log" (Terminal style).

- Overlay Top-Right: Filter Controls (severity, attack type, time range selector).

### 4.2 Map Implementation (mapcn)

- Base Map: Use mapcn's `<Map>` component with dark theme preset.

- Markers:

  - Use mapcn's `<Marker>` component with custom children (pulsing circles rendered as SVG).

  - Color code markers by severity (Red = Critical, Yellow = Medium, Green = Low).

  - Add `<Tooltip>` on hover to show attack details (type, source/target cities, timestamp).

- Attack Lines (The "Wow" Factor):

  - Use mapcn's `<Source>` and `<Layer>` components for GeoJSON LineString features.

  - Each line represents a threat from `source.lat/lng` to `target.lat/lng`.

  - For better performance with many simultaneous lines, consider a custom Canvas overlay.

  - Lines should use CSS opacity transitions to fade out based on attack duration (~3-10 seconds).

  - Color lines by severity matching the marker colors.

Critical: Lines must disappear after their duration expires to keep the map clean. Optimize for max 30 simultaneous active threats.

### 4.3 Control Panel

Add a control panel (top-right overlay) with:

- **Pause/Play Button**: Toggle simulation with lucide-react icons (Play/Pause).

- **Filter Controls**: 
  - Severity checkboxes (Low, Medium, Critical)
  - Attack type checkboxes (DDoS, Phishing, Malware, BruteForce)

- **Time Range Selector**: Dropdown for "Last 1min", "Last 5min", "Last 1hr" (filters log view).

- **Sound Toggle**: Optional alert beeps for new critical threats (respects prefers-reduced-motion).

- **Export Button**: Download current logs as JSON/CSV.

### 4.4 Visual Polish (The "Professional" Feel)

- Font: Use JetBrains Mono or Geist Mono for all text to sell the "Code/Cyber" look.

- Animations: 
  - Use framer-motion for the entry of new items in the Log sidebar.
  - Respect `prefers-reduced-motion` - disable animations for users who prefer reduced motion.

- Colors:
  - Background: #09090b (Zinc 950)
  - Accents: #22c55e (Green-500 for low severity), #eab308 (Yellow-500 for medium), #ef4444 (Red-500 for critical).

- Accessibility:
  - Ensure all controls are keyboard navigable.
  - Add ARIA labels for screen readers.
  - Announce new critical threats to screen readers (use aria-live regions).

## 5. Implementation Steps

### Phase 1: Scaffold

- ✅ cities.ts already exists with City interface and helpers

- Initialize Next.js project with TypeScript and Tailwind (if not already done).

- Install dependencies:
```bash
  npm install mapcn maplibre-gl zustand framer-motion lucide-react date-fns @faker-js/faker
```

- Setup shadcn/ui and add components: Card, Badge, ScrollArea, Button, Separator, Tooltip.

### Phase 2: Data Layer

- ✅ `src/lib/cities.ts`: Already complete

- Create `src/stores/useThreatStore.ts`: Zustand store with all state and actions.

- Create `src/hooks/useThreatSimulation.ts`: The mock event generator using `getRandomCity()` and `getRandomTarget()`.

### Phase 3: Components

- `components/map/CyberMap.tsx`: The mapcn map wrapper with markers and lines.

- `components/dashboard/EventLog.tsx`: The scrolling sidebar with framer-motion animations.

- `components/dashboard/StatHUD.tsx`: The top-left stats cards (include region-based stats using the City.region field).

- `components/dashboard/ControlPanel.tsx`: Top-right filter and control panel.

### Phase 4: Integration

- Assemble in `app/page.tsx`.

- Connect `useThreatSimulation` hook.

- Wire up filters and controls to the Zustand store.

- Test performance with 30 simultaneous threats.

### Phase 5: Polish

- Add sound effects (optional, with toggle).

- Implement export functionality.

- Accessibility audit and keyboard navigation testing.

- Add loading states and error boundaries.

## 6. Performance Considerations

- **Map Rendering Optimization**: Use the debounced `updateMapFeatures()` action to prevent map re-renders on every threat addition.

- **Line Cleanup**: Implement proper disposal of expired attack arcs to prevent memory leaks.

- **Canvas vs SVG**: If performance degrades with many lines, switch from GeoJSON layers to Canvas-based rendering.

- **Start Conservative**: Begin with max 20-30 active threats, not 50. Increase if performance allows.

## 7. Optional Enhancements (Post-MVP)

- Regional statistics visualization using the existing City.region field (attacks by NA, SA, EU, AS, OC, AF).

- Historical playback mode (scrub through past events).

- Attack heatmap layer showing concentration zones.

- Integration with real threat intelligence APIs.

- Multi-user collaboration (shared dashboard view).

- Custom alert rules and notifications.