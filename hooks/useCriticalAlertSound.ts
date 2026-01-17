/**
 * Hook that plays a sound alert when new critical threats are detected
 */

import { useEffect, useRef } from "react";
import { useThreatStore } from "@/stores/useThreatStore";
import type { ThreatEvent } from "@/lib/types/threats";

// Singleton AudioContext for reuse
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (audioContext) {
    return audioContext;
  }
  try {
    audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
    return audioContext;
  } catch (error) {
    console.debug("Audio context not available:", error);
    return null;
  }
}

/**
 * Generates a simple alert beep using Web Audio API
 * Reuses singleton AudioContext for performance
 */
function playAlertBeep(ctx: AudioContext) {
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Configure beep: 800Hz, 0.1s duration, subtle volume
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    // Fallback: silently fail if audio context is not available
    console.debug("Error playing alert beep:", error);
  }
}

// Rate limiting: max 1 beep per 300ms, with burst mode for multiple threats
const RATE_LIMIT_MS = 300;
let lastBeepTime = 0;
let pendingThreats = 0;

/**
 * Hook that monitors logs for new critical threats and plays sound alerts
 * Uses rate limiting to prevent audio spam at high event rates
 */
export function useCriticalAlertSound() {
  const logs = useThreatStore((state) => state.logs);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const previousLogsLengthRef = useRef(0);
  const previousCriticalIdsRef = useRef<Set<string>>(new Set());
  const rateLimitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    // Only check for new critical threats if sound is enabled
    if (!soundEnabled) {
      previousLogsLengthRef.current = logs.length;
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
        rateLimitTimeoutRef.current = null;
      }
      return;
    }

    // Check if new logs were added
    if (logs.length > previousLogsLengthRef.current) {
      // Find new critical threats
      const newCriticalThreats = logs
        .slice(0, logs.length - previousLogsLengthRef.current)
        .filter(
          (threat: ThreatEvent) =>
            threat.severity === "critical" &&
            !previousCriticalIdsRef.current.has(threat.id)
        );

      // Track new threats and mark as seen
      newCriticalThreats.forEach((threat: ThreatEvent) => {
        previousCriticalIdsRef.current.add(threat.id);
        pendingThreats++;
      });

      // Rate-limited beep: play immediately if enough time has passed, otherwise schedule
      const ctx = getAudioContext();
      if (ctx && newCriticalThreats.length > 0) {
        const now = Date.now();
        const timeSinceLastBeep = now - lastBeepTime;

        if (timeSinceLastBeep >= RATE_LIMIT_MS) {
          // Play immediately
          playAlertBeep(ctx);
          lastBeepTime = now;
          pendingThreats = 0;
        } else {
          // Schedule a beep after rate limit expires
          if (!rateLimitTimeoutRef.current) {
            const delay = RATE_LIMIT_MS - timeSinceLastBeep;
            rateLimitTimeoutRef.current = setTimeout(() => {
              if (pendingThreats > 0 && ctx) {
                // Play a single beep for multiple pending threats (burst mode)
                playAlertBeep(ctx);
                lastBeepTime = Date.now();
                pendingThreats = 0;
              }
              rateLimitTimeoutRef.current = null;
            }, delay);
          }
        }
      }
    }

    // Update refs
    previousLogsLengthRef.current = logs.length;

    // Cleanup: remove old threat IDs to prevent memory growth
    if (previousCriticalIdsRef.current.size > 1000) {
      const recentIds = new Set(
        logs.slice(0, 100).map((threat: ThreatEvent) => threat.id)
      );
      previousCriticalIdsRef.current = recentIds;
    }

    return () => {
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
        rateLimitTimeoutRef.current = null;
      }
    };
  }, [logs, soundEnabled]);
}
