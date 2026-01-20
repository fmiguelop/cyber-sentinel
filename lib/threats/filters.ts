import type { ThreatEvent, FilterState, TimeRange } from "@/lib/types/threats";

const TIME_RANGE_MS: Record<TimeRange, number> = {
  "1min": 60 * 1000,
  "5min": 5 * 60 * 1000,
  "1hr": 60 * 60 * 1000,
  all: Infinity,
};

export type CompiledFilter = (threat: ThreatEvent) => boolean;

export function compileFilters(filters: FilterState): CompiledFilter {
  const now = Date.now();
  const cutoffTimestamp = filters.timeRange === "all" ? 0 : now - TIME_RANGE_MS[filters.timeRange];

  return (threat: ThreatEvent) => {
    if (!filters.severity[threat.severity]) {
      return false;
    }
    if (!filters.attackType[threat.type]) {
      return false;
    }
    if (filters.timeRange !== "all" && threat.timestamp < cutoffTimestamp) {
      return false;
    }
    return true;
  };
}

export function matchesFilters(threat: ThreatEvent, filters: FilterState): boolean {
  if (!filters.severity[threat.severity]) {
    return false;
  }
  if (!filters.attackType[threat.type]) {
    return false;
  }
  if (filters.timeRange !== "all") {
    const now = Date.now();
    const threatAge = now - threat.timestamp;
    if (threatAge > TIME_RANGE_MS[filters.timeRange]) {
      return false;
    }
  }
  return true;
}
