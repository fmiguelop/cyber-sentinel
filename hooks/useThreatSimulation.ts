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
const BATCH_FLUSH_INTERVAL_MS = 75; // Batch threats every 75ms for smoother updates
const SIM_SPEED_MULTIPLIER =
  process.env.NEXT_PUBLIC_SIM_SPEED === "fast" ? 0.1 : 1;
function getRandomDelay(): number {
  const baseDelay =
    Math.random() * (GENERATION_DELAY_MAX_MS - GENERATION_DELAY_MIN_MS) +
    GENERATION_DELAY_MIN_MS;
  return baseDelay * SIM_SPEED_MULTIPLIER;
}
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
        payloadSize: Math.floor(Math.random() * 1000),
        packetCount: Math.floor(Math.random() * 10000),
      }),
    },
  };
  return threat;
}
export function useThreatSimulation() {
  const isLive = useThreatStore((state) => state.isLive);
  const addThreats = useThreatStore((state) => state.addThreats);
  const pruneExpired = useThreatStore((state) => state.pruneExpired);
  const generationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const expirationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const batchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const threatBufferRef = useRef<ThreatEvent[]>([]);

  // Batch flush effect: periodically flush accumulated threats
  useEffect(() => {
    if (!isLive) {
      // Flush any remaining threats when stopping
      if (threatBufferRef.current.length > 0) {
        addThreats(threatBufferRef.current);
        threatBufferRef.current = [];
      }
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
        batchIntervalRef.current = null;
      }
      return;
    }

    batchIntervalRef.current = setInterval(() => {
      if (threatBufferRef.current.length > 0) {
        addThreats(threatBufferRef.current);
        threatBufferRef.current = [];
      }
    }, BATCH_FLUSH_INTERVAL_MS);

    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
        batchIntervalRef.current = null;
      }
    };
  }, [isLive, addThreats]);

  // Threat generation effect: generate threats and add to buffer
  useEffect(() => {
    if (!isLive) {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
      return;
    }
    const scheduleNext = () => {
      const delay = getRandomDelay();
      generationTimeoutRef.current = setTimeout(() => {
        const threat = generateThreatEvent();
        threatBufferRef.current.push(threat);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
    };
  }, [isLive]);
  useEffect(() => {
    if (!isLive) {
      if (expirationIntervalRef.current) {
        clearInterval(expirationIntervalRef.current);
        expirationIntervalRef.current = null;
      }
      return;
    }
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
