"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Map } from "@/components/ui/map";
import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { useThreatStore } from "@/stores/useThreatStore";
import { Play, Pause } from "lucide-react";

export default function Home() {
  // Initialize simulation hook
  useThreatSimulation();

  // Get store state
  const isLive = useThreatStore((state) => state.isLive);
  const toggleSimulation = useThreatStore((state) => state.toggleSimulation);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const logs = useThreatStore((state) => state.logs);
  const statsGlobal = useThreatStore((state) => state.statsGlobal);

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Dashboard Grid Layout */}
      <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-4 p-4">
        {/* Main Map Area - Takes up ~80% (rows 1-10, cols 1-9) */}
        <div className="col-span-9 row-span-10 rounded-lg border border-border bg-card overflow-hidden">
          <div className="flex h-full items-center justify-center">
            <Map />
          </div>
        </div>

        {/* Top-Left: Stats HUD (rows 1-5, cols 10-12) */}
        <div className="col-span-3 row-span-5 space-y-4">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Global Defcon Status</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Real-time threat metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Attacks</span>
                <Badge variant="outline" className="font-mono">{statsGlobal.totalAttacks}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Threats</span>
                <Badge variant="outline" className="font-mono">{activeThreats.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Critical</span>
                <Badge variant="destructive" className="font-mono">{statsGlobal.activeCritical}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total Logs</span>
                <Badge variant="outline" className="font-mono">{logs.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top Source</span>
                <span className="text-xs font-mono text-foreground">
                  {statsGlobal.topSourceCountry || "--"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top-Right: Control Panel (rows 6-10, cols 10-12) */}
        <div className="col-span-3 row-span-5">
          <Card className="h-full border-border bg-card">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Controls</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Simulation & filters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full"
                variant={isLive ? "destructive" : "default"}
                onClick={toggleSimulation}
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
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Severity Filters</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer">Low</Badge>
                  <Badge variant="outline" className="cursor-pointer">Medium</Badge>
                  <Badge variant="outline" className="cursor-pointer">Critical</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-foreground">Attack Types</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer text-xs">DDoS</Badge>
                  <Badge variant="outline" className="cursor-pointer text-xs">Phishing</Badge>
                  <Badge variant="outline" className="cursor-pointer text-xs">Malware</Badge>
                  <Badge variant="outline" className="cursor-pointer text-xs">BruteForce</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom-Right: Live Event Log (rows 11-12, cols 1-12) */}
        <div className="col-span-12 row-span-2">
          <Card className="h-full border-border bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Live Event Log</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Terminal-style threat feed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded border border-border bg-background p-2 font-mono text-xs">
                {logs.length === 0 ? (
                  <div className="text-muted-foreground">
                    [SYSTEM] CyberSentinel initialized. Waiting for threat events...
                  </div>
                ) : (
                  <div className="space-y-1">
                    {logs.slice(0, 10).map((log) => (
                      <div key={log.id} className="text-foreground">
                        [{new Date(log.timestamp).toLocaleTimeString()}] {log.type} from{" "}
                        {log.source.name} to {log.target.name} ({log.severity})
                      </div>
                    ))}
                    {logs.length > 10 && (
                      <div className="text-muted-foreground">
                        ... and {logs.length - 10} more events
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
