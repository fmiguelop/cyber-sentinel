"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { format } from "date-fns";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useThreatStore, selectFilteredLogs } from "@/stores/useThreatStore";
import { severityToColorToken } from "@/lib/threats/random";
import {
  ChevronUp,
  ChevronDown,
  Download,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logsToJson, logsToCsv, downloadTextFile } from "@/lib/threats/export";
type LogPanelSize = "min" | "normal" | "max";
const MOBILE_HEIGHTS = {
  min: "h-16",
  max: "h-[60vh]",
} as const;
const DESKTOP_HEIGHT = "calc((100vh - 13rem) / 6)";
const SIZE_ENTRY_LIMITS = {
  min: 3,
  normal: 10,
  max: Infinity,
} as const;
const STORAGE_KEY = "cybersentinel-log-panel-size";
export function ResponsiveLog() {
  const filteredLogs = useThreatStore(selectFilteredLogs);
  const logs = useThreatStore((state) => state.logs);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  const handleExportFilteredJson = () => {
    const content = logsToJson(filteredLogs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(
      `threats-filtered-${timestamp}.json`,
      "application/json",
      content
    );
  };
  const handleExportFilteredCsv = () => {
    const content = logsToCsv(filteredLogs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`threats-filtered-${timestamp}.csv`, "text/csv", content);
  };
  const handleExportFullJson = () => {
    const content = logsToJson(logs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(
      `threats-full-${timestamp}.json`,
      "application/json",
      content
    );
  };
  const handleExportFullCsv = () => {
    const content = logsToCsv(logs);
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadTextFile(`threats-full-${timestamp}.csv`, "text/csv", content);
  };
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);
  const [panelSize, setPanelSize] = useState<LogPanelSize>(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(STORAGE_KEY) as LogPanelSize | null;
      if (stored && ["min", "normal", "max"].includes(stored)) {
        if (window.innerWidth >= 1024 && stored === "min") {
          return "normal";
        }
        return stored;
      }
      return window.innerWidth >= 1024 ? "normal" : "min";
    }
    return "normal";
  });
  useEffect(() => {
    if (!isMobile && panelSize !== "normal") {
      setPanelSize("normal");
    }
  }, [isMobile, panelSize]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sizeToStore =
        !isMobile && panelSize === "min" ? "normal" : panelSize;
      sessionStorage.setItem(STORAGE_KEY, sizeToStore);
    }
  }, [panelSize, isMobile]);
  const handleMobileToggle = useCallback(() => {
    if (!isMobile) return;
    setPanelSize((current) => (current === "min" ? "max" : "min"));
  }, [isMobile]);
  const previousCriticalIdsRef = useRef<Set<string>>(new Set());
  const [criticalAnnouncements, setCriticalAnnouncements] = useState<string[]>(
    []
  );
  useEffect(() => {
    const newCriticalThreats = filteredLogs
      .filter(
        (threat) =>
          threat.severity === "critical" &&
          !previousCriticalIdsRef.current.has(threat.id)
      )
      .slice(0, 5);
    if (newCriticalThreats.length > 0) {
      const newAnnouncements: string[] = [];
      newCriticalThreats.forEach((threat) => {
        previousCriticalIdsRef.current.add(threat.id);
        const announcement = `Critical ${threat.type} threat from ${threat.source.name} to ${threat.target.name}`;
        newAnnouncements.push(announcement);
      });
      setCriticalAnnouncements((prev) => {
        const updated = [...prev, ...newAnnouncements];
        return updated.length > 10 ? updated.slice(-5) : updated;
      });
    }
  }, [filteredLogs]);
  useEffect(() => {
    if (isMobile && panelSize === "max" && scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = 0;
      }
    }
  }, [filteredLogs.length, panelSize, isMobile]);
  const displayedLogs =
    panelSize === "max" || !isMobile
      ? filteredLogs
      : filteredLogs.slice(0, SIZE_ENTRY_LIMITS[panelSize]);
  const heightValue = isMobile
    ? panelSize === "min"
      ? "4rem"
      : "60vh"
    : DESKTOP_HEIGHT;
  return (
    <motion.div
      id="event-log"
      animate={{
        height: heightValue,
      }}
      transition={{
        type: "spring",
        damping: 20,
        stiffness: 300,
      }}
      className={`overflow-hidden w-full ${
        isMobile
          ? "fixed bottom-0 left-0 right-0 z-40 px-4 pb-4"
          : "w-full self-end"
      }`}
    >
      <Card
        className="h-full border-border bg-card shadow-lg flex flex-col"
        role="region"
        aria-label="Live Event Log"
      >
        <CardHeader
          className="pb-2 pt-3 px-4 shrink-0 border-b border-border cursor-pointer"
          onClick={isMobile ? handleMobileToggle : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isMobile && (
                <div className="w-8 h-0.5 bg-muted-foreground/30 rounded-full" />
              )}
              <CardTitle className="text-sm font-semibold">
                Live Event Log
              </CardTitle>
              <span className="text-xs text-muted-foreground font-mono">
                ({filteredLogs.length} events)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 p-0 text-zinc-500 hover:text-emerald-500 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    aria-label="Export logs"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <DropdownMenuLabel>Filtered View</DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={filteredLogs.length === 0}
                    onSelect={handleExportFilteredJson}
                    aria-label={`Export ${filteredLogs.length} filtered threats as JSON`}
                  >
                    <FileJson className="h-4 w-4" />
                    Download as JSON
                    <span className="ml-auto text-xs text-gray-400">
                      {filteredLogs.length}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={filteredLogs.length === 0}
                    onSelect={handleExportFilteredCsv}
                    aria-label={`Export ${filteredLogs.length} filtered threats as CSV`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Download as CSV
                    <span className="ml-auto text-xs text-gray-400">
                      {filteredLogs.length}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Full Dataset</DropdownMenuLabel>
                  <DropdownMenuItem
                    disabled={logs.length === 0}
                    onSelect={handleExportFullJson}
                    aria-label={`Export ${logs.length} total threats as JSON`}
                  >
                    <FileJson className="h-4 w-4" />
                    Download as JSON
                    <span className="ml-auto text-xs text-gray-400">
                      {logs.length}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    disabled={logs.length === 0}
                    onSelect={handleExportFullCsv}
                    aria-label={`Export ${logs.length} total threats as CSV`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Download as CSV
                    <span className="ml-auto text-xs text-gray-400">
                      {logs.length}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-xs hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMobileToggle();
                  }}
                  aria-label={
                    panelSize === "min"
                      ? "Expand log panel"
                      : "Collapse log panel"
                  }
                  title={panelSize === "min" ? "Expand" : "Collapse"}
                >
                  {panelSize === "min" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {criticalAnnouncements.map((announcement, idx) => (
              <div key={idx}>{announcement}</div>
            ))}
          </div>
          <ScrollArea className="h-full rounded border-t border-border bg-background p-2 font-mono text-xs">
            <div ref={scrollAreaRef}>
              {displayedLogs.length === 0 ? (
                <div className="text-muted-foreground">
                  [SYSTEM] CyberSentinel initialized. Waiting for threat
                  events...
                </div>
              ) : (
                <AnimatePresence mode="popLayout" initial={false}>
                  {displayedLogs.map((log) => {
                    const severityColor = severityToColorToken(log.severity);
                    return (
                      <motion.div
                        key={log.id}
                        initial={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { opacity: 0, y: -10 }
                        }
                        animate={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { opacity: 1, y: 0 }
                        }
                        exit={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : { opacity: 0, height: 0 }
                        }
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { duration: 0.2 }
                        }
                        className="mb-1"
                      >
                        <div className="flex items-start gap-2 text-foreground">
                          <span className="text-muted-foreground">
                            [{format(new Date(log.timestamp), "HH:mm:ss")}]
                          </span>
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
                          <span>{log.type}</span>
                          <span className="text-muted-foreground">from</span>
                          <span>{log.source.name}</span>
                          <span className="text-muted-foreground">to</span>
                          <span>{log.target.name}</span>
                          <span className="text-muted-foreground font-mono text-[10px]">
                            ({log.metadata.ipAddress})
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </motion.div>
  );
}
