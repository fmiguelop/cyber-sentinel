import type { City } from "@/lib/cities";
export type AttackType = "DDoS" | "Phishing" | "Malware" | "BruteForce";
export type Severity = "low" | "medium" | "critical";
export type TimeRange = "1min" | "5min" | "1hr" | "all";
export interface ThreatEvent {
  id: string;
  timestamp: number;
  source: City;
  target: City;
  type: AttackType;
  severity: Severity;
  duration: number;
  metadata: {
    ipAddress: string;
    payloadSize?: number;
    packetCount?: number;
    isBotnet?: boolean;
    batchId?: string;
    swarmSize?: number;
  };
}
export interface FilterState {
  severity: {
    low: boolean;
    medium: boolean;
    critical: boolean;
  };
  attackType: {
    DDoS: boolean;
    Phishing: boolean;
    Malware: boolean;
    BruteForce: boolean;
  };
  timeRange: TimeRange;
}
export interface ThreatStats {
  totalAttacks: number;
  activeCritical: number;
  byRegion: Record<City["region"], number>;
  bySeverity: {
    low: number;
    medium: number;
    critical: number;
  };
  topSourceRegion: City["region"] | null;
  topSourceCountry: string | null;
}

export interface Shockwave {
  id: string;
  lat: number;
  lng: number;
  color: string;
  maxRadius: number;
  startTime: number;
}
