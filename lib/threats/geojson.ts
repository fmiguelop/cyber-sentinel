import type { ThreatEvent } from "@/lib/types/threats";
export interface ThreatLineFeatureProperties {
    id: string;
    severity: ThreatEvent["severity"];
    type: ThreatEvent["type"];
    timestamp: number;
}
export function threatsToLineFeatureCollection(activeThreats: ThreatEvent[]): GeoJSON.FeatureCollection<GeoJSON.LineString, ThreatLineFeatureProperties> {
    const features: GeoJSON.Feature<GeoJSON.LineString, ThreatLineFeatureProperties>[] = activeThreats.map((threat) => ({
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
