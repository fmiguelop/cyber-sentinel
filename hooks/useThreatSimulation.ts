/**
 * Custom hook for simulating threat events in real-time.
 * 
 * Uses randomized timeouts (500-2000ms) to generate ThreatEvent objects
 * and add them to the Zustand store via addThreat action.
 * 
 * @see docs/requirements.md for detailed specifications
 */

import { useEffect, useRef } from "react";
import { faker } from "@faker-js/faker";
import { getRandomCity, getRandomTarget } from "@/lib/cities";
import {
  getRandomSeverity,
  getRandomAttackType,
  getRandomDurationMs,
} from "@/lib/threats/random";
import type { ThreatEvent } from "@/lib/types/threats";
import { useThreatStore } from "@/stores/useThreatStore";

const GENERATION_DELAY_MIN_MS = 500;
const GENERATION_DELAY_MAX_MS = 2000;
const EXPIRATION_CHECK_INTERVAL_MS = 500;

/**
 * Generates a random delay between min and max milliseconds
 */
function getRandomDelay(): number {
  return (
    Math.random() * (GENERATION_DELAY_MAX_MS - GENERATION_DELAY_MIN_MS) +
    GENERATION_DELAY_MIN_MS
  );
}

/**
 * Generates a random threat event
 */
function generateThreatEvent(): ThreatEvent {
  const source = getRandomCity();
  const target = getRandomTarget(source);
  const severity = getRandomSeverity();
  const type = getRandomAttackType();
  const duration = getRandomDurationMs();

  const threat: ThreatEvent = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    source,
    target,
    type,
    severity,
    duration,
    metadata: {
      ipAddress: faker.internet.ipv4(),
      ...(type === "DDoS" && {
        payloadSize: Math.floor(Math.random() * 1000), // KB
        packetCount: Math.floor(Math.random() * 10000),
      }),
    },
  };

  return threat;
}

/**
 * Hook that manages threat event simulation
 */
export function useThreatSimulation() {
  const isLive = useThreatStore((state) => state.isLive);
  const addThreat = useThreatStore((state) => state.addThreat);
  const pruneExpired = useThreatStore((state) => state.pruneExpired);

  const generationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const expirationIntervalRef = useRef<
    ReturnType<typeof setInterval> | null
  >(null);

  // Generate threats when isLive is true
  useEffect(() => {
    if (!isLive) {
      // Clear any pending generation
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
      return;
    }

    // Function to schedule next threat generation
    const scheduleNext = () => {
      const delay = getRandomDelay();
      generationTimeoutRef.current = setTimeout(() => {
        const threat = generateThreatEvent();
        addThreat(threat);
        scheduleNext(); // Schedule next generation
      }, delay);
    };

    // Start generating
    scheduleNext();

    // Cleanup on unmount or when isLive becomes false
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
    };
  }, [isLive, addThreat]);

  // Handle expiration cleanup
  useEffect(() => {
    if (!isLive) {
      // Clear expiration interval when not live
      if (expirationIntervalRef.current) {
        clearInterval(expirationIntervalRef.current);
        expirationIntervalRef.current = null;
      }
      return;
    }

    // Set up periodic expiration check
    expirationIntervalRef.current = setInterval(() => {
      pruneExpired();
    }, EXPIRATION_CHECK_INTERVAL_MS);

    return () => {
      if (expirationIntervalRef.current) {
        clearInterval(expirationIntervalRef.current);
        expirationIntervalRef.current = null;
      }
    };
  }, [isLive, pruneExpired]);
}
