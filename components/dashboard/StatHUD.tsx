"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useThreatStore } from "@/stores/useThreatStore";

export function StatHUD() {
  const statsGlobal = useThreatStore((state) => state.statsGlobal);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const logs = useThreatStore((state) => state.logs);

  return (
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
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Top Region</span>
          <span className="text-xs font-mono text-foreground">
            {statsGlobal.topSourceRegion || "--"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
