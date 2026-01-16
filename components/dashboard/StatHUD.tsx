"use client";

import { useState, useEffect } from "react";
import { Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useThreatStore } from "@/stores/useThreatStore";
import { matchesFilters } from "@/lib/threats/filters";
import { computeThreatStats } from "@/lib/threats/stats";

/**
 * Computes DEFCON level based on active critical threat count
 */
function getDefconLevel(activeCritical: number): number {
  if (activeCritical === 0) return 5;
  if (activeCritical <= 2) return 4;
  if (activeCritical <= 5) return 3;
  if (activeCritical <= 10) return 2;
  return 1;
}

/**
 * Gets DEFCON level subtitle
 */
function getDefconSubtitle(level: number): string {
  switch (level) {
    case 5:
      return "Normal Global Activity";
    case 4:
      return "Low Global Activity";
    case 3:
      return "Moderate Global Activity";
    case 2:
      return "Elevated Global Activity";
    case 1:
      return "Maximum Global Activity";
    default:
      return "Unknown Status";
  }
}

/**
 * Gets DEFCON level color
 */
function getDefconColor(level: number): string {
  switch (level) {
    case 5:
      return "bg-green-500"; // Normal
    case 4:
      return "bg-blue-500"; // Low
    case 3:
      return "bg-yellow-500"; // Moderate
    case 2:
      return "bg-orange-500"; // Elevated
    case 1:
      return "bg-red-500"; // Maximum
    default:
      return "bg-gray-500";
  }
}

/**
 * DEFCON Status Indicator Component
 */
function DefconIndicator({ level, size = "sm" }: { level: number; size?: "sm" | "xs" }) {
  const colorClass = getDefconColor(level);
  const sizeClass = size === "sm" ? "h-3 w-3" : "h-2 w-2";
  
  return (
    <div
      className={`${colorClass} ${sizeClass} rounded-full shrink-0 ${
        level <= 2 ? "ring-2 ring-offset-1 ring-offset-card ring-red-500/50" : ""
      }`}
      aria-hidden="true"
    />
  );
}

/**
 * Converts country name to country code, or truncates if not found
 */
function toCountryCode(country: string | null): string {
  if (!country) return "--";
  // If it's already an uppercase 3-letter code (USA, CHN, etc.), keep it
  if (/^[A-Z]{2,3}$/.test(country)) return country;
  
  const map: Record<string, string> = {
    "United States": "USA",
    "Canada": "CAN",
    "Brazil": "BRA",
    "El Salvador": "SLV",
    "Chile": "CHL",
    "Germany": "DEU",
    "Russia": "RUS",
    "Ukraine": "UKR",
    "Netherlands": "NLD",
    "China": "CHN",
    "Japan": "JPN",
    "South Korea": "KOR",
    "India": "IND",
    "Singapore": "SGP",
    "Israel": "ISR",
    "Australia": "AUS",
  };
  
  return map[country] ?? country;
}

/**
 * Checks if the difference between now and global is significant (>50%)
 */
function isSignificantDiff(now: number, global: number): boolean {
  if (global === 0) return now > 0;
  return Math.abs(now - global) / global > 0.5;
}

/**
 * Trend arrow component showing direction of change
 */
function TrendArrow({ now, global }: { now: number; global: number }) {
  if (now === global) return null;
  const direction = now > global ? "up" : "down";
  const label = now > global ? "Higher than global" : "Lower than global";
  return (
    <span
      className="ml-1 text-[10px] text-gray-500"
      role="img"
      aria-label={label}
    >
      {direction === "up" ? "↑" : "↓"}
    </span>
  );
}

export function StatHUD() {
  const statsGlobal = useThreatStore((state) => state.statsGlobal);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const logs = useThreatStore((state) => state.logs);
  const filters = useThreatStore((state) => state.filters);
  
  // Compute DEFCON level
  const defconLevel = getDefconLevel(statsGlobal.activeCritical);
  const defconSubtitle = getDefconSubtitle(defconLevel);
  
  // First-time tooltip hint state
  const [showPulse, setShowPulse] = useState(false);
  
  // Check localStorage on mount
  useEffect(() => {
    const hasSeenTooltip = localStorage.getItem("defcon-tooltip-seen");
    if (!hasSeenTooltip) {
      setShowPulse(true);
    }
  }, []);
  
  // Handle tooltip open to mark as seen
  const handleTooltipOpenChange = (open: boolean) => {
    if (open && showPulse) {
      localStorage.setItem("defcon-tooltip-seen", "true");
      setShowPulse(false);
    }
  };
  
  // Compute filtered stats
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));
  const filteredThreats = activeThreats.filter((threat) =>
    matchesFilters(threat, filters)
  );
  const statsFiltered = computeThreatStats(filteredLogs);
  
  // Check if Now column is empty
  const nowIsEmpty = filteredThreats.length === 0 && statsFiltered.totalAttacks === 0;
  
  // Format active filters for footer
  const enabledSeverities = Object.entries(filters.severity).filter(([_, enabled]) => enabled);
  const enabledAttackTypes = Object.entries(filters.attackType).filter(([_, enabled]) => enabled);
  
  const isAllSeveritiesEnabled = enabledSeverities.length === Object.keys(filters.severity).length;
  const isAllAttackTypesEnabled = enabledAttackTypes.length === Object.keys(filters.attackType).length;
  
  const activeSeverityBadges = isAllSeveritiesEnabled
    ? []
    : enabledSeverities.map(([severity]) => severity as "low" | "medium" | "critical");
  
  const activeAttackTypeBadges = isAllAttackTypesEnabled ? [] : enabledAttackTypes.map(([type]) => type);
  
  const timeRangeLabel =
    filters.timeRange === "all"
      ? "All Time"
      : filters.timeRange === "1min"
        ? "Last 1min"
        : filters.timeRange === "5min"
          ? "Last 5min"
          : "Last 1hr";
  
  const hasNarrowingFilters =
    activeSeverityBadges.length > 0 || activeAttackTypeBadges.length > 0 || filters.timeRange !== "all";

  return (
    <Card className="border-border bg-card shadow-lg" role="region" aria-label="Threat Statistics">
      <TooltipProvider delayDuration={300}>
        <div className="border-b border-border px-6 py-3 group">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 cursor-help">
              <DefconIndicator level={defconLevel} size="sm" />
              <span className="text-sm font-semibold text-foreground">
                DEFCON {defconLevel}
              </span>
            </div>
            <Tooltip onOpenChange={handleTooltipOpenChange}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm cursor-pointer"
                  aria-label="Learn about DEFCON levels"
                >
                  <Info
                    className={`h-4 w-4 text-gray-400 transition-colors hover:text-gray-200 ${
                      showPulse ? "animate-pulse" : ""
                    }`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-sm">
                <div className="space-y-3">
                  <div>
                    <div className="font-semibold text-sm">DEFCON (Defense Condition)</div>
                    <div className="text-xs text-gray-400 mt-1">Military alert readiness scale</div>
                  </div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className={`flex items-center gap-2 ${defconLevel === 5 ? "text-white font-bold" : "text-gray-400"}`}>
                      <DefconIndicator level={5} size="xs" />
                      <span>5 - Normal (0 critical){defconLevel === 5 && " ← YOU ARE HERE"}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${defconLevel === 4 ? "text-white font-bold" : "text-gray-400"}`}>
                      <DefconIndicator level={4} size="xs" />
                      <span>4 - Low (1-2 critical){defconLevel === 4 && " ← YOU ARE HERE"}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${defconLevel === 3 ? "text-white font-bold" : "text-gray-400"}`}>
                      <DefconIndicator level={3} size="xs" />
                      <span>3 - Moderate (3-5 critical){defconLevel === 3 && " ← YOU ARE HERE"}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${defconLevel === 2 ? "text-white font-bold" : "text-gray-400"}`}>
                      <DefconIndicator level={2} size="xs" />
                      <span>2 - Elevated (6-10 critical){defconLevel === 2 && " ← YOU ARE HERE"}</span>
                    </div>
                    <div className={`flex items-center gap-2 ${defconLevel === 1 ? "text-white font-bold" : "text-gray-400"}`}>
                      <DefconIndicator level={1} size="xs" />
                      <span>1 - Maximum (10+ critical){defconLevel === 1 && " ← YOU ARE HERE"}</span>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-3">
                    <div className="text-xs text-gray-400">
                      Based on active critical threats in the system
                    </div>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{defconSubtitle}</div>
        </div>
      </TooltipProvider>
      <CardContent className="space-y-3">
        {/* Comparison Table */}
        <div
          className="pb-2 text-xs"
          role="table"
          aria-label="Threat metrics comparison table: Global versus Now"
        >
          {/* Header */}
          <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 mb-2 text-muted-foreground">
            <span></span>
            <span className="text-right font-mono">Global</span>
            <span className="text-right text-yellow-500 font-mono">Now</span>
          </div>
          
          {/* Table Rows */}
          <div className="space-y-0" role="rowgroup">
            {/* Active Threats */}
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5" role="row">
              <span className="text-gray-300" role="cell">Active Threats</span>
              <span className="text-right text-white font-mono tabular-nums" role="cell">
                {activeThreats.length}
              </span>
              <span
                className={`text-right font-mono tabular-nums ${
                  nowIsEmpty && filteredThreats.length === 0
                    ? "text-gray-600"
                    : isSignificantDiff(filteredThreats.length, activeThreats.length)
                      ? "text-yellow-300 font-semibold"
                      : "text-yellow-500"
                }`}
                role="cell"
                aria-label={`Now ${filteredThreats.length}, global ${activeThreats.length}`}
              >
                {nowIsEmpty && filteredThreats.length === 0 ? "--" : filteredThreats.length}
                {!nowIsEmpty && <TrendArrow now={filteredThreats.length} global={activeThreats.length} />}
              </span>
            </div>
            
            {/* Critical */}
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5" role="row">
              <span className="text-gray-300" role="cell">Critical</span>
              <span className="text-right text-white font-mono tabular-nums" role="cell">
                {statsGlobal.activeCritical}
              </span>
              <span
                className={`text-right font-mono tabular-nums ${
                  nowIsEmpty && statsFiltered.activeCritical === 0
                    ? "text-gray-600"
                    : isSignificantDiff(statsFiltered.activeCritical, statsGlobal.activeCritical)
                      ? "text-yellow-300 font-semibold"
                      : "text-yellow-500"
                }`}
                role="cell"
                aria-label={`Now critical ${statsFiltered.activeCritical}, global critical ${statsGlobal.activeCritical}`}
              >
                {nowIsEmpty && statsFiltered.activeCritical === 0 ? "--" : statsFiltered.activeCritical}
                {!nowIsEmpty && (
                  <TrendArrow now={statsFiltered.activeCritical} global={statsGlobal.activeCritical} />
                )}
              </span>
            </div>
            
            {/* Primary Source */}
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5" role="row">
              <span className="text-gray-300" role="cell">Primary Source</span>
              <span
                className="text-right text-white font-mono truncate"
                role="cell"
                title={toCountryCode(statsGlobal.topSourceCountry)}
              >
                {toCountryCode(statsGlobal.topSourceCountry)}
              </span>
              <span
                className={`text-right font-mono truncate ${
                  nowIsEmpty ? "text-gray-600" : "text-yellow-500"
                }`}
                role="cell"
                title={toCountryCode(statsFiltered.topSourceCountry)}
              >
                {nowIsEmpty ? "--" : toCountryCode(statsFiltered.topSourceCountry)}
              </span>
            </div>
            
            {/* Hotspot Region */}
            <div className="grid grid-cols-[1fr_5rem_5rem] gap-4 items-center py-1.5" role="row">
              <span className="text-gray-300" role="cell">Hotspot Region</span>
              <span className="text-right text-white font-mono" role="cell">
                {statsGlobal.topSourceRegion || "--"}
              </span>
              <span className={`text-right font-mono ${nowIsEmpty ? "text-gray-600" : "text-yellow-500"}`} role="cell">
                {nowIsEmpty ? "--" : (statsFiltered.topSourceRegion || "--")}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Current View Footer */}
        <div className="pt-3 space-y-2">
          <div className="text-xs text-gray-400">🎯 Active Filters</div>
          {hasNarrowingFilters ? (
            <div className="flex flex-wrap items-center gap-2">
              {activeSeverityBadges.map((sev) => {
                const label = sev.charAt(0).toUpperCase() + sev.slice(1);
                const sevClasses =
                  sev === "critical"
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : sev === "medium"
                      ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300"
                      : "border-green-500/40 bg-green-500/10 text-green-300";
                return (
                  <Badge
                    key={sev}
                    variant="outline"
                    className={`font-mono ${sevClasses}`}
                    aria-label={`Severity filter: ${label}`}
                  >
                    {label}
                  </Badge>
                );
              })}

              {activeAttackTypeBadges.map((type) => (
                <Badge
                  key={type}
                  variant="outline"
                  className="font-mono border-gray-700 bg-gray-800/40 text-gray-200"
                  aria-label={`Attack type filter: ${type}`}
                >
                  {type}
                </Badge>
              ))}

              <span className="text-gray-500">•</span>
              <span className="text-xs text-gray-400">{timeRangeLabel}</span>
            </div>
          ) : (
            <div className="text-xs text-gray-400">
              No filters <span className="text-gray-500">•</span> Showing all threats
            </div>
          )}

          {nowIsEmpty && hasNarrowingFilters ? (
            <div className="text-xs text-gray-500">No threats match current filters</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
