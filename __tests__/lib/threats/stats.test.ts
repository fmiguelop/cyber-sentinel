import { computeThreatStats } from "@/lib/threats/stats";
import type { ThreatEvent } from "@/lib/types/threats";
import { CITIES } from "@/lib/cities";
describe("stats utilities", () => {
  const createMockThreat = (
    severity: ThreatEvent["severity"],
    type: ThreatEvent["type"],
    sourceRegion: ThreatEvent["source"]["region"],
    sourceCountry: string
  ): ThreatEvent => {
    const sourceCity =
      CITIES.find((c) => c.region === sourceRegion && c.country === sourceCountry) || CITIES[0];
    const targetCity = CITIES.find((c) => c.name !== sourceCity.name) || CITIES[1];
    return {
      id: `test-${Math.random()}`,
      timestamp: Date.now(),
      source: sourceCity,
      target: targetCity,
      type,
      severity,
      duration: 5000,
      metadata: {
        ipAddress: "192.168.1.1",
      },
    };
  };
  describe("computeThreatStats", () => {
    it("should return default stats for empty array", () => {
      const stats = computeThreatStats([]);
      expect(stats.totalAttacks).toBe(0);
      expect(stats.activeCritical).toBe(0);
      expect(stats.topSourceCountry).toBeNull();
      expect(stats.topSourceRegion).toBeNull();
    });
    it("should count total attacks correctly", () => {
      const threats = [
        createMockThreat("low", "DDoS", "NA", "USA"),
        createMockThreat("medium", "Phishing", "EU", "UK"),
        createMockThreat("critical", "Malware", "AS", "China"),
      ];
      const stats = computeThreatStats(threats);
      expect(stats.totalAttacks).toBe(3);
    });
    it("should count by severity correctly", () => {
      const threats = [
        createMockThreat("low", "DDoS", "NA", "USA"),
        createMockThreat("low", "Phishing", "EU", "UK"),
        createMockThreat("medium", "Malware", "AS", "China"),
        createMockThreat("critical", "BruteForce", "NA", "USA"),
      ];
      const stats = computeThreatStats(threats);
      expect(stats.bySeverity.low).toBe(2);
      expect(stats.bySeverity.medium).toBe(1);
      expect(stats.bySeverity.critical).toBe(1);
    });
    it("should count by region correctly", () => {
      const threats = [
        createMockThreat("low", "DDoS", "NA", "USA"),
        createMockThreat("medium", "Phishing", "NA", "USA"),
        createMockThreat("critical", "Malware", "EU", "UK"),
      ];
      const stats = computeThreatStats(threats);
      expect(stats.byRegion.NA).toBe(2);
      expect(stats.byRegion.EU).toBe(1);
      expect(stats.byRegion.AS).toBe(0);
    });
    it("should identify top source country", () => {
      const threats = [
        createMockThreat("low", "DDoS", "NA", "USA"),
        createMockThreat("medium", "Phishing", "NA", "USA"),
        createMockThreat("critical", "Malware", "EU", "UK"),
      ];
      const stats = computeThreatStats(threats);
      expect(stats.topSourceCountry).toBe("USA");
    });
    it("should identify top source region", () => {
      const threats = [
        createMockThreat("low", "DDoS", "NA", "USA"),
        createMockThreat("medium", "Phishing", "NA", "USA"),
        createMockThreat("critical", "Malware", "EU", "UK"),
      ];
      const stats = computeThreatStats(threats);
      expect(stats.topSourceRegion).toBe("NA");
    });
    it("should count active critical threats", () => {
      const now = Date.now();
      const threats: ThreatEvent[] = [
        {
          ...createMockThreat("critical", "DDoS", "NA", "USA"),
          timestamp: now - 2000,
          duration: 5000,
        },
        {
          ...createMockThreat("critical", "Phishing", "EU", "UK"),
          timestamp: now - 10000,
          duration: 5000,
        },
        {
          ...createMockThreat("low", "Malware", "AS", "China"),
          timestamp: now - 1000,
          duration: 5000,
        },
      ];
      const stats = computeThreatStats(threats);
      expect(stats.activeCritical).toBe(1);
    });
  });
});
