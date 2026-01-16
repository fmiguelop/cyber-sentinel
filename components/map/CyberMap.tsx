"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import {
  Map,
  MapLineLayer,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
} from "@/components/ui/map";
import { useThreatStore } from "@/stores/useThreatStore";
import { severityToColorToken } from "@/lib/threats/random";
import { matchesFilters } from "@/lib/threats/filters";
import type { ThreatEvent } from "@/lib/types/threats";

/**
 * Check if user prefers reduced motion
 */
function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Pulsing marker dot component colored by severity
 */
function ThreatMarkerDot({ severity }: { severity: ThreatEvent["severity"] }) {
  const color = severityToColorToken(severity);
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div className="relative">
      {/* Outer pulsing ring - disabled when reduced motion is preferred */}
      {!prefersReducedMotion && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: color }}
        />
      )}
      {/* Inner solid dot */}
      <div
        className={`relative h-3 w-3 rounded-full border-2 border-background shadow-lg ${
          severity === "critical"
            ? "glow-critical"
            : severity === "medium"
            ? "glow-medium"
            : "glow-low"
        }`}
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

/**
 * CyberMap component - renders the threat visualization map
 */
export function CyberMap() {
  const mapFeatures = useThreatStore((state) => state.mapFeatures);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const filters = useThreatStore((state) => state.filters);
  const filteredThreats = activeThreats.filter((threat) =>
    matchesFilters(threat, filters)
  );

  return (
    <div role="region" aria-label="Threat Visualization Map" className="h-full w-full">
      <Map
        theme="dark"
        projection={{ type: "globe" }}
        center={[0, 20]}
        zoom={1.5}
      >
      {/* Render attack lines */}
      {mapFeatures && mapFeatures.features.length > 0 && (
        <MapLineLayer data={mapFeatures} width={2} opacity={0.7} />
      )}

      {/* Render markers for source and target positions */}
      {filteredThreats.flatMap((threat) => [
        // Source marker
        <MapMarker
          key={`${threat.id}-source`}
          longitude={threat.source.lng}
          latitude={threat.source.lat}
        >
          <MarkerContent>
            <ThreatMarkerDot severity={threat.severity} />
          </MarkerContent>
          <MarkerTooltip>
            <div className="space-y-1 text-xs">
              <div className="font-semibold">{threat.type}</div>
              <div className="text-muted-foreground">
                Severity: <span className="font-mono">{threat.severity}</span>
              </div>
              <div className="text-muted-foreground">
                From: {threat.source.name}, {threat.source.country}
              </div>
              <div className="text-muted-foreground">
                To: {threat.target.name}, {threat.target.country}
              </div>
              <div className="text-muted-foreground">
                {format(new Date(threat.timestamp), "HH:mm:ss")}
              </div>
              <div className="text-muted-foreground font-mono text-[10px]">
                IP: {threat.metadata.ipAddress}
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>,
        // Target marker
        <MapMarker
          key={`${threat.id}-target`}
          longitude={threat.target.lng}
          latitude={threat.target.lat}
        >
          <MarkerContent>
            <ThreatMarkerDot severity={threat.severity} />
          </MarkerContent>
          <MarkerTooltip>
            <div className="space-y-1 text-xs">
              <div className="font-semibold">{threat.type}</div>
              <div className="text-muted-foreground">
                Severity: <span className="font-mono">{threat.severity}</span>
              </div>
              <div className="text-muted-foreground">
                From: {threat.source.name}, {threat.source.country}
              </div>
              <div className="text-muted-foreground">
                To: {threat.target.name}, {threat.target.country}
              </div>
              <div className="text-muted-foreground">
                {format(new Date(threat.timestamp), "HH:mm:ss")}
              </div>
              <div className="text-muted-foreground font-mono text-[10px]">
                IP: {threat.metadata.ipAddress}
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>,
      ])}
      </Map>
    </div>
  );
}
