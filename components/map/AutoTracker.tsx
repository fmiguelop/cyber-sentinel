"use client";

import { useEffect, useRef } from "react";
import { useMap } from "@/components/ui/map";
import { useThreatStore } from "@/stores/useThreatStore";

export function AutoTracker() {
  const { map, isLoaded } = useMap();
  const autoTrackEnabled = useThreatStore((state) => state.autoTrackEnabled);
  const speed = useThreatStore((state) => state.speed);
  const activeThreats = useThreatStore((state) => state.activeThreats);

  const lastTrackedId = useRef<string | null>(null);
  const userInteractedTime = useRef<number>(0);

  const currentTargetId = useRef<string | null>(null);
  const lastMoveTime = useRef<number>(0);
  const visitedThreats = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoaded || !map) return;
    const handleInteraction = () => {
      userInteractedTime.current = Date.now();
    };
    map.on("mousedown", handleInteraction);
    map.on("touchstart", handleInteraction);
    map.on("wheel", handleInteraction);
    map.on("dragstart", handleInteraction);
    return () => {
      map.off("mousedown", handleInteraction);
      map.off("touchstart", handleInteraction);
      map.off("wheel", handleInteraction);
      map.off("dragstart", handleInteraction);
    };
  }, [isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    if (!autoTrackEnabled) {
      map.flyTo({
        center: [0, 20],
        zoom: 1.5,
        pitch: 0,
        bearing: 0,
        speed: 0.8,
        essential: true,
      });
      lastTrackedId.current = null;
    }
  }, [autoTrackEnabled, isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map || !autoTrackEnabled) return;

    const now = Date.now();
    if (now - userInteractedTime.current < 8000) return;

    if (currentTargetId.current && now - lastMoveTime.current < 4000) {
      return;
    }

    const candidate = activeThreats.find((t) => {
      const isImportant = t.metadata?.isBotnet || t.severity === "critical";
      const isNew = !visitedThreats.current.has(t.id);

      return isImportant && isNew;
    });

    if (candidate) {
      currentTargetId.current = candidate.id;
      visitedThreats.current.add(candidate.id);
      lastMoveTime.current = now;

      const target = [candidate.target.lng, candidate.target.lat] as [
        number,
        number,
      ];

      map.flyTo({
        center: target,
        zoom: 3.5,
        speed: 0.6,
        curve: 1.2,
        pitch: 40,
        essential: true,
      });
    }

    if (visitedThreats.current.size > 500) {
      visitedThreats.current.clear();
    }
  }, [activeThreats, autoTrackEnabled, isLoaded, map, speed]);

  return null;
}
