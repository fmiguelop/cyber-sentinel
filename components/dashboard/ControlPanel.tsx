"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Download } from "lucide-react";
import { useThreatStore } from "@/stores/useThreatStore";
import { matchesFilters } from "@/lib/threats/filters";
import { logsToJson, logsToCsv, downloadTextFile } from "@/lib/threats/export";
import type { Severity, AttackType, TimeRange } from "@/lib/types/threats";

export function ControlPanel() {
  const isLive = useThreatStore((state) => state.isLive);
  const toggleSimulation = useThreatStore((state) => state.toggleSimulation);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const toggleSound = useThreatStore((state) => state.toggleSound);
  const filters = useThreatStore((state) => state.filters);
  const logs = useThreatStore((state) => state.logs);
  const setFilters = useThreatStore((state) => state.setFilters);

  // Compute filtered logs
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));

  const handleExportFilteredJson = () => {
    const content = logsToJson(filteredLogs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`threats-filtered-${timestamp}.json`, "application/json", content);
  };

  const handleExportFilteredCsv = () => {
    const content = logsToCsv(filteredLogs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`threats-filtered-${timestamp}.csv`, "text/csv", content);
  };

  const handleExportFullJson = () => {
    const content = logsToJson(logs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`threats-full-${timestamp}.json`, "application/json", content);
  };

  const handleExportFullCsv = () => {
    const content = logsToCsv(logs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`threats-full-${timestamp}.csv`, "text/csv", content);
  };

  const toggleSeverity = (severity: Severity) => {
    setFilters({
      severity: {
        ...filters.severity,
        [severity]: !filters.severity[severity],
      },
    });
  };

  const toggleAttackType = (type: AttackType) => {
    setFilters({
      attackType: {
        ...filters.attackType,
        [type]: !filters.attackType[type],
      },
    });
  };

  const setTimeRange = (timeRange: TimeRange) => {
    setFilters({ timeRange });
  };

  return (
    <Card className="h-full border-border bg-card shadow-lg" role="region" aria-label="Control Panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Controls</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Simulation & filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full focus-visible:ring-2 focus-visible:ring-ring"
          variant={isLive ? "destructive" : "default"}
          onClick={toggleSimulation}
          aria-label={isLive ? "Pause simulation" : "Start simulation"}
        >
          {isLive ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Pause Simulation
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Simulation
            </>
          )}
        </Button>

        <Button
          className="w-full focus-visible:ring-2 focus-visible:ring-ring"
          variant={soundEnabled ? "default" : "outline"}
          onClick={toggleSound}
          aria-label={soundEnabled ? "Disable sound alerts" : "Enable sound alerts"}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="h-4 w-4 mr-2" />
              Sound On
            </>
          ) : (
            <>
              <VolumeX className="h-4 w-4 mr-2" />
              Sound Off
            </>
          )}
        </Button>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Severity Filters</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Severity filters">
            <Button
              variant={filters.severity.low ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleSeverity("low")}
              aria-pressed={filters.severity.low}
              aria-label={`Filter ${filters.severity.low ? "showing" : "hiding"} low severity threats`}
            >
              Low
            </Button>
            <Button
              variant={filters.severity.medium ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleSeverity("medium")}
              aria-pressed={filters.severity.medium}
              aria-label={`Filter ${filters.severity.medium ? "showing" : "hiding"} medium severity threats`}
            >
              Medium
            </Button>
            <Button
              variant={filters.severity.critical ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleSeverity("critical")}
              aria-pressed={filters.severity.critical}
              aria-label={`Filter ${filters.severity.critical ? "showing" : "hiding"} critical severity threats`}
            >
              Critical
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Attack Types</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Attack type filters">
            <Button
              variant={filters.attackType.DDoS ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleAttackType("DDoS")}
              aria-pressed={filters.attackType.DDoS}
              aria-label={`Filter ${filters.attackType.DDoS ? "showing" : "hiding"} DDoS attacks`}
            >
              DDoS
            </Button>
            <Button
              variant={filters.attackType.Phishing ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleAttackType("Phishing")}
              aria-pressed={filters.attackType.Phishing}
              aria-label={`Filter ${filters.attackType.Phishing ? "showing" : "hiding"} Phishing attacks`}
            >
              Phishing
            </Button>
            <Button
              variant={filters.attackType.Malware ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleAttackType("Malware")}
              aria-pressed={filters.attackType.Malware}
              aria-label={`Filter ${filters.attackType.Malware ? "showing" : "hiding"} Malware attacks`}
            >
              Malware
            </Button>
            <Button
              variant={filters.attackType.BruteForce ? "default" : "outline"}
              size="sm"
              className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => toggleAttackType("BruteForce")}
              aria-pressed={filters.attackType.BruteForce}
              aria-label={`Filter ${filters.attackType.BruteForce ? "showing" : "hiding"} BruteForce attacks`}
            >
              BruteForce
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Time Range</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Time range filter">
            {(["1min", "5min", "1hr", "all"] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={filters.timeRange === range ? "default" : "outline"}
                size="sm"
                className="h-6 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setTimeRange(range)}
                aria-pressed={filters.timeRange === range}
                aria-label={`Filter threats from ${range === "all" ? "all time" : `last ${range}`}`}
              >
                {range === "all" ? "All" : `Last ${range}`}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <p className="text-xs font-semibold text-foreground">Export Logs</p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleExportFilteredJson}
              disabled={filteredLogs.length === 0}
              aria-label={`Export ${filteredLogs.length} filtered threats as JSON`}
            >
              <Download className="h-3 w-3 mr-1" />
              Filtered JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleExportFilteredCsv}
              disabled={filteredLogs.length === 0}
              aria-label={`Export ${filteredLogs.length} filtered threats as CSV`}
            >
              <Download className="h-3 w-3 mr-1" />
              Filtered CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleExportFullJson}
              disabled={logs.length === 0}
              aria-label={`Export ${logs.length} total threats as JSON`}
            >
              <Download className="h-3 w-3 mr-1" />
              Full JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs focus-visible:ring-2 focus-visible:ring-ring"
              onClick={handleExportFullCsv}
              disabled={logs.length === 0}
              aria-label={`Export ${logs.length} total threats as CSV`}
            >
              <Download className="h-3 w-3 mr-1" />
              Full CSV
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Filtered = current severity/type/time filters ({filteredLogs.length} events)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
