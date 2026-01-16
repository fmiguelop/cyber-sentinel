"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useThreatStore } from "@/stores/useThreatStore";
import { matchesFilters } from "@/lib/threats/filters";
import { computeThreatStats } from "@/lib/threats/stats";

export function StatHUD() {
  const statsGlobal = useThreatStore((state) => state.statsGlobal);
  const activeThreats = useThreatStore((state) => state.activeThreats);
  const logs = useThreatStore((state) => state.logs);
  const filters = useThreatStore((state) => state.filters);
  
  // Compute filtered stats
  const filteredLogs = logs.filter((threat) => matchesFilters(threat, filters));
  const filteredThreats = activeThreats.filter((threat) =>
    matchesFilters(threat, filters)
  );
  const statsFiltered = computeThreatStats(filteredLogs);

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Global Defcon Status</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          Real-time threat metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Global Stats Section */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground">Global (All Time)</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Attacks</span>
            <Badge variant="outline" className="font-mono">{statsGlobal.totalAttacks}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Active Critical</span>
            <Badge variant="destructive" className="font-mono">{statsGlobal.activeCritical}</Badge>
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
        </div>

        <Separator />

        {/* Filtered Stats Section */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-foreground">Filtered</div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Active Threats</span>
            <Badge variant="outline" className="font-mono">{filteredThreats.length}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Total Attacks</span>
            <Badge variant="outline" className="font-mono">{statsFiltered.totalAttacks}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Active Critical</span>
            <Badge variant="destructive" className="font-mono">{statsFiltered.activeCritical}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Top Source</span>
            <span className="text-xs font-mono text-foreground">
              {statsFiltered.topSourceCountry || "--"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
