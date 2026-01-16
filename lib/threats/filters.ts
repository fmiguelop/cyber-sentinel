/**
 * Pure filter utility functions for threat events
 */

import type { ThreatEvent, FilterState, TimeRange } from "@/lib/types/threats";

/**
 * Checks if a threat matches the current filters
 */
export function matchesFilters(threat: ThreatEvent, filters: FilterState): boolean {
  // Check severity filter
  if (!filters.severity[threat.severity]) {
    return false;
  }

  // Check attack type filter
  if (!filters.attackType[threat.type]) {
    return false;
  }

  // Check time range filter
  if (filters.timeRange !== "all") {
    const now = Date.now();
    const threatAge = now - threat.timestamp;
    const timeRangeMs: Record<TimeRange, number> = {
      "1min": 60 * 1000,
      "5min": 5 * 60 * 1000,
      "1hr": 60 * 60 * 1000,
      all: Infinity,
    };

    if (threatAge > timeRangeMs[filters.timeRange]) {
      return false;
    }
  }

  return true;
}
