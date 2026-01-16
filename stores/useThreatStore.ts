/**
 * Zustand store for managing threat events, logs, stats, and map features.
 * 
 * @see docs/requirements.md for detailed specifications
 */

import { create } from "zustand";
import type {
  ThreatEvent,
  FilterState,
  ThreatStats,
  TimeRange,
} from "@/lib/types/threats";
import { threatsToLineFeatureCollection } from "@/lib/threats/geojson";
import { computeThreatStats } from "@/lib/threats/stats";

const MAX_ACTIVE_THREATS = 30;
const MAX_LOGS = 100;

/**
 * Default filter state (all enabled)
 */
const defaultFilters: FilterState = {
  severity: {
    low: true,
    medium: true,
    critical: true,
  },
  attackType: {
    DDoS: true,
    Phishing: true,
    Malware: true,
    BruteForce: true,
  },
  timeRange: "all",
};

/**
 * Default stats (empty)
 */
const defaultStats: ThreatStats = {
  totalAttacks: 0,
  activeCritical: 0,
  byRegion: {
    NA: 0,
    SA: 0,
    EU: 0,
    AS: 0,
    OC: 0,
    AF: 0,
  },
  bySeverity: {
    low: 0,
    medium: 0,
    critical: 0,
  },
  topSourceRegion: null,
  topSourceCountry: null,
};

interface ThreatStore {
  // State
  activeThreats: ThreatEvent[];
  logs: ThreatEvent[];
  statsGlobal: ThreatStats;
  isLive: boolean;
  filters: FilterState;
  mapFeatures: GeoJSON.FeatureCollection<GeoJSON.LineString> | null;

  // Actions
  addThreat: (threat: ThreatEvent) => void;
  toggleSimulation: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  pruneExpired: () => void;
  updateMapFeatures: () => void;

  // Selectors (computed)
  selectFilteredLogs: () => ThreatEvent[];
  selectFilteredThreats: () => ThreatEvent[];
  selectStatsFiltered: () => ThreatStats;
}

// Debounce timer for map feature updates
let mapUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const MAP_UPDATE_DEBOUNCE_MS = 100;

/**
 * Helper to check if a threat matches the current filters
 */
function matchesFilters(threat: ThreatEvent, filters: FilterState): boolean {
  // Check severity filter
  if (!filters.severity[threat.severity]) {
    return false;
  }

  // Check attack type filter
  if (!filters.attackType[threat.type]) {
    return false;
  }

  // Check time range filter
  if (filters.timeRange !== "all") {
    const now = Date.now();
    const threatAge = now - threat.timestamp;
    const timeRangeMs: Record<TimeRange, number> = {
      "1min": 60 * 1000,
      "5min": 5 * 60 * 1000,
      "1hr": 60 * 60 * 1000,
      all: Infinity,
    };

    if (threatAge > timeRangeMs[filters.timeRange]) {
      return false;
    }
  }

  return true;
}

export const useThreatStore = create<ThreatStore>((set, get) => ({
  // Initial state
  activeThreats: [],
  logs: [],
  statsGlobal: defaultStats,
  isLive: false,
  filters: defaultFilters,
  mapFeatures: null,

  // Actions
  addThreat: (threat: ThreatEvent) => {
    set((state) => {
      // Add to activeThreats (bounded to MAX_ACTIVE_THREATS)
      const newActiveThreats = [threat, ...state.activeThreats].slice(
        0,
        MAX_ACTIVE_THREATS
      );

      // Add to logs (bounded to MAX_LOGS)
      const newLogs = [threat, ...state.logs].slice(0, MAX_LOGS);

      // Recompute global stats from all logs
      const newStatsGlobal = computeThreatStats(newLogs);

      return {
        activeThreats: newActiveThreats,
        logs: newLogs,
        statsGlobal: newStatsGlobal,
      };
    });

    // Trigger debounced map feature update
    get().updateMapFeatures();
  },

  toggleSimulation: () => {
    set((state) => ({
      isLive: !state.isLive,
    }));
  },

  setFilters: (newFilters: Partial<FilterState>) => {
    set((state) => ({
      filters: {
        ...state.filters,
        ...newFilters,
        severity: {
          ...state.filters.severity,
          ...(newFilters.severity || {}),
        },
        attackType: {
          ...state.filters.attackType,
          ...(newFilters.attackType || {}),
        },
      },
    }));
  },

  pruneExpired: () => {
    const now = Date.now();
    set((state) => {
      const activeThreats = state.activeThreats.filter(
        (threat) => threat.timestamp + threat.duration > now
      );

      return { activeThreats };
    });

    // Update map features after pruning
    get().updateMapFeatures();
  },

  updateMapFeatures: () => {
    // Clear existing timer
    if (mapUpdateTimer) {
      clearTimeout(mapUpdateTimer);
    }

    // Set new debounced update
    mapUpdateTimer = setTimeout(() => {
      const state = get();
      const features = threatsToLineFeatureCollection(state.activeThreats);
      set({ mapFeatures: features });
      mapUpdateTimer = null;
    }, MAP_UPDATE_DEBOUNCE_MS);
  },

  // Selectors
  selectFilteredLogs: () => {
    const state = get();
    return state.logs.filter((threat) => matchesFilters(threat, state.filters));
  },

  selectFilteredThreats: () => {
    const state = get();
    return state.activeThreats.filter((threat) =>
      matchesFilters(threat, state.filters)
    );
  },

  selectStatsFiltered: () => {
    const state = get();
    const filteredLogs = state.logs.filter((threat) =>
      matchesFilters(threat, state.filters)
    );
    return computeThreatStats(filteredLogs);
  },
}));
