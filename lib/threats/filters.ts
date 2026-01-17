import type { ThreatEvent, FilterState, TimeRange } from "@/lib/types/threats";
export function matchesFilters(
  threat: ThreatEvent,
  filters: FilterState
): boolean {
  if (!filters.severity[threat.severity]) {
    return false;
  }
  if (!filters.attackType[threat.type]) {
    return false;
  }
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
