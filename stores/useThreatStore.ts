import { create } from "zustand";
import type {
  ThreatEvent,
  FilterState,
  ThreatStats,
} from "@/lib/types/threats";
import { threatsToLineFeatureCollection } from "@/lib/threats/geojson";
import { computeThreatStats } from "@/lib/threats/stats";
import { compileFilters, type CompiledFilter } from "@/lib/threats/filters";
const MAX_ACTIVE_THREATS = 100;
const MAX_LOGS = 1000;
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
  activeThreats: ThreatEvent[];
  logs: ThreatEvent[];
  statsGlobal: ThreatStats;
  isLive: boolean;
  filters: FilterState;
  mapFeatures: GeoJSON.FeatureCollection<GeoJSON.LineString> | null;
  soundEnabled: boolean;
  addThreat: (threat: ThreatEvent) => void;
  addThreats: (threats: ThreatEvent[]) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearAllFilters: () => void;
  pruneExpired: () => void;
  updateMapFeatures: () => void;
  toggleSound: () => void;
}
let mapUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const MAP_UPDATE_DEBOUNCE_MS = 100;
export const useThreatStore = create<ThreatStore>((set, get) => ({
  activeThreats: [],
  logs: [],
  statsGlobal: defaultStats,
  isLive: false,
  filters: defaultFilters,
  mapFeatures: null,
  soundEnabled: true,
  addThreat: (threat: ThreatEvent) => {
    get().addThreats([threat]);
  },
  addThreats: (threats: ThreatEvent[]) => {
    if (threats.length === 0) return;
    set((state) => {
      // Batch add threats: prepend new threats, then slice to max sizes
      const newActiveThreats = [...threats, ...state.activeThreats].slice(
        0,
        MAX_ACTIVE_THREATS
      );
      const newLogs = [...threats, ...state.logs].slice(0, MAX_LOGS);
      const newStatsGlobal = computeThreatStats(newLogs);
      return {
        activeThreats: newActiveThreats,
        logs: newLogs,
        statsGlobal: newStatsGlobal,
      };
    });
    get().updateMapFeatures();
  },
  toggleSimulation: () => {
    set((state) => ({
      isLive: !state.isLive,
    }));
  },
  resetSimulation: () => {
    if (mapUpdateTimer) {
      clearTimeout(mapUpdateTimer);
      mapUpdateTimer = null;
    }
    set({
      isLive: false,
      activeThreats: [],
      logs: [],
      statsGlobal: defaultStats,
      filters: defaultFilters,
      mapFeatures: null,
    });
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
    get().updateMapFeatures();
  },
  clearAllFilters: () => {
    set({ filters: defaultFilters });
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
    get().updateMapFeatures();
  },
  updateMapFeatures: () => {
    if (mapUpdateTimer) {
      clearTimeout(mapUpdateTimer);
    }
    mapUpdateTimer = setTimeout(() => {
      const state = get();
      const compiledFilter = getCompiledFilter(state.filters);
      const filteredThreats = state.activeThreats.filter(compiledFilter);
      const features = threatsToLineFeatureCollection(filteredThreats);
      set({ mapFeatures: features });
      mapUpdateTimer = null;
    }, MAP_UPDATE_DEBOUNCE_MS);
  },
  toggleSound: () => {
    set((state) => ({
      soundEnabled: !state.soundEnabled,
    }));
  },
}));
// Memoization cache for compiled filters
const filterCache = new WeakMap<FilterState, CompiledFilter>();
let lastFilterKey: string = "";

function getCompiledFilter(filters: FilterState): CompiledFilter {
  const filterKey = JSON.stringify(filters);
  if (filterKey === lastFilterKey && filterCache.has(filters)) {
    return filterCache.get(filters)!;
  }
  const compiled = compileFilters(filters);
  filterCache.set(filters, compiled);
  lastFilterKey = filterKey;
  return compiled;
}

// Memoized selectors with result caching
let cachedFilteredLogs: ThreatEvent[] | null = null;
let cachedFilteredLogsFilterKey: string = "";
let cachedFilteredLogsArray: ThreatEvent[] | null = null;

let cachedFilteredThreats: ThreatEvent[] | null = null;
let cachedFilteredThreatsFilterKey: string = "";
let cachedFilteredThreatsArray: ThreatEvent[] | null = null;

let cachedStatsFiltered: ThreatStats | null = null;
let cachedStatsFilteredFilterKey: string = "";
let cachedStatsFilteredArray: ThreatEvent[] | null = null;

export const selectFilteredLogs = (state: ThreatStore): ThreatEvent[] => {
  const filterKey = JSON.stringify(state.filters);
  if (
    cachedFilteredLogs &&
    cachedFilteredLogsFilterKey === filterKey &&
    cachedFilteredLogsArray === state.logs
  ) {
    return cachedFilteredLogs;
  }
  const compiledFilter = getCompiledFilter(state.filters);
  const filtered = state.logs.filter(compiledFilter);
  cachedFilteredLogs = filtered;
  cachedFilteredLogsFilterKey = filterKey;
  cachedFilteredLogsArray = state.logs;
  return filtered;
};

export const selectFilteredThreats = (state: ThreatStore): ThreatEvent[] => {
  const filterKey = JSON.stringify(state.filters);
  if (
    cachedFilteredThreats &&
    cachedFilteredThreatsFilterKey === filterKey &&
    cachedFilteredThreatsArray === state.activeThreats
  ) {
    return cachedFilteredThreats;
  }
  const compiledFilter = getCompiledFilter(state.filters);
  const filtered = state.activeThreats.filter(compiledFilter);
  cachedFilteredThreats = filtered;
  cachedFilteredThreatsFilterKey = filterKey;
  cachedFilteredThreatsArray = state.activeThreats;
  return filtered;
};

export const selectStatsFiltered = (state: ThreatStore): ThreatStats => {
  const filterKey = JSON.stringify(state.filters);
  if (
    cachedStatsFiltered &&
    cachedStatsFilteredFilterKey === filterKey &&
    cachedStatsFilteredArray === state.logs
  ) {
    return cachedStatsFiltered;
  }
  const compiledFilter = getCompiledFilter(state.filters);
  const filteredLogs = state.logs.filter(compiledFilter);
  const stats = computeThreatStats(filteredLogs);
  cachedStatsFiltered = stats;
  cachedStatsFilteredFilterKey = filterKey;
  cachedStatsFilteredArray = state.logs;
  return stats;
};
