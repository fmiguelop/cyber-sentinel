"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";

export function WorldBordersLayer() {
  const { map, isLoaded } = useMap();
  const sourceId = "world-land";
  const fillLayerId = "world-land-fill";
  const borderLayerId = "world-land-border";

  useEffect(() => {
    // 1. Guard Clause: Stop if map isn't ready
    if (!isLoaded || !map) return;

    try {
      // 2. Add Source (Landmass Data)
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson",
        });
      }

      // 3. Add Fill Layer (Dark Silhouette)
      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#1e293b",
            "fill-opacity": 0.3,
          },
        });
      }

      // 4. Add Border Layer (Subtle Outline)
      if (!map.getLayer(borderLayerId)) {
        map.addLayer({
          id: borderLayerId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#3b82f6",
            "line-width": 1,
            "line-opacity": 0.2,
          },
        });
      }

      // 5. Hide Text Labels (Cleaner Cyber Look)
      const layers = map.getStyle()?.layers;
      if (layers) {
        layers.forEach((layer) => {
          if (layer.type === "symbol") {
            map.setLayoutProperty(layer.id, "visibility", "none");
          }
        });
      }
    } catch (e) {
      console.error("Map layer error:", e);
    }

    // 6. Cleanup function
    return () => {
      // Check if map still exists (it might be destroyed on page navigation)
      if (!map || !map.getStyle()) return;

      if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [isLoaded, map]);

  return null;
}
