/**
 * Shared TypeScript types for threat events and related data structures.
 * 
 * @see docs/requirements.md for detailed specifications
 */

import type { City } from "@/lib/cities";

/**
 * Types of cyber attacks that can be simulated
 */
export type AttackType = "DDoS" | "Phishing" | "Malware" | "BruteForce";

/**
 * Severity levels for threat events
 */
export type Severity = "low" | "medium" | "critical";

/**
 * Time range options for filtering logs
 */
export type TimeRange = "1min" | "5min" | "1hr" | "all";

/**
 * A threat event representing a simulated cyber attack
 */
export interface ThreatEvent {
  id: string;
  timestamp: number;
  source: City;
  target: City;
  type: AttackType;
  severity: Severity;
  duration: number; // in milliseconds
  metadata: {
    ipAddress: string;
    payloadSize?: number; // for DDoS events (in KB)
    packetCount?: number; // for DDoS events
  };
}

/**
 * Filter state for controlling what threats are displayed
 */
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

/**
 * Statistics about threat events
 */
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
