import { create } from "zustand";
import type {
  ThreatEvent,
  FilterState,
  ThreatStats,
} from "@/lib/types/threats";
import { threatsToLineFeatureCollection } from "@/lib/threats/geojson";
import { computeThreatStats } from "@/lib/threats/stats";
import { compileFilters } from "@/lib/threats/filters";
const MAX_ACTIVE_THREATS = 300;
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
    CA: 0,
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
  speed: number;
  filters: FilterState;
  mapFeatures: GeoJSON.FeatureCollection<GeoJSON.LineString> | null;
  mapType: "globe" | "flat";
  soundEnabled: boolean;
  addThreat: (threat: ThreatEvent) => void;
  addThreats: (threats: ThreatEvent[]) => void;
  toggleSimulation: () => void;
  resetSimulation: () => void;
  setSpeed: (speed: number) => void;
  setFilters: (filters: Partial<FilterState>) => void;
  clearAllFilters: () => void;
  pruneExpired: () => void;
  updateMapFeatures: () => void;
  toggleMapType: () => void;
  toggleSound: () => void;
}
let mapUpdateTimer: ReturnType<typeof setTimeout> | null = null;
const MAP_UPDATE_DEBOUNCE_MS = 100;
export const useThreatStore = create<ThreatStore>((set, get) => ({
  activeThreats: [],
  logs: [],
  statsGlobal: defaultStats,
  isLive: false,
  speed: 1,
  filters: defaultFilters,
  mapFeatures: null,
  mapType: "globe",
  soundEnabled: true,
  addThreat: (threat: ThreatEvent) => {
    get().addThreats([threat]);
  },
  addThreats: (threats: ThreatEvent[]) => {
    if (threats.length === 0) return;
    set((state) => {
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
      speed: 1,
      activeThreats: [],
      logs: [],
      statsGlobal: defaultStats,
      filters: defaultFilters,
      mapFeatures: null,
    });
  },
  setSpeed: (speed: number) => {
    set({ speed });
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
      const compiledFilter = compileFilters(state.filters);
      const filteredThreats = state.activeThreats.filter(compiledFilter);
      const features = threatsToLineFeatureCollection(filteredThreats);
      set({ mapFeatures: features });
      mapUpdateTimer = null;
    }, MAP_UPDATE_DEBOUNCE_MS);
  },
  toggleMapType: () => {
    set((state) => ({
      mapType: state.mapType === "globe" ? "flat" : "globe",
    }));
  },
  toggleSound: () => {
    set((state) => ({
      soundEnabled: !state.soundEnabled,
    }));
  },
}));

let lastFilteredLogsFilters: FilterState | null = null;
let lastFilteredLogsLogs: ThreatEvent[] | null = null;
let lastFilteredLogsResult: ThreatEvent[] = [];

let lastFilteredThreatsFilters: FilterState | null = null;
let lastFilteredThreatsThreats: ThreatEvent[] | null = null;
let lastFilteredThreatsResult: ThreatEvent[] = [];

let lastStatsFilteredFilters: FilterState | null = null;
let lastStatsFilteredLogs: ThreatEvent[] | null = null;
let lastStatsFilteredResult: ThreatStats = defaultStats;

export const selectFilteredLogs = (state: ThreatStore): ThreatEvent[] => {
  if (
    state.filters === lastFilteredLogsFilters &&
    state.logs === lastFilteredLogsLogs
  ) {
    return lastFilteredLogsResult;
  }

  lastFilteredLogsFilters = state.filters;
  lastFilteredLogsLogs = state.logs;

  const compiledFilter = compileFilters(state.filters);
  lastFilteredLogsResult = state.logs.filter(compiledFilter);
  return lastFilteredLogsResult;
};

export const selectFilteredThreats = (state: ThreatStore): ThreatEvent[] => {
  if (
    state.filters === lastFilteredThreatsFilters &&
    state.activeThreats === lastFilteredThreatsThreats
  ) {
    return lastFilteredThreatsResult;
  }

  lastFilteredThreatsFilters = state.filters;
  lastFilteredThreatsThreats = state.activeThreats;

  const compiledFilter = compileFilters(state.filters);
  lastFilteredThreatsResult = state.activeThreats.filter(compiledFilter);
  return lastFilteredThreatsResult;
};

export const selectStatsFiltered = (state: ThreatStore): ThreatStats => {
  if (
    state.filters === lastStatsFilteredFilters &&
    state.logs === lastStatsFilteredLogs
  ) {
    return lastStatsFilteredResult;
  }

  lastStatsFilteredFilters = state.filters;
  lastStatsFilteredLogs = state.logs;

  const compiledFilter = compileFilters(state.filters);
  lastStatsFilteredResult = computeThreatStats(
    state.logs.filter(compiledFilter)
  );
  return lastStatsFilteredResult;
};
