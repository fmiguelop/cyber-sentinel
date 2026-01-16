/**
 * Utility functions for generating random threat properties
 */

import type { AttackType, Severity } from "@/lib/types/threats";

/**
 * Returns a random severity level
 */
export function getRandomSeverity(): Severity {
  const severities: Severity[] = ["low", "medium", "critical"];
  // Weighted distribution: 50% low, 30% medium, 20% critical
  const rand = Math.random();
  if (rand < 0.5) return "low";
  if (rand < 0.8) return "medium";
  return "critical";
}

/**
 * Returns a random attack type
 */
export function getRandomAttackType(): AttackType {
  const types: AttackType[] = ["DDoS", "Phishing", "Malware", "BruteForce"];
  return types[Math.floor(Math.random() * types.length)];
}

/**
 * Returns a random duration in milliseconds between 3-10 seconds
 */
export function getRandomDurationMs(): number {
  return Math.random() * 7000 + 3000; // 3000ms to 10000ms
}

/**
 * Maps severity to a color token (for UI use, kept pure)
 * Returns hex color values matching the SOC theme
 */
export function severityToColorToken(severity: Severity): string {
  switch (severity) {
    case "low":
      return "#22c55e"; // Green 500
    case "medium":
      return "#eab308"; // Yellow 500
    case "critical":
      return "#ef4444"; // Red 500
  }
}
