"use client";

import { useRef, useState } from "react";
import {
  motion,
  useDragControls,
  PanInfo,
  useAnimation,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";
import {
  ChevronUp,
  Play,
  Pause,
  Activity,
  ShieldAlert,
  Globe,
  Terminal,
  Filter,
  MapIcon,
  Square,
  Volume2,
  VolumeX,
  VideoOff,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assumes you have a standard shadcn/tailwind utils
import { Button } from "@/components/ui/button";
import { useThreatStore } from "@/stores/useThreatStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { AttackType, Severity, ThreatEvent, TimeRange } from "@/lib/types/threats";
import { DefconIndicator, getDefconLevel } from "./dashboard/DefconSection";
import { ScrollArea } from "./ui/scroll-area";
import { severityToColorToken } from "@/lib/threats/random";

export function MobileSimulationUI() {
  const isLive = useThreatStore((state) => state.isLive);
  const onTogglePlay = useThreatStore((state) => state.toggleSimulation);
  const resetSimulation = useThreatStore((state) => state.resetSimulation);
  const logs = useThreatStore((state) => state.logs);
  const [isOpen, setIsOpen] = useState(false);
  const controls = useAnimation();
  const filters = useThreatStore((state) => state.filters);
  const shouldReduceMotion = useReducedMotion();
  const dragControls = useDragControls();
  const statsGlobal = useThreatStore((state) => state.statsGlobal);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const soundEnabled = useThreatStore((state) => state.soundEnabled);
  const toggleSound = useThreatStore((state) => state.toggleSound);
  const mapType = useThreatStore((state) => state.mapType);
  const setFilters = useThreatStore((state) => state.setFilters);
  const toggleMapType = useThreatStore((state) => state.toggleMapType);
  const totalEvents = logs.length;
  const defconLevel = getDefconLevel(statsGlobal.activeCritical);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const autoTrackEnabled = useThreatStore((state) => state.autoTrackEnabled);
  const toggleAutoTrack = useThreatStore((state) => state.toggleAutoTrack);

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

  const COLLAPSED_HEIGHT = 60;
  const EXPANDED_HEIGHT = 500;

  const handleDragEnd = (event: unknown, info: PanInfo) => {
    const threshold = 100;

    if (info.offset.y < -threshold || info.velocity.y < -500) {
      setIsOpen(true);
      controls.start("open");
    } else if (info.offset.y > threshold || info.velocity.y > 500) {
      setIsOpen(false);
      controls.start("closed");
    } else {
      controls.start(isOpen ? "open" : "closed");
    }
  };

  const toggleDrawer = () => {
    if (isOpen) {
      setIsOpen(false);
      controls.start("closed");
    } else {
      setIsOpen(true);
      controls.start("open");
    }
  };

  return (
    <>
      <motion.div
        className="fixed left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-black/40 p-1.5 shadow-xl backdrop-blur-md lg:hidden"
        animate={{
          bottom: isOpen ? EXPANDED_HEIGHT + 20 : COLLAPSED_HEIGHT + 20,
        }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <Button
          size="icon"
          variant="ghost"
          className={cn(
            "focus-visible:ring-ring h-8 w-8 rounded-full hover:text-red-500 focus-visible:ring-2",
            totalEvents === 0 ? "cursor-not-allowed opacity-50" : "",
            isLive ? "text-red-500" : ""
          )}
          disabled={totalEvents === 0}
          onClick={resetSimulation}
          aria-label="Stop Simulation"
        >
          <Square className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-10 w-10 rounded-full text-emerald-400 hover:bg-white/10"
          onClick={onTogglePlay}
        >
          {isLive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
        </Button>

        <div className="h-4 w-px bg-white/20" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-muted-foreground focus-visible:ring-ring h-10 w-10 rounded-full hover:bg-white/10 focus-visible:ring-2"
              aria-label="Open filters"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 border border-zinc-800 bg-zinc-950/95 p-3 text-xs backdrop-blur-md"
          >
            <div className="space-y-3">
              <div className="space-y-2">
                <p className="mb-2 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
                  Severity
                </p>
                <div className="flex flex-wrap gap-2" role="group">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.severity.low
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.severity.medium
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.severity.critical
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                <p className="mb-2 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
                  Attack Types
                </p>
                <div className="flex flex-wrap gap-2" role="group">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.attackType.DDoS
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.attackType.Phishing
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.attackType.Malware
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                    className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                      filters.attackType.BruteForce
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
                <p className="mb-2 font-mono text-[10px] tracking-widest text-zinc-400 uppercase">
                  Time Range
                </p>
                <div className="flex flex-wrap gap-2" role="group">
                  {(["1min", "5min", "1hr", "all"] as TimeRange[]).map((range) => (
                    <Button
                      key={range}
                      variant="outline"
                      size="sm"
                      className={`focus-visible:ring-ring h-6 rounded-none text-xs focus-visible:ring-2 ${
                        filters.timeRange === range
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-500"
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
        <Button
          size="icon"
          variant="ghost"
          className="text-muted-foreground h-10 w-10 rounded-full hover:bg-white/10"
          onClick={toggleMapType}
        >
          {mapType === "globe" ? <MapIcon className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
        </Button>
        <div className="h-4 w-px bg-white/20" />

        <Button
          id="sound-button"
          size="icon"
          variant="ghost"
          className={`text-muted-foreground focus-visible:ring-ring h-10 w-10 rounded-full hover:bg-white/10 focus-visible:ring-2 ${
            soundEnabled ? "text-emerald-500" : ""
          }`}
          onClick={toggleSound}
          aria-label={soundEnabled ? "Disable sound alerts" : "Enable sound alerts"}
        >
          {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>
        <Button
          id="auto-track-button"
          variant="ghost"
          className={`text-muted-foreground focus-visible:ring-ring h-10 w-10 rounded-full hover:bg-white/10 focus-visible:ring-2 ${
            autoTrackEnabled ? "text-emerald-500" : ""
          }`}
          onClick={toggleAutoTrack}
          aria-label={autoTrackEnabled ? "Disable auto tracking" : "Enable auto tracking"}
        >
          {autoTrackEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
      </motion.div>

      <motion.div
        drag="y"
        dragControls={dragControls}
        dragListener={false}
        dragConstraints={{ top: -EXPANDED_HEIGHT, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        initial="closed"
        animate={controls}
        variants={{
          closed: { y: 0 },
          open: { y: -EXPANDED_HEIGHT + COLLAPSED_HEIGHT },
        }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 bottom-0 left-0 z-40 rounded-t-3xl border-t border-white/10 bg-zinc-950/90 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:hidden"
        style={{
          height: EXPANDED_HEIGHT,
          bottom: -EXPANDED_HEIGHT + COLLAPSED_HEIGHT,
        }}
      >
        <div
          onPointerDown={(e) => dragControls.start(e)}
          onClick={toggleDrawer}
          className="flex h-[60px] w-full cursor-grab items-center gap-3 border-b border-white/5 px-4 active:cursor-grabbing"
        >
          <div className="absolute top-2 left-1/2 h-1.5 w-12 -translate-x-1/2 rounded-full bg-zinc-700/50" />

          <div className="flex w-full items-center gap-3 pt-2">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded bg-zinc-800/50",
                logs && logs[0]?.severity === "critical" ? "text-red-500" : "text-emerald-500"
              )}
            >
              <Terminal className="h-3.5 w-3.5" />
            </div>

            <div className="line-clamp-1 min-w-0 flex-1 truncate overflow-hidden font-mono text-xs text-ellipsis text-zinc-400">
              {logs[0] ? (
                <LogItem
                  log={logs[0]}
                  severityColor={
                    logs[0].type === "DDoS" ? "#d946ef" : severityToColorToken(logs[0]?.severity)
                  }
                />
              ) : (
                "System initializing..."
              )}
            </div>

            <ChevronUp
              className={cn(
                "h-4 w-4 text-zinc-500 transition-transform duration-300",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </div>

        <div className="h-full overflow-y-auto p-4 pb-20">
          <div className="mb-6 grid grid-cols-2 gap-3">
            <StatCard
              label="Active Threats"
              value={activeThreats.length}
              icon={<Activity className="h-4 w-4 text-blue-400" />}
            />
            <StatCard
              label="Critical"
              value={statsGlobal.bySeverity.critical}
              icon={<ShieldAlert className="h-4 w-4 text-red-400" />}
              alert
            />
            <StatCard
              label="Primary Source"
              value={statsGlobal.topSourceCountry}
              icon={<Globe className="h-4 w-4 text-purple-400" />}
            />
            <StatCard
              label="Status"
              value={`DEFCON ${defconLevel}`}
              icon={<DefconIndicator level={defconLevel} size="sm" />}
            />
          </div>

          <h3 className="mb-3 px-1 text-xs font-bold tracking-wider text-zinc-500 uppercase">
            Event Log History
          </h3>
          <ScrollArea className="border-border bg-background h-[190px] overflow-auto rounded border-t p-2 font-mono text-xs">
            <div ref={scrollAreaRef}>
              {logs.length === 0 ? (
                <div className="text-muted-foreground">
                  [SYSTEM] CyberSentinel initialized. Waiting for threat events...
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {logs.map((log) => {
                    const severityColor = log.metadata.isBotnet
                      ? "#d946ef"
                      : severityToColorToken(log.severity);
                    return (
                      <motion.div
                        key={log.id}
                        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -10 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, height: 0 }}
                        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                        className="mb-1"
                      >
                        <LogItem log={log} severityColor={severityColor} />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </>
  );
}

function StatCard({
  label,
  value,
  icon,
  alert,
}: {
  label: string;
  value: number | string | null;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border bg-zinc-900/50 p-3",
        alert ? "border-red-900/30 bg-red-950/10" : "border-white/5"
      )}
    >
      <div className="flex items-start justify-between opacity-70">
        <span className="text-[10px] font-semibold tracking-wider text-zinc-400 uppercase">
          {label}
        </span>
        {icon}
      </div>
      <div className="font-mono text-xl font-medium text-zinc-100">{value}</div>
    </div>
  );
}

function LogItem({ log, severityColor }: { log: ThreatEvent; severityColor: string }) {
  return (
    <div className="text-foreground flex items-start gap-2 whitespace-nowrap">
      <span
        className={`font-semibold ${
          log.severity === "critical"
            ? "glow-critical"
            : log.severity === "medium"
              ? "glow-medium"
              : "glow-low"
        }`}
        style={{ color: severityColor }}
      >
        [{log.severity.toUpperCase()}]
      </span>
      <span>{log.metadata.isBotnet ? "DDoS Botnet Swarm" : log.type}</span>

      <span className="text-muted-foreground">from</span>
      <span>{log.source.name}</span>
      <span className="text-muted-foreground">to</span>
      <span>{log.target.name}</span>
      <span className="text-muted-foreground font-mono text-[10px]">
        ({log.metadata.ipAddress})
      </span>
    </div>
  );
}
