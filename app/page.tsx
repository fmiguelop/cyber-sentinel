"use client";

import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { useCriticalAlertSound } from "@/hooks/useCriticalAlertSound";
import { CyberMap } from "@/components/map/CyberMap";
import { StatHUD } from "@/components/dashboard/StatHUD";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { EventLog } from "@/components/dashboard/EventLog";

export default function Home() {
  // Initialize simulation hook at page level
  useThreatSimulation();
  // Initialize critical alert sound hook
  useCriticalAlertSound();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Dashboard Grid Layout */}
      <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-4 p-4">
        {/* Main Map Area - Takes up ~75% width, top portion (rows 1-10, cols 1-9) */}
        <div className="col-span-9 row-span-10 rounded-lg border border-border bg-card overflow-hidden">
          <CyberMap />
        </div>

        {/* Stats HUD - Top right (rows 1-5, cols 10-12) */}
        <div className="col-span-3 row-span-5 space-y-4">
          <StatHUD />
        </div>

        {/* Control Panel - Bottom right, takes remaining vertical space (rows 6-12, cols 10-12) */}
        <div className="col-span-3 row-span-7">
          <ControlPanel />
        </div>

        {/* Live Event Log - Bottom left, same width as map (rows 11-12, cols 1-9) */}
        <div className="col-span-9 row-span-2">
          <EventLog />
        </div>
      </div>
    </div>
  );
}
