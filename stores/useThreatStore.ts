import { create } from "zustand";
import type { ThreatEvent, FilterState, ThreatStats, } from "@/lib/types/threats";
import { threatsToLineFeatureCollection } from "@/lib/threats/geojson";
import { computeThreatStats } from "@/lib/threats/stats";
import { matchesFilters } from "@/lib/threats/filters";
const MAX_ACTIVE_THREATS = 30;
const MAX_LOGS = 100;
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
        set((state) => {
            const newActiveThreats = [threat, ...state.activeThreats].slice(0, MAX_ACTIVE_THREATS);
            const newLogs = [threat, ...state.logs].slice(0, MAX_LOGS);
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
            const activeThreats = state.activeThreats.filter((threat) => threat.timestamp + threat.duration > now);
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
            const filteredThreats = state.activeThreats.filter((threat) => matchesFilters(threat, state.filters));
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
export const selectFilteredLogs = (state: ThreatStore) => {
    return state.logs.filter((threat) => matchesFilters(threat, state.filters));
};
export const selectFilteredThreats = (state: ThreatStore) => {
    return state.activeThreats.filter((threat) => matchesFilters(threat, state.filters));
};
export const selectStatsFiltered = (state: ThreatStore) => {
    const filteredLogs = state.logs.filter((threat) => matchesFilters(threat, state.filters));
    return computeThreatStats(filteredLogs);
};
