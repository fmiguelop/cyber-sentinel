"use client";

import { useEffect, useRef } from "react";
import MapLibreGL from "maplibre-gl";
import { useMap } from "@/components/ui/map";
import { useThreatStore } from "@/stores/useThreatStore";

export function ShockwaveLayer() {
  const { map, isLoaded } = useMap();
  const shockwaves = useThreatStore((state) => state.shockwaves);

  const sourceId = "shockwaves-source";
  const layerId = "shockwaves-layer";
  const animationRef = useRef<number>(null);

  useEffect(() => {
    if (!isLoaded || !map) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": ["get", "radius"],
          "circle-opacity": ["get", "opacity"],
          "circle-stroke-width": 1,
          "circle-stroke-color": ["get", "color"],
          "circle-stroke-opacity": ["get", "opacity"],
          "circle-blur": 0.5,
        },
      });
    }

    const animate = () => {
      if (!map.getSource(sourceId)) return;

      const now = Date.now();
      const features: GeoJSON.Feature[] = shockwaves.map((s) => {
        const elapsed = now - s.startTime;
        const duration = 2000;
        const progress = Math.min(elapsed / duration, 1);

        const easeOut = 1 - Math.pow(1 - progress, 3);

        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [s.lng, s.lat],
          },
          properties: {
            color: s.color,
            radius: s.maxRadius * easeOut,
            opacity: 1 - easeOut,
          },
        };
      });

      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
      source.setData({
        type: "FeatureCollection",
        features: features as any,
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [isLoaded, map, shockwaves]);

  return null;
}
