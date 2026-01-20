import { matchesFilters } from "@/lib/threats/filters";
import type { ThreatEvent, FilterState } from "@/lib/types/threats";
import { CITIES } from "@/lib/cities";
describe("filter utilities", () => {
  const createMockThreat = (
    severity: ThreatEvent["severity"],
    type: ThreatEvent["type"],
    ageMs: number = 0
  ): ThreatEvent => {
    return {
      id: "test-1",
      timestamp: Date.now() - ageMs,
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
  describe("matchesFilters", () => {
    it("should match threat when all filters are enabled", () => {
      const threat = createMockThreat("low", "DDoS");
      expect(matchesFilters(threat, defaultFilters)).toBe(true);
    });
    it("should filter by severity", () => {
      const threat = createMockThreat("critical", "DDoS");
      const filters: FilterState = {
        ...defaultFilters,
        severity: {
          low: true,
          medium: true,
          critical: false,
        },
      };
      expect(matchesFilters(threat, filters)).toBe(false);
    });
    it("should filter by attack type", () => {
      const threat = createMockThreat("low", "DDoS");
      const filters: FilterState = {
        ...defaultFilters,
        attackType: {
          DDoS: false,
          Phishing: true,
          Malware: true,
          BruteForce: true,
        },
      };
      expect(matchesFilters(threat, filters)).toBe(false);
    });
    it("should filter by time range (1min)", () => {
      const recentThreat = createMockThreat("low", "DDoS", 30 * 1000);
      const oldThreat = createMockThreat("low", "DDoS", 90 * 1000);
      const filters: FilterState = {
        ...defaultFilters,
        timeRange: "1min",
      };
      expect(matchesFilters(recentThreat, filters)).toBe(true);
      expect(matchesFilters(oldThreat, filters)).toBe(false);
    });
    it("should filter by time range (5min)", () => {
      const recentThreat = createMockThreat("low", "DDoS", 3 * 60 * 1000);
      const oldThreat = createMockThreat("low", "DDoS", 6 * 60 * 1000);
      const filters: FilterState = {
        ...defaultFilters,
        timeRange: "5min",
      };
      expect(matchesFilters(recentThreat, filters)).toBe(true);
      expect(matchesFilters(oldThreat, filters)).toBe(false);
    });
    it("should filter by time range (1hr)", () => {
      const recentThreat = createMockThreat("low", "DDoS", 30 * 60 * 1000);
      const oldThreat = createMockThreat("low", "DDoS", 90 * 60 * 1000);
      const filters: FilterState = {
        ...defaultFilters,
        timeRange: "1hr",
      };
      expect(matchesFilters(recentThreat, filters)).toBe(true);
      expect(matchesFilters(oldThreat, filters)).toBe(false);
    });
    it("should match all threats when timeRange is 'all'", () => {
      const veryOldThreat = createMockThreat("low", "DDoS", 24 * 60 * 60 * 1000);
      const filters: FilterState = {
        ...defaultFilters,
        timeRange: "all",
      };
      expect(matchesFilters(veryOldThreat, filters)).toBe(true);
    });
    it("should require all filter conditions to pass", () => {
      const threat = createMockThreat("critical", "DDoS", 30 * 1000);
      const filters: FilterState = {
        severity: {
          low: false,
          medium: false,
          critical: true,
        },
        attackType: {
          DDoS: true,
          Phishing: false,
          Malware: false,
          BruteForce: false,
        },
        timeRange: "1min",
      };
      expect(matchesFilters(threat, filters)).toBe(true);
      filters.severity.critical = false;
      expect(matchesFilters(threat, filters)).toBe(false);
    });
  });
});
