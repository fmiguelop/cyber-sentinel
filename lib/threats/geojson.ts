import type { ThreatEvent } from "@/lib/types/threats";
export interface ThreatLineFeatureProperties {
  id: string;
  severity: ThreatEvent["severity"];
  type: ThreatEvent["type"];
  timestamp: number;
}

export interface ThreatPointFeatureProperties {
  id: string;
  threatId: string;
  severity: ThreatEvent["severity"];
  type: ThreatEvent["type"];
  timestamp: number;
  pointType: "source" | "target";
  cityName: string;
  country: string;
  ipAddress: string;
}

export function threatsToLineFeatureCollection(
  activeThreats: ThreatEvent[]
): GeoJSON.FeatureCollection<GeoJSON.LineString, ThreatLineFeatureProperties> {
  const features: GeoJSON.Feature<
    GeoJSON.LineString,
    ThreatLineFeatureProperties
  >[] = activeThreats.map((threat) => ({
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [
        [threat.source.lng, threat.source.lat],
        [threat.target.lng, threat.target.lat],
      ],
    },
    properties: {
      id: threat.id,
      severity: threat.severity,
      type: threat.type,
      timestamp: threat.timestamp,
    },
  }));
  return {
    type: "FeatureCollection",
    features,
  };
}

export function threatsToPointFeatureCollection(
  activeThreats: ThreatEvent[]
): GeoJSON.FeatureCollection<GeoJSON.Point, ThreatPointFeatureProperties> {
  const features: GeoJSON.Feature<
    GeoJSON.Point,
    ThreatPointFeatureProperties
  >[] = activeThreats.flatMap((threat) => [
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [threat.source.lng, threat.source.lat],
      },
      properties: {
        id: `${threat.id}-source`,
        threatId: threat.id,
        severity: threat.severity,
        type: threat.type,
        timestamp: threat.timestamp,
        pointType: "source" as const,
        cityName: threat.source.name,
        country: threat.source.country,
        ipAddress: threat.metadata.ipAddress,
      },
    },
    {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [threat.target.lng, threat.target.lat],
      },
      properties: {
        id: `${threat.id}-target`,
        threatId: threat.id,
        severity: threat.severity,
        type: threat.type,
        timestamp: threat.timestamp,
        pointType: "target" as const,
        cityName: threat.target.name,
        country: threat.target.country,
        ipAddress: threat.metadata.ipAddress,
      },
    },
  ]);
  return {
    type: "FeatureCollection",
    features,
  };
}
