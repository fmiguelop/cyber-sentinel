import { threatsToLineFeatureCollection } from "@/lib/threats/geojson";
import type { ThreatEvent } from "@/lib/types/threats";
import { CITIES } from "@/lib/cities";

describe("geojson utilities", () => {
  const mockThreat: ThreatEvent = {
    id: "test-1",
    timestamp: Date.now(),
    source: CITIES[0],
    target: CITIES[1],
    type: "DDoS",
    severity: "critical",
    duration: 5000,
    metadata: {
      ipAddress: "192.168.1.1",
    },
  };

  describe("threatsToLineFeatureCollection", () => {
    it("should return a valid GeoJSON FeatureCollection", () => {
      const result = threatsToLineFeatureCollection([mockThreat]);

      expect(result.type).toBe("FeatureCollection");
      expect(result.features).toHaveLength(1);
    });

    it("should create LineString features with correct coordinates", () => {
      const result = threatsToLineFeatureCollection([mockThreat]);
      const feature = result.features[0];

      expect(feature.type).toBe("Feature");
      expect(feature.geometry.type).toBe("LineString");
      expect(feature.geometry.coordinates).toEqual([
        [mockThreat.source.lng, mockThreat.source.lat],
        [mockThreat.target.lng, mockThreat.target.lat],
      ]);
    });

    it("should include threat properties in feature properties", () => {
      const result = threatsToLineFeatureCollection([mockThreat]);
      const feature = result.features[0];

      expect(feature.properties).toMatchObject({
        id: mockThreat.id,
        severity: mockThreat.severity,
        type: mockThreat.type,
        timestamp: mockThreat.timestamp,
      });
    });

    it("should handle multiple threats", () => {
      const threat2: ThreatEvent = {
        ...mockThreat,
        id: "test-2",
        source: CITIES[2],
        target: CITIES[3],
      };

      const result = threatsToLineFeatureCollection([mockThreat, threat2]);

      expect(result.features).toHaveLength(2);
      expect(result.features[0].properties.id).toBe("test-1");
      expect(result.features[1].properties.id).toBe("test-2");
    });

    it("should handle empty array", () => {
      const result = threatsToLineFeatureCollection([]);

      expect(result.type).toBe("FeatureCollection");
      expect(result.features).toHaveLength(0);
    });
  });
});
