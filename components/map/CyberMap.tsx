"use client";
import { useMemo, useEffect, useRef } from "react";
import { format } from "date-fns";
import MapLibreGL from "maplibre-gl";
import { Map, MapLineLayer, useMap } from "@/components/ui/map";
import { useThreatStore, selectFilteredThreats } from "@/stores/useThreatStore";
import { threatsToPointFeatureCollection } from "@/lib/threats/geojson";
import type { ThreatEvent } from "@/lib/types/threats";
import type { ThreatPointFeatureProperties } from "@/lib/threats/geojson";
import { WorldBordersLayer } from "./WorldBorderLayer";
import { ShockwaveLayer } from "./ShockwaveLayer";
import { AutoTracker } from "./AutoTracker";
import { KeyboardListener } from "./KeyboardListener";

const loadMapIcons = (map: MapLibreGL.Map) => {
  const icons = [
    {
      id: "icon-source",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v4h4v2h-4v4h-2v-4H7v-2h4V7z"/></svg>`,
    },
    {
      id: "icon-target",
      svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
    },
  ];

  icons.forEach(({ id, svg }) => {
    if (map.hasImage(id)) return;

    const img = new Image(24, 24);

    img.onload = () => {
      if (!map.hasImage(id)) {
        map.addImage(id, img, { sdf: true });
      }
    };

    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  });
};

export function ThreatPointLayer({ threats }: { threats: ThreatEvent[] }) {
  const setHoveredThreat = useThreatStore((state) => state.setHoveredThreat);
  const { map, isLoaded } = useMap();
  const pointFeatures = useMemo(() => threatsToPointFeatureCollection(threats), [threats]);

  const sourceId = "threat-points";
  const circleLayerId = "threat-points-circle";
  const iconLayerId = "threat-points-icon";
  const glowLayerId = "threat-points-glow";

  const threatsMapRef = useRef<globalThis.Map<string, ThreatEvent>>(new globalThis.Map());
  const popupRef = useRef<MapLibreGL.Popup | null>(null);
  const animationRef = useRef<number>(null);

  //  Maintain Lookup Map for Popups
  useEffect(() => {
    const threatsLookup = new globalThis.Map<string, ThreatEvent>();
    threats.forEach((threat) => {
      threatsLookup.set(`${threat.id}-source`, threat);
      threatsLookup.set(`${threat.id}-target`, threat);
    });
    threatsMapRef.current = threatsLookup;
  }, [threats]);

  // Render Layers & Animation
  useEffect(() => {
    if (!isLoaded || !map) return;

    loadMapIcons(map);

    // Add Source
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: "geojson", data: pointFeatures });
    } else {
      (map.getSource(sourceId) as MapLibreGL.GeoJSONSource).setData(pointFeatures);
    }

    // Add Glow (Animated Pulse)
    if (!map.getLayer(glowLayerId)) {
      map.addLayer({
        id: glowLayerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-color": [
            "case",
            ["==", ["get", "type"], "DDoS"],
            "#d946ef",
            ["==", ["get", "severity"], "critical"],
            "#ef4444",
            ["==", ["get", "severity"], "medium"],
            "#eab308",
            "#22c55e",
          ],
          "circle-radius": 15,
          "circle-opacity": 0,
          "circle-blur": 1,
        },
        filter: ["any", ["==", ["get", "severity"], "critical"], ["==", ["get", "type"], "DDoS"]],
      });
    }

    // Add Circle Background
    if (!map.getLayer(circleLayerId)) {
      map.addLayer({
        id: circleLayerId,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 10,
          "circle-color": "#09090b",
          "circle-stroke-width": 2,
          "circle-stroke-color": [
            "case",
            ["==", ["get", "type"], "DDoS"],
            "#d946ef",
            ["==", ["get", "severity"], "critical"],
            "#ef4444",
            ["==", ["get", "severity"], "medium"],
            "#eab308",
            "#22c55e",
          ],
        },
      });
    }

    // Add Icons
    if (!map.getLayer(iconLayerId)) {
      map.addLayer({
        id: iconLayerId,
        type: "symbol",
        source: sourceId,
        layout: {
          "icon-image": [
            "case",
            ["==", ["get", "pointType"], "source"],
            "icon-source",
            "icon-target",
          ],
          "icon-size": 0.6,
          "icon-allow-overlap": true,
        },
        paint: {
          "icon-color": [
            "case",
            ["==", ["get", "type"], "DDoS"],
            "#d946ef",
            ["==", ["get", "severity"], "critical"],
            "#ef4444",
            ["==", ["get", "severity"], "medium"],
            "#eab308",
            "#22c55e",
          ],
        },
      });
    }

    // Pulse Animation Loop
    const start = performance.now();
    const animate = (time: number) => {
      const duration = 2000;
      const t = (time - start) % duration;
      const progress = t / duration;

      const radius = 5 + progress * 25;
      const opacity = 0.8 - progress * 0.8;

      if (map.getLayer(glowLayerId)) {
        map.setPaintProperty(glowLayerId, "circle-radius", radius);
        map.setPaintProperty(glowLayerId, "circle-opacity", opacity);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isLoaded, map, pointFeatures, sourceId, glowLayerId, circleLayerId, iconLayerId]);

  // Handle Popups
  useEffect(() => {
    if (!isLoaded || !map) return;

    const handleMouseEnter = (e: MapLibreGL.MapMouseEvent) => {
      // Query both the Circle AND the Icon layer

      const features = map.queryRenderedFeatures(e.point, {
        layers: [circleLayerId, iconLayerId],
      });

      if (!features || features.length === 0) return;

      map.getCanvas().style.cursor = "pointer";

      const feature = features[0];
      const props = feature.properties as ThreatPointFeatureProperties;
      const threat = threatsMapRef.current.get(props.id);

      if (!threat) return;

      const batchId = threat.metadata?.batchId || null;
      setHoveredThreat(threat.id, batchId);

      const point = props.pointType === "source" ? threat.source : threat.target;

      if (popupRef.current) {
        popupRef.current.remove();
      }

      let swarmHtml = "";
      let title: string = threat.type;

      if (threat.type === "DDoS" && threat.metadata?.batchId) {
        const swarmSize = threat.metadata?.swarmSize;

        title = "DDoS SWARM";

        swarmHtml = `
          <div class="flex justify-between items-center text-[10px] bg-white/5 mx-[-8px] px-2 py-1 mb-2 border-y border-white/10">
             <span class="text-muted-foreground">ATTACK SIZE</span>
             <span class="font-mono text-purple-400 font-bold">${swarmSize} BOTS</span>
          </div>
          <div class="flex justify-between items-center text-[10px] bg-white/5 mx-[-8px] px-2 py-1 mb-2 border-y border-white/10">
             <span class="text-muted-foreground">PACKETS</span>
             <span class="font-mono text-purple-400 font-bold">${threat.metadata.packetCount} PACKETS</span>
          </div>
          <div class="flex justify-between items-center text-[10px] bg-white/5 mx-[-8px] px-2 py-1 mb-2 border-y border-white/10">
             <span class="text-muted-foreground">PAYLOAD SIZE</span>
             <span class="font-mono text-purple-400 font-bold">${threat.metadata.payloadSize} BYTES</span>
          </div>
        `;
      }

      const severityColor =
        threat.type === "DDoS"
          ? "#d946ef"
          : threat.severity === "critical"
            ? "#ef4444"
            : threat.severity === "medium"
              ? "#eab308"
              : "#22c55e";

      const popupContent = document.createElement("div");
      popupContent.className =
        "w-72 p-2 bg-popover text-popover-foreground rounded-r-md rounded-l-sm border-y border-r shadow-md text-xs leading-tight";
      popupContent.style.border = `1px solid ${severityColor}`;

      popupContent.innerHTML = `
        <div class="flex justify-between items-center mb-2 border-b border-border/50 pb-1">
          <span class="font-bold tracking-wider truncate pr-2">${title.toUpperCase()}</span>
          <span style="color: ${severityColor};" class="font-mono font-bold text-[10px] px-1.5 rounded bg-transparent">
            ${threat.severity.toUpperCase()}
          </span>
        </div>

        ${swarmHtml} <div class="flex items-center justify-between gap-1 mb-2 text-foreground">
          <div class="flex-1 min-w-0 text-right">
            <div class="truncate font-medium">
              ${threat.metadata?.isBotnet ? "Botnet Node" : threat.source.name}
            </div>
            <div class="text-[10px] text-muted-foreground truncate">${threat.source.country}</div>
          </div>

          <div class="text-muted-foreground px-1">→</div>

          <div class="flex-1 min-w-0 text-left">
            <div class="truncate font-medium">${threat.target.name}</div>
            <div class="text-[10px] text-muted-foreground truncate">${threat.target.country}</div>
          </div>
        </div>

        <div class="flex justify-between items-center text-[10px] text-muted-foreground font-mono bg-muted/30 -mx-2 -mb-2 px-2 py-1 mt-1">
          <span>${threat.metadata.ipAddress}</span>
          <span>${format(new Date(threat.timestamp), "HH:mm:ss")}</span>
        </div>
      `;

      popupRef.current = new MapLibreGL.Popup({
        closeButton: false,
        closeOnClick: false,
        closeOnMove: false,
        anchor: "bottom",
        offset: 16,
      })
        .setLngLat([point.lng, point.lat])
        .setDOMContent(popupContent)
        .addTo(map);
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
      setHoveredThreat(null, null);
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    };

    map.on("mouseenter", circleLayerId, handleMouseEnter);
    map.on("mouseenter", iconLayerId, handleMouseEnter);
    map.on("mouseleave", circleLayerId, handleMouseLeave);
    map.on("mouseleave", iconLayerId, handleMouseLeave);

    return () => {
      map.off("mouseenter", circleLayerId, handleMouseEnter);
      map.off("mouseenter", iconLayerId, handleMouseEnter);
      map.off("mouseleave", circleLayerId, handleMouseLeave);
      map.off("mouseleave", iconLayerId, handleMouseLeave);
      if (popupRef.current) popupRef.current.remove();
    };
  }, [isLoaded, map, circleLayerId, iconLayerId, setHoveredThreat]);

  return null;
}

export function CyberMap() {
  const mapType = useThreatStore((state) => state.mapType);
  const mapFeatures = useThreatStore((state) => state.mapFeatures);
  const filteredThreats = useThreatStore(selectFilteredThreats);

  return (
    <div role="region" aria-label="Threat Visualization Map" className="relative h-full w-full">
      <div className="bg-grid absolute inset-0" />
      <Map theme="dark" projection={{ type: mapType }} center={[0, 20]} zoom={1.5}>
        <KeyboardListener />
        <WorldBordersLayer />
        <ShockwaveLayer />
        <AutoTracker />
        {mapFeatures && mapFeatures.features.length > 0 && (
          <MapLineLayer data={mapFeatures} width={2} opacity={0.7} />
        )}

        <ThreatPointLayer threats={filteredThreats} />
      </Map>
    </div>
  );
}
