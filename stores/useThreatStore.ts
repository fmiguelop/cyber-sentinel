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
} from "@/lib/types/threats";
import { threatsToLineFeatureCollection } from "@/lib/threats/geojson";
import { computeThreatStats } from "@/lib/threats/stats";
import { matchesFilters } from "@/lib/threats/filters";

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
}

// Debounce timer for map feature updates
let mapUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const MAP_UPDATE_DEBOUNCE_MS = 100;

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
    // Trigger map feature update when filters change
    get().updateMapFeatures();
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
      // Filter active threats based on current filters
      const filteredThreats = state.activeThreats.filter((threat) =>
        matchesFilters(threat, state.filters)
      );
      const features = threatsToLineFeatureCollection(filteredThreats);
      set({ mapFeatures: features });
      mapUpdateTimer = null;
    }, MAP_UPDATE_DEBOUNCE_MS);
  },

}));

// Selectors - exported as separate functions for use in components
export const selectFilteredLogs = (state: ThreatStore) => {
  return state.logs.filter((threat) => matchesFilters(threat, state.filters));
};

export const selectFilteredThreats = (state: ThreatStore) => {
  return state.activeThreats.filter((threat) =>
    matchesFilters(threat, state.filters)
  );
};

export const selectStatsFiltered = (state: ThreatStore) => {
  const filteredLogs = state.logs.filter((threat) =>
    matchesFilters(threat, state.filters)
  );
  return computeThreatStats(filteredLogs);
};
