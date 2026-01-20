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
const EXPIRATION_CHECK_INTERVAL_MS = 10000;
const BATCH_FLUSH_INTERVAL_MS = 75;

const SIM_SPEED_MULTIPLIER = 1;

const generateId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return faker.string.uuid();
};

function getRandomDelay(speed: number): number {
  const baseDelay =
    Math.random() * (GENERATION_DELAY_MAX_MS - GENERATION_DELAY_MIN_MS) +
    GENERATION_DELAY_MIN_MS;
  return (baseDelay * SIM_SPEED_MULTIPLIER) / speed;
}

function generateThreatBatch(): ThreatEvent[] {
  const source = getRandomCity();
  const target = getRandomTarget(source);
  const severity = getRandomSeverity();
  const type = getRandomAttackType();
  const duration = getRandomDurationMs();
  const isSwarm = Math.random() < 0.2;

  if (isSwarm) {
    const swarmSize = Math.floor(Math.random() * 12) + 8;
    const batchId = generateId();
    const swarm: ThreatEvent[] = [];

    for (let i = 0; i < swarmSize; i++) {
      const swarmSource = getRandomCity();
      const timestamp = Date.now();
      swarm.push({
        id: generateId(),
        timestamp: timestamp,
        source: swarmSource,
        target: target,
        type: "DDoS",
        severity: "critical",
        duration: duration,
        metadata: {
          ipAddress: faker.internet.ipv4(),
          payloadSize: Math.floor(Math.random() * 5000),
          packetCount: Math.floor(Math.random() * 50000),
          isBotnet: true,
          batchId: batchId,
          swarmSize: swarmSize,
        },
      });
    }

    return swarm;
  }

  const threat: ThreatEvent = {
    id: generateId(),
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
  return [threat];
}

export function useThreatSimulation() {
  const isLive = useThreatStore((state) => state.isLive);
  const speed = useThreatStore((state) => state.speed);
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

  useEffect(() => {
    if (!isLive) {
      if (threatBufferRef.current.length > 0) {
        addThreats(threatBufferRef.current);
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

  useEffect(() => {
    if (!isLive) {
      if (generationTimeoutRef.current) {
        clearTimeout(generationTimeoutRef.current);
        generationTimeoutRef.current = null;
      }
      return;
    }
    const scheduleNext = () => {
      const delay = getRandomDelay(speed);
      generationTimeoutRef.current = setTimeout(() => {
        const newThreats = generateThreatBatch();
        threatBufferRef.current.push(...newThreats);
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
  }, [isLive, speed]);
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
