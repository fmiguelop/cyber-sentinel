/**
 * Hook that plays a sound alert when new critical threats are detected
 */

import { useEffect, useRef } from "react";
import { useThreatStore } from "@/stores/useThreatStore";
import type { ThreatEvent } from "@/lib/types/threats";

// Singleton AudioContext for reuse
let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (audioContext && audioContext.state !== "closed") {
    if (audioContext.state === "suspended") {
      audioContext.resume().catch(console.error);
    }
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

function playAlertBeep(ctx: AudioContext) {
  try {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";
    gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (error) {
    console.debug("Error playing alert beep:", error);
  }
}

function playSwarmSound(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  osc.type = "sawtooth";

  osc.frequency.setValueAtTime(150, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.4);

  filter.type = "lowpass";
  filter.frequency.setValueAtTime(400, ctx.currentTime);

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

const RATE_LIMIT_MS = 300;
let lastBeepTime = 0;
let lastSoundTime = 0;
let pendingThreats = 0;

export function useCriticalAlertSound() {
  const logs = useThreatStore((state) => state.logs);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const previousLogsLengthRef = useRef(0);
  const previousThreatIdsRef = useRef<Set<string>>(new Set());
  const rateLimitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const pendingAudioRef = useRef<{
    hasCritical: boolean;
    hasSwarm: boolean;
  }>({ hasCritical: false, hasSwarm: false });

  const executeSound = () => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const { hasSwarm, hasCritical } = pendingAudioRef.current;

    if (hasSwarm) {
      playSwarmSound(ctx);
    } else if (hasCritical) {
      playAlertBeep(ctx);
    }

    pendingAudioRef.current = { hasCritical: false, hasSwarm: false };
    lastSoundTime = Date.now();
  };

  useEffect(() => {
    if (!soundEnabled) {
      previousLogsLengthRef.current = logs.length;
      return;
    }

    if (logs.length > previousLogsLengthRef.current) {
      const newLogs = logs.slice(
        0,
        logs.length - previousLogsLengthRef.current
      );

      let foundCritical = false;
      let foundSwarm = false;

      newLogs.forEach((log) => {
        if (previousThreatIdsRef.current.has(log.id)) return;
        previousThreatIdsRef.current.add(log.id);

        if (log.metadata?.isBotnet) {
          foundSwarm = true;
        } else if (log.severity === "critical") {
          foundCritical = true;
        }
      });

      if (foundSwarm || foundCritical) {
        pendingAudioRef.current.hasSwarm =
          pendingAudioRef.current.hasSwarm || foundSwarm;
        pendingAudioRef.current.hasCritical =
          pendingAudioRef.current.hasCritical || foundCritical;

        const now = Date.now();
        const timeSinceLast = now - lastSoundTime;

        if (timeSinceLast >= RATE_LIMIT_MS) {
          if (rateLimitTimeoutRef.current)
            clearTimeout(rateLimitTimeoutRef.current);
          executeSound();
        } else {
          if (!rateLimitTimeoutRef.current) {
            const delay = RATE_LIMIT_MS - timeSinceLast;
            rateLimitTimeoutRef.current = setTimeout(() => {
              executeSound();
              rateLimitTimeoutRef.current = null;
            }, delay);
          }
        }
      }
    }

    previousLogsLengthRef.current = logs.length;

    if (previousThreatIdsRef.current.size > 1000) {
      const recentIds = new Set(logs.slice(0, 100).map((t) => t.id));
      previousThreatIdsRef.current = recentIds;
    }

    return () => {
      if (rateLimitTimeoutRef.current) {
        clearTimeout(rateLimitTimeoutRef.current);
        rateLimitTimeoutRef.current = null;
      }
    };
  }, [logs, soundEnabled]);
}
