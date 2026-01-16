/**
 * Hook that plays a sound alert when new critical threats are detected
 */

import { useEffect, useRef } from "react";
import { useThreatStore } from "@/stores/useThreatStore";
import type { ThreatEvent } from "@/lib/types/threats";

/**
 * Generates a simple alert beep using Web Audio API
 */
function playAlertBeep() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure beep: 800Hz, 0.1s duration, subtle volume
    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    // Fallback: silently fail if audio context is not available
    console.debug("Audio context not available:", error);
  }
}

/**
 * Hook that monitors logs for new critical threats and plays sound alerts
 */
export function useCriticalAlertSound() {
  const logs = useThreatStore((state) => state.logs);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const previousLogsLengthRef = useRef(0);
  const previousCriticalIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Only check for new critical threats if sound is enabled
    if (!soundEnabled) {
      previousLogsLengthRef.current = logs.length;
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

      // Play sound for each new critical threat
      newCriticalThreats.forEach((threat: ThreatEvent) => {
        playAlertBeep();
        previousCriticalIdsRef.current.add(threat.id);
      });
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
  }, [logs, soundEnabled]);
}
