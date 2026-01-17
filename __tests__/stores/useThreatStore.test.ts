import { act } from "@testing-library/react";
import { useThreatStore } from "@/stores/useThreatStore";
import type { ThreatEvent } from "@/lib/types/threats";
import { CITIES } from "@/lib/cities";
describe("useThreatStore", () => {
    beforeEach(() => {
        const store = useThreatStore.getState();
        useThreatStore.setState({
            activeThreats: [],
            logs: [],
            statsGlobal: {
                totalAttacks: 0,
                activeCritical: 0,
                byRegion: { NA: 0, SA: 0, EU: 0, AS: 0, OC: 0, AF: 0 },
                bySeverity: { low: 0, medium: 0, critical: 0 },
                topSourceRegion: null,
                topSourceCountry: null,
            },
            isLive: false,
            filters: {
                severity: { low: true, medium: true, critical: true },
                attackType: { DDoS: true, Phishing: true, Malware: true, BruteForce: true },
                timeRange: "all",
            },
            mapFeatures: null,
        });
        jest.useFakeTimers();
    });
    afterEach(() => {
        jest.useRealTimers();
    });
    const createMockThreat = (severity: ThreatEvent["severity"] = "low", type: ThreatEvent["type"] = "DDoS"): ThreatEvent => {
        return {
            id: `test-${Math.random()}`,
            timestamp: Date.now(),
            source: CITIES[0],
            target: CITIES[1],
            type,
            severity,
            duration: 5000,
            metadata: {
                ipAddress: "192.168.1.1",
            },
        };
    };
    describe("addThreat", () => {
        it("should add threat to activeThreats and logs", () => {
            const threat = createMockThreat();
            act(() => {
                useThreatStore.getState().addThreat(threat);
            });
            const state = useThreatStore.getState();
            expect(state.activeThreats).toContainEqual(threat);
            expect(state.logs).toContainEqual(threat);
        });
        it("should enforce MAX_ACTIVE_THREATS limit (30)", () => {
            act(() => {
                for (let i = 0; i < 35; i++) {
                    useThreatStore.getState().addThreat(createMockThreat());
                }
            });
            const state = useThreatStore.getState();
            expect(state.activeThreats.length).toBe(30);
        });
        it("should enforce MAX_LOGS limit (100)", () => {
            act(() => {
                for (let i = 0; i < 105; i++) {
                    useThreatStore.getState().addThreat(createMockThreat());
                }
            });
            const state = useThreatStore.getState();
            expect(state.logs.length).toBe(100);
        });
        it("should update statsGlobal when adding threats", () => {
            const threat1 = createMockThreat("low", "DDoS");
            const threat2 = createMockThreat("critical", "Phishing");
            act(() => {
                useThreatStore.getState().addThreat(threat1);
                useThreatStore.getState().addThreat(threat2);
            });
            const state = useThreatStore.getState();
            expect(state.statsGlobal.totalAttacks).toBe(2);
            expect(state.statsGlobal.bySeverity.low).toBe(1);
            expect(state.statsGlobal.bySeverity.critical).toBe(1);
        });
    });
    describe("toggleSimulation", () => {
        it("should toggle isLive state", () => {
            const initialState = useThreatStore.getState().isLive;
            act(() => {
                useThreatStore.getState().toggleSimulation();
            });
            expect(useThreatStore.getState().isLive).toBe(!initialState);
            act(() => {
                useThreatStore.getState().toggleSimulation();
            });
            expect(useThreatStore.getState().isLive).toBe(initialState);
        });
    });
    describe("setFilters", () => {
        it("should update severity filters", () => {
            act(() => {
                useThreatStore.getState().setFilters({
                    severity: { low: false, medium: true, critical: true },
                });
            });
            const state = useThreatStore.getState();
            expect(state.filters.severity.low).toBe(false);
            expect(state.filters.severity.medium).toBe(true);
            expect(state.filters.severity.critical).toBe(true);
        });
        it("should update attack type filters", () => {
            act(() => {
                useThreatStore.getState().setFilters({
                    attackType: { DDoS: false, Phishing: true, Malware: true, BruteForce: true },
                });
            });
            const state = useThreatStore.getState();
            expect(state.filters.attackType.DDoS).toBe(false);
        });
        it("should update time range filter", () => {
            act(() => {
                useThreatStore.getState().setFilters({ timeRange: "1min" });
            });
            const state = useThreatStore.getState();
            expect(state.filters.timeRange).toBe("1min");
        });
        it("should trigger updateMapFeatures when filters change", () => {
            const threat = createMockThreat();
            act(() => {
                useThreatStore.getState().addThreat(threat);
            });
            act(() => {
                jest.advanceTimersByTime(150);
            });
            const mapFeaturesBefore = useThreatStore.getState().mapFeatures;
            expect(mapFeaturesBefore).not.toBeNull();
            act(() => {
                useThreatStore.getState().setFilters({ timeRange: "1min" });
            });
            act(() => {
                jest.advanceTimersByTime(150);
            });
            const mapFeaturesAfter = useThreatStore.getState().mapFeatures;
            expect(mapFeaturesAfter).not.toBeNull();
        });
    });
    describe("pruneExpired", () => {
        it("should remove expired threats from activeThreats", () => {
            const now = Date.now();
            const activeThreat: ThreatEvent = {
                ...createMockThreat(),
                timestamp: now - 2000,
                duration: 5000,
            };
            const expiredThreat: ThreatEvent = {
                ...createMockThreat(),
                timestamp: now - 10000,
                duration: 5000,
            };
            act(() => {
                useThreatStore.getState().addThreat(activeThreat);
                useThreatStore.getState().addThreat(expiredThreat);
            });
            act(() => {
                useThreatStore.getState().pruneExpired();
            });
            const state = useThreatStore.getState();
            expect(state.activeThreats).toHaveLength(1);
            expect(state.activeThreats[0].id).toBe(activeThreat.id);
        });
    });
    describe("updateMapFeatures", () => {
        it("should debounce map feature updates", () => {
            const threat = createMockThreat();
            act(() => {
                useThreatStore.getState().addThreat(threat);
            });
            expect(useThreatStore.getState().mapFeatures).toBeNull();
            act(() => {
                jest.advanceTimersByTime(50);
            });
            expect(useThreatStore.getState().mapFeatures).toBeNull();
            act(() => {
                jest.advanceTimersByTime(60);
            });
            const mapFeatures = useThreatStore.getState().mapFeatures;
            expect(mapFeatures).not.toBeNull();
            expect(mapFeatures?.features).toHaveLength(1);
        });
        it("should create GeoJSON features from filtered threats", () => {
            const threat1 = createMockThreat("low", "DDoS");
            const threat2 = createMockThreat("critical", "Phishing");
            act(() => {
                useThreatStore.getState().addThreat(threat1);
                useThreatStore.getState().addThreat(threat2);
            });
            act(() => {
                jest.advanceTimersByTime(150);
            });
            let mapFeatures = useThreatStore.getState().mapFeatures;
            expect(mapFeatures?.features).toHaveLength(2);
            act(() => {
                useThreatStore.getState().setFilters({
                    severity: { low: true, medium: true, critical: false },
                });
            });
            act(() => {
                jest.advanceTimersByTime(150);
            });
            mapFeatures = useThreatStore.getState().mapFeatures;
            expect(mapFeatures?.features).toHaveLength(1);
            expect(mapFeatures?.features[0].properties.severity).toBe("low");
        });
    });
});
