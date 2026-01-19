import type { ThreatEvent, ThreatStats } from "@/lib/types/threats";
import type { City } from "@/lib/cities";
export function computeThreatStats(threats: ThreatEvent[]): ThreatStats {
  const totalAttacks = threats.length;
  const bySeverity = {
    low: 0,
    medium: 0,
    critical: 0,
  };
  const byRegion: Record<City["region"], number> = {
    NA: 0,
    SA: 0,
    EU: 0,
    AS: 0,
    OC: 0,
    AF: 0,
    CA: 0,
  };
  const sourceCountryCounts: Record<string, number> = {};
  const sourceRegionCounts: Record<City["region"], number> = {
    NA: 0,
    SA: 0,
    EU: 0,
    AS: 0,
    OC: 0,
    AF: 0,
    CA: 0,
  };
  const now = Date.now();
  let activeCritical = 0;

  threats.forEach((threat) => {
    bySeverity[threat.severity]++;
    byRegion[threat.source.region]++;
    sourceCountryCounts[threat.source.country] =
      (sourceCountryCounts[threat.source.country] || 0) + 1;
    sourceRegionCounts[threat.source.region] =
      (sourceRegionCounts[threat.source.region] || 0) + 1;

    if (
      threat.severity === "critical" &&
      threat.timestamp + threat.duration > now
    ) {
      activeCritical++;
    }
  });
  const topSourceCountry =
    Object.keys(sourceCountryCounts).length > 0
      ? Object.entries(sourceCountryCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0]
      : null;
  const topSourceRegion =
    Object.keys(sourceRegionCounts).length > 0 &&
    Object.values(sourceRegionCounts).some((count) => count > 0)
      ? (Object.entries(sourceRegionCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0] as City["region"])
      : null;
  return {
    totalAttacks,
    activeCritical,
    byRegion,
    bySeverity,
    topSourceRegion,
    topSourceCountry,
  };
}
