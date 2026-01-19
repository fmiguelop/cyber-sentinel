"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HudSectionTitle } from "@/components/dashboard/hud";
import {
  Activity,
  ChevronRight,
  ChevronsRight,
  Filter,
  Globe,
  MapIcon,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Zap,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useThreatStore } from "@/stores/useThreatStore";
import type { Severity, AttackType, TimeRange } from "@/lib/types/threats";
import { useMediaQuery } from "@uidotdev/usehooks";

const SPEED_OPTIONS = [
  { value: 1, icon: ChevronRight, label: "1x" },
  { value: 2, icon: ChevronsRight, label: "2x" },
  { value: 4, icon: Zap, label: "4x" },
] as const;

export function ControlsCard() {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const isLive = useThreatStore((state) => state.isLive);
  const speed = useThreatStore((state) => state.speed);
  const filters = useThreatStore((state) => state.filters);
  const mapType = useThreatStore((state) => state.mapType);
  const toggleSimulation = useThreatStore((state) => state.toggleSimulation);
  const resetSimulation = useThreatStore((state) => state.resetSimulation);
  const setSpeed = useThreatStore((state) => state.setSpeed);
  const setFilters = useThreatStore((state) => state.setFilters);
  const toggleMapType = useThreatStore((state) => state.toggleMapType);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const toggleSound = useThreatStore((state) => state.toggleSound);
  const logs = useThreatStore((state) => state.logs);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const totalEvents = logs.length;

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

  const handleSpeedChange = (speed: number) => {
    setSpeed(speed);
    if (!isLive) {
      toggleSimulation();
    }
  };

  useEffect(() => {
    if (isMobile) {
      toggleMapType();
    }
  }, [isMobile]);

  return (
    <>
      <section aria-labelledby="simulation-heading">
        <HudSectionTitle icon={Activity} id="simulation-heading">
          Simulation
        </HudSectionTitle>
        <TooltipProvider>
          <div
            id="simulation-controls"
            className="flex items-center gap-1 bg-zinc-900/50 p-1 border border-zinc-800 rounded-sm h-10"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-none hover:text-red-500 focus-visible:ring-2 focus-visible:ring-ring ${
                    totalEvents === 0 ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={totalEvents === 0}
                  onClick={() => setShowResetDialog(true)}
                  aria-label="Reset simulation"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Data</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-zinc-700" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isLive ? "text-emerald-500" : ""
                  }`}
                  onClick={toggleSimulation}
                  aria-label={isLive ? "Pause simulation" : "Start simulation"}
                >
                  {isLive ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Simulation</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-0">
                  {SPEED_OPTIONS.map(({ value, icon: Icon, label }) => (
                    <Button
                      key={value}
                      size="icon"
                      variant="ghost"
                      className={`h-8 w-8 rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                        speed === value
                          ? "bg-emerald-500/20 text-emerald-500"
                          : ""
                      }`}
                      onClick={() => handleSpeedChange(value)}
                      aria-label={`Set speed to ${label}`}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  ))}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Simulation Speed (1x/2x/4x)</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-zinc-700" />

            <Tooltip>
              <TooltipTrigger asChild>
                <div id="active-filters">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label="Open filters"
                      >
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-zinc-950/95 backdrop-blur-md border border-zinc-800 p-3 w-80 text-xs"
                    >
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <p className="font-mono uppercase tracking-widest text-[10px] text-zinc-400 mb-2">
                            Severity
                          </p>
                          <div className="flex flex-wrap gap-2" role="group">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.severity.low
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleSeverity("low")}
                              aria-pressed={filters.severity.low}
                            >
                              Low
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.severity.medium
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleSeverity("medium")}
                              aria-pressed={filters.severity.medium}
                            >
                              Medium
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.severity.critical
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleSeverity("critical")}
                              aria-pressed={filters.severity.critical}
                            >
                              Critical
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-mono uppercase tracking-widest text-[10px] text-zinc-400 mb-2">
                            Attack Types
                          </p>
                          <div className="flex flex-wrap gap-2" role="group">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.attackType.DDoS
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleAttackType("DDoS")}
                              aria-pressed={filters.attackType.DDoS}
                            >
                              DDoS
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.attackType.Phishing
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleAttackType("Phishing")}
                              aria-pressed={filters.attackType.Phishing}
                            >
                              Phishing
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.attackType.Malware
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleAttackType("Malware")}
                              aria-pressed={filters.attackType.Malware}
                            >
                              Malware
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                filters.attackType.BruteForce
                                  ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                  : ""
                              }`}
                              onClick={() => toggleAttackType("BruteForce")}
                              aria-pressed={filters.attackType.BruteForce}
                            >
                              BruteForce
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="font-mono uppercase tracking-widest text-[10px] text-zinc-400 mb-2">
                            Time Range
                          </p>
                          <div className="flex flex-wrap gap-2" role="group">
                            {(
                              ["1min", "5min", "1hr", "all"] as TimeRange[]
                            ).map((range) => (
                              <Button
                                key={range}
                                variant="outline"
                                size="sm"
                                className={`h-6 text-xs rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                                  filters.timeRange === range
                                    ? "border-emerald-500 text-emerald-500 bg-emerald-500/10"
                                    : ""
                                }`}
                                onClick={() => setTimeRange(range)}
                                aria-pressed={filters.timeRange === range}
                              >
                                {range === "all" ? "All" : range}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Filter Threat Types</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  id="map-view-button"
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                    mapType === "flat" ? "text-emerald-500" : ""
                  }`}
                  onClick={toggleMapType}
                  aria-label={
                    mapType === "globe"
                      ? "Switch to flat map"
                      : "Switch to globe view"
                  }
                >
                  {mapType === "globe" ? (
                    <MapIcon className="h-4 w-4" />
                  ) : (
                    <Globe className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Map View</p>
              </TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-zinc-700" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  id="sound-button"
                  size="icon"
                  variant="ghost"
                  className={`h-8 w-8 rounded-none focus-visible:ring-2 focus-visible:ring-ring ${
                    soundEnabled ? "text-emerald-500" : ""
                  }`}
                  onClick={toggleSound}
                  aria-label={
                    soundEnabled
                      ? "Disable sound alerts"
                      : "Enable sound alerts"
                  }
                >
                  {soundEnabled ? (
                    <Volume2 className="h-4 w-4" />
                  ) : (
                    <VolumeX className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle Audio Effects</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </section>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Simulation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will stop the simulation and clear all {totalEvents} threat
              events. This action cannot be undone.
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
    </>
  );
}
export function ControlPanel() {
  return (
    <div role="region" aria-label="Control Panel" className="px-6 py-4">
      <ControlsCard />
    </div>
  );
}
