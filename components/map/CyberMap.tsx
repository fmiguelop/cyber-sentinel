"use client";
import { useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import MapLibreGL from "maplibre-gl";
import { Map, MapLineLayer, useMap } from "@/components/ui/map";
import { useThreatStore, selectFilteredThreats } from "@/stores/useThreatStore";
import { threatsToPointFeatureCollection } from "@/lib/threats/geojson";
import type { ThreatEvent } from "@/lib/types/threats";
import type { ThreatPointFeatureProperties } from "@/lib/threats/geojson";

function ThreatPointLayer({
  threats,
}: {
  threats: ThreatEvent[];
}) {
  const { map, isLoaded } = useMap();
  const pointFeatures = useMemo(
    () => threatsToPointFeatureCollection(threats),
    [threats]
  );
  const sourceId = "threat-points";
  const layerId = "threat-points-layer";
  const threatsMapRef = useRef<globalThis.Map<string, ThreatEvent>>(
    new globalThis.Map()
  );
  const popupRef = useRef<MapLibreGL.Popup | null>(null);

  useEffect(() => {
    const threatsLookup = new globalThis.Map<string, ThreatEvent>();
    threats.forEach((threat) => {
      threatsLookup.set(`${threat.id}-source`, threat);
      threatsLookup.set(`${threat.id}-target`, threat);
    });
    threatsMapRef.current = threatsLookup;
  }, [threats]);

  useEffect(() => {
    if (!isLoaded || !map) return;

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: pointFeatures,
      });
    } else {
      const source = map.getSource(sourceId) as MapLibreGL.GeoJSONSource;
      source.setData(pointFeatures);
    }

    if (!map.getLayer(layerId)) {
      map.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "severity"], "critical"],
            "#ef4444",
            ["==", ["get", "severity"], "medium"],
            "#eab308",
            "#22c55e",
          ],
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#09090b",
        },
      });
    }

    const handleMouseEnter = (e: MapLibreGL.MapMouseEvent) => {
      map.getCanvas().style.cursor = "pointer";

      const features = map.queryRenderedFeatures(e.point, {
        layers: [layerId],
      });

      if (!features || features.length === 0) return;

      const feature = features[0];
      const props = feature.properties as ThreatPointFeatureProperties;
      const threat = threatsMapRef.current.get(props.id);
      if (!threat) return;

      const point =
        props.pointType === "source" ? threat.source : threat.target;

      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }

      const popupContent = document.createElement("div");
      popupContent.className =
        "space-y-1 text-xs p-2 bg-popover text-popover-foreground rounded-md border shadow-md";
      popupContent.innerHTML = `
        <div class="font-semibold">${threat.type}</div>
        <div class="text-muted-foreground">
          Severity: <span class="font-mono">${threat.severity}</span>
        </div>
        <div class="text-muted-foreground">
          From: ${threat.source.name}, ${threat.source.country}
        </div>
        <div class="text-muted-foreground">
          To: ${threat.target.name}, ${threat.target.country}
        </div>
        <div class="text-muted-foreground">
          ${format(new Date(threat.timestamp), "HH:mm:ss")}
        </div>
        <div class="text-muted-foreground font-mono text-[10px]">
          IP: ${threat.metadata.ipAddress}
        </div>
      `;

      const popup = new MapLibreGL.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        anchor: "bottom",
        offset: 16,
      })
        .setLngLat([point.lng, point.lat])
        .setDOMContent(popupContent)
        .addTo(map);

      popupRef.current = popup;
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };

    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };
  }, [isLoaded, map, pointFeatures, layerId, sourceId]);

  return null;
}

export function CyberMap() {
  const mapType = useThreatStore((state) => state.mapType);
  const mapFeatures = useThreatStore((state) => state.mapFeatures);
  const filteredThreats = useThreatStore(selectFilteredThreats);

  return (
    <div
      role="region"
      aria-label="Threat Visualization Map"
      className="h-full w-full relative"
    >
      <div className="bg-grid absolute inset-0" />
      <Map
        theme="dark"
        projection={{ type: mapType }}
        center={[0, 20]}
        zoom={1.5}
      >
        {mapFeatures && mapFeatures.features.length > 0 && (
          <MapLineLayer data={mapFeatures} width={2} opacity={0.7} />
        )}

        {filteredThreats.length > 0 && (
          <ThreatPointLayer threats={filteredThreats} />
        )}
      </Map>
    </div>
  );
}
