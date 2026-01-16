"use client";

import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { CyberMap } from "@/components/map/CyberMap";
import { StatHUD } from "@/components/dashboard/StatHUD";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { EventLog } from "@/components/dashboard/EventLog";

export default function Home() {
  // Initialize simulation hook at page level
  useThreatSimulation();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Dashboard Grid Layout */}
      <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-4 p-4">
        {/* Main Map Area - Takes up ~80% (rows 1-10, cols 1-9) */}
        <div className="col-span-9 row-span-10 rounded-lg border border-border bg-card overflow-hidden">
          <CyberMap />
        </div>

        {/* Top-Left: Stats HUD (rows 1-5, cols 10-12) */}
        <div className="col-span-3 row-span-5 space-y-4">
          <StatHUD />
        </div>

        {/* Top-Right: Control Panel (rows 6-10, cols 10-12) */}
        <div className="col-span-3 row-span-5">
          <ControlPanel />
        </div>

        {/* Bottom: Live Event Log (rows 11-12, cols 1-12) */}
        <div className="col-span-12 row-span-2">
          <EventLog />
        </div>
      </div>
    </div>
  );
}
