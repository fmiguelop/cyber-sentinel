"use client";

import { useEffect } from "react";
import { useMap } from "@/components/ui/map";
import { useThreatStore } from "@/stores/useThreatStore";
import { isValidSimulationCountry } from "@/lib/cities";

export function WorldBordersLayer() {
  const { map, isLoaded } = useMap();
  const selectedCountry = useThreatStore((state) => state.selectedCountry);
  const sourceId = "world-land";
  const setSelectedCountry = useThreatStore(
    (state) => state.setSelectedCountry
  );
  const fillLayerId = "world-land-fill";

  useEffect(() => {
    if (!isLoaded || !map) return;

    try {
      // Add Source
      if (!map.getSource(sourceId)) {
        map.addSource(sourceId, {
          type: "geojson",
          data: "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson",
        });
      }

      // Add Fill Layer
      if (!map.getLayer(fillLayerId)) {
        map.addLayer({
          id: fillLayerId,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#1e3b38",
            "fill-opacity": 0.3,
          },
        });
      }

      // Hide Text Labels
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

    const onCountryClick = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [fillLayerId],
      });

      if (!features.length) {
        setSelectedCountry(null);
        map.flyTo({ center: [10, 20], zoom: 1.5, pitch: 0 });
        return;
      }

      const feature = features[0];
      const countryName = feature.properties?.NAME || feature.properties?.name;

      if (countryName && isValidSimulationCountry(countryName)) {
        setSelectedCountry(countryName);

        map.flyTo({
          center: e.lngLat,
          zoom: 4,
          speed: 0.8,
          essential: true,
        });
      } else {
        console.log(`Ignored click on ${countryName}: No data available.`);
      }
    };

    const onMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [fillLayerId],
      });

      if (features.length) {
        const countryName =
          features[0].properties?.NAME || features[0].properties?.name;
        if (countryName && isValidSimulationCountry(countryName)) {
          map.getCanvas().style.cursor = "pointer";
          return;
        }
      }
      map.getCanvas().style.cursor = "";
    };

    map.on("click", onCountryClick);
    map.on("mousemove", onMouseMove);

    return () => {
      if (!map || !map.getStyle()) return;

      map.off("click", onCountryClick);
      map.off("mousemove", onMouseMove);
      if (map.getLayer(fillLayerId)) map.removeLayer(fillLayerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);
    };
  }, [isLoaded, map]);

  useEffect(() => {
    if (!isLoaded || !map) return;
    if (!map.getLayer(fillLayerId)) return;

    const safeCountry = selectedCountry || "";
    const hasSelection = safeCountry !== "";

    map.setPaintProperty(fillLayerId, "fill-color", [
      "case",
      [
        "any",
        ["==", ["get", "NAME"], safeCountry],
        ["==", ["get", "name"], safeCountry],
      ],
      "#3bf6c1",
      "#1e3b35",
    ]);

    map.setPaintProperty(fillLayerId, "fill-opacity", [
      "case",
      hasSelection,
      [
        "case",
        [
          "any",
          ["==", ["get", "NAME"], safeCountry],
          ["==", ["get", "name"], safeCountry],
        ],
        0.3,
        0.2,
      ],
      0.3,
    ]);
  }, [isLoaded, map, selectedCountry]);

  return null;
}
