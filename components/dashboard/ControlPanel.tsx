"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import { useThreatStore } from "@/stores/useThreatStore";
import type { Severity, AttackType, TimeRange } from "@/lib/types/threats";

export function ControlPanel() {
  const isLive = useThreatStore((state) => state.isLive);
  const toggleSimulation = useThreatStore((state) => state.toggleSimulation);
  const filters = useThreatStore((state) => state.filters);
  const setFilters = useThreatStore((state) => state.setFilters);

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
            <Badge
              variant={filters.severity.low ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSeverity("low")}
            >
              Low
            </Badge>
            <Badge
              variant={filters.severity.medium ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSeverity("medium")}
            >
              Medium
            </Badge>
            <Badge
              variant={filters.severity.critical ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleSeverity("critical")}
            >
              Critical
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Attack Types</p>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.attackType.DDoS ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleAttackType("DDoS")}
            >
              DDoS
            </Badge>
            <Badge
              variant={filters.attackType.Phishing ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleAttackType("Phishing")}
            >
              Phishing
            </Badge>
            <Badge
              variant={filters.attackType.Malware ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleAttackType("Malware")}
            >
              Malware
            </Badge>
            <Badge
              variant={filters.attackType.BruteForce ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => toggleAttackType("BruteForce")}
            >
              BruteForce
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Time Range</p>
          <div className="flex flex-wrap gap-2">
            {(["1min", "5min", "1hr", "all"] as TimeRange[]).map((range) => (
              <Badge
                key={range}
                variant={filters.timeRange === range ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => setTimeRange(range)}
              >
                {range === "all" ? "All" : `Last ${range}`}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
