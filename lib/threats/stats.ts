/**
 * Pure functions for computing threat statistics
 */

import type { ThreatEvent, ThreatStats } from "@/lib/types/threats";
import type { City } from "@/lib/cities";

/**
 * Computes threat statistics from an array of threat events
 */
export function computeThreatStats(threats: ThreatEvent[]): ThreatStats {
  const totalAttacks = threats.length;

  // Count by severity
  const bySeverity = {
    low: 0,
    medium: 0,
    critical: 0,
  };

  // Count by region
  const byRegion: Record<City["region"], number> = {
    NA: 0,
    SA: 0,
    EU: 0,
    AS: 0,
    OC: 0,
    AF: 0,
  };

  // Track source countries and regions
  const sourceCountryCounts: Record<string, number> = {};
  const sourceRegionCounts: Record<City["region"], number> = {
    NA: 0,
    SA: 0,
    EU: 0,
    AS: 0,
    OC: 0,
    AF: 0,
  };

  threats.forEach((threat) => {
    // Count by severity
    bySeverity[threat.severity]++;

    // Count by region (source region)
    byRegion[threat.source.region]++;

    // Track source countries
    sourceCountryCounts[threat.source.country] =
      (sourceCountryCounts[threat.source.country] || 0) + 1;

    // Track source regions
    sourceRegionCounts[threat.source.region] =
      (sourceRegionCounts[threat.source.region] || 0) + 1;
  });

  // Find top source country
  const topSourceCountry =
    Object.keys(sourceCountryCounts).length > 0
      ? Object.entries(sourceCountryCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0]
      : null;

  // Find top source region
  const topSourceRegion =
    Object.keys(sourceRegionCounts).length > 0
      ? (Object.entries(sourceRegionCounts).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0] as City["region"])
      : null;

  // Count active critical threats (those that haven't expired)
  const now = Date.now();
  const activeCritical = threats.filter(
    (threat) => threat.severity === "critical" && threat.timestamp + threat.duration > now
  ).length;

  return {
    totalAttacks,
    activeCritical,
    byRegion,
    bySeverity,
    topSourceRegion,
    topSourceCountry,
  };
}
