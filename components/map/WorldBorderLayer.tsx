"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";

export function WorldBordersLayer() {
  const { map, isLoaded } = useMap();
  const sourceId = "world-land";
  const fillLayerId = "world-land-fill";
  const borderLayerId = "world-land-border";

  useEffect(() => {
    if (!isLoaded || !map) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson",
      });
    }

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

    map.getStyle().layers.forEach((layer) => {
      if (layer.type === "symbol") {
        map.setLayoutProperty(layer.id, "visibility", "none");
      }
    });

    return () => {
      if (map.getLayer(borderLayerId)) map.removeLayer(borderLayerId);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [isLoaded, map]);

  return null;
}
