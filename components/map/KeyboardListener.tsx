"use client";
import { useEffect } from "react";
import { useThreatStore } from "@/stores/useThreatStore";
import { useMap } from "@/components/ui/map";

export function KeyboardListener() {
  const {
    toggleAutoTrack,
    setSelectedCountry,
    clearAllFilters,
    toggleSimulation,
    setSpeed,
    toggleSound,
    toggleMapType,
    resetSimulation,
  } = useThreatStore((s) => s);
  const { map } = useMap();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.key.toLowerCase()) {
        case "c":
          toggleAutoTrack();
          break;
        case "escape":
          setSelectedCountry(null);
          clearAllFilters();
          map?.flyTo({ center: [10, 20], zoom: 1.5, pitch: 0 });
          break;
        case "1":
          setSpeed(1);
          break;
        case "2":
          setSpeed(2);
          break;
        case "3":
          setSpeed(4);
          break;
        case "m":
          toggleSound();
          break;
        case "z":
          toggleMapType();
          break;
        case "v":
          resetSimulation();
          break;
        case " ":
          toggleSimulation();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAutoTrack, setSelectedCountry, map]);

  return null;
}
