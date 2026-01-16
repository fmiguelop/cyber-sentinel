"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Volume2, VolumeX, Download, RotateCcw, Activity, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useThreatStore } from "@/stores/useThreatStore";
import { matchesFilters } from "@/lib/threats/filters";
import { logsToJson, logsToCsv, downloadTextFile } from "@/lib/threats/export";
import type { Severity, AttackType, TimeRange } from "@/lib/types/threats";

export function ControlPanel() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  
  const isLive = useThreatStore((state) => state.isLive);
  const toggleSimulation = useThreatStore((state) => state.toggleSimulation);
  const resetSimulation = useThreatStore((state) => state.resetSimulation);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const toggleSound = useThreatStore((state) => state.toggleSound);
  const filters = useThreatStore((state) => state.filters);
  const logs = useThreatStore((state) => state.logs);
  const setFilters = useThreatStore((state) => state.setFilters);
  const clearAllFilters = useThreatStore((state) => state.clearAllFilters);

  const totalEvents = logs.length;

  // Compute filtered logs
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));

  // Compute active filter count
  const severityActive = !(filters.severity.low && filters.severity.medium && filters.severity.critical);
  const attackTypeActive = !(
    filters.attackType.DDoS &&
    filters.attackType.Phishing &&
    filters.attackType.Malware &&
    filters.attackType.BruteForce
  );
  const timeRangeActive = filters.timeRange !== "all";
  const activeFilterCount = [severityActive, attackTypeActive, timeRangeActive].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

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

  const handleResetConfirm = () => {
    resetSimulation();
    setShowResetDialog(false);
  };

  return (
    <Card className="h-full border-border bg-card shadow-lg" role="region" aria-label="Control Panel">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Controls</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Simulation & filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Simulation Section */}
        <section aria-labelledby="simulation-heading">
          <h3
            id="simulation-heading"
            className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Simulation</span>
          </h3>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                className="flex-1 focus-visible:ring-2 focus-visible:ring-ring"
                variant={isLive ? "destructive" : "default"}
                size="sm"
                onClick={toggleSimulation}
                aria-label={isLive ? "Pause simulation" : "Start simulation"}
              >
                {isLive ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant={totalEvents === 0 ? "outline" : "destructive"}
                      className={`w-10 focus-visible:ring-2 focus-visible:ring-ring ${
                        totalEvents === 0
                          ? "bg-gray-700 opacity-50 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                      disabled={totalEvents === 0}
                      onClick={() => setShowResetDialog(true)}
                      aria-label="Reset simulation"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Stop & clear all data</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Button
              className="w-full focus-visible:ring-2 focus-visible:ring-ring"
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleSound}
              aria-label={soundEnabled ? "Disable sound alerts" : "Enable sound alerts"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Sound: On
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4 mr-2" />
                  Sound: Off
                </>
              )}
            </Button>
          </div>
          {totalEvents > 0 && (
            <p className="text-xs text-gray-400 mt-2">
              {isLive ? "⚡ Active" : "⏸ Paused"} • {totalEvents} events
            </p>
          )}
        </section>

        {/* Reset Confirmation Dialog */}
        <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset Simulation?</AlertDialogTitle>
              <AlertDialogDescription>
                This will stop the simulation and clear all {totalEvents} threat events. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetConfirm}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                Reset All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="border-t border-gray-800" />

        {/* Active Filters Section */}
        <section aria-labelledby="filters-heading">
          <h3
            id="filters-heading"
            className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>Active Filters{hasActiveFilters && ` (${activeFilterCount})`}</span>
          </h3>

          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-400 mb-2">Severity</p>
              <div className="flex flex-wrap gap-2 overflow-x-auto" role="group" aria-label="Severity filters">
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
              <p className="text-xs font-medium text-gray-400 mb-2">Attack Types</p>
              <div className="flex flex-wrap gap-2 overflow-x-auto" role="group" aria-label="Attack type filters">
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
              <p className="text-xs font-medium text-gray-400 mb-2">Time Range</p>
              <div className="flex flex-wrap gap-2 overflow-x-auto" role="group" aria-label="Time range filter">
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
                    {range === "all" ? "All" : range}
                  </Button>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                className="w-full text-gray-400 hover:text-white focus-visible:ring-2 focus-visible:ring-ring mt-3"
                onClick={clearAllFilters}
                aria-label="Clear all active filters"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        </section>

        <div className="border-t border-gray-800" />

        {/* Export Logs Section */}
        <section aria-labelledby="export-heading">
          <h3
            id="export-heading"
            className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Export Logs</span>
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-2">
                Current View ({filteredLogs.length} events)
              </p>
              <div className="flex gap-2" role="group" aria-label="Export current view">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleExportFilteredJson}
                  disabled={filteredLogs.length === 0}
                  aria-label={`Export ${filteredLogs.length} filtered threats as JSON`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleExportFilteredCsv}
                  disabled={filteredLogs.length === 0}
                  aria-label={`Export ${filteredLogs.length} filtered threats as CSV`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-400 mb-2">
                Full Dataset ({logs.length} events)
              </p>
              <div className="flex gap-2" role="group" aria-label="Export full dataset">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleExportFullJson}
                  disabled={logs.length === 0}
                  aria-label={`Export ${logs.length} total threats as JSON`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  JSON
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={handleExportFullCsv}
                  disabled={logs.length === 0}
                  aria-label={`Export ${logs.length} total threats as CSV`}
                >
                  <Download className="h-3 w-3 mr-1" />
                  CSV
                </Button>
              </div>
            </div>
          </div>
        </section>
      </CardContent>
    </Card>
  );
}
