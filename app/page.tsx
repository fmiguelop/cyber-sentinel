import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background">
      {/* Dashboard Grid Layout */}
      <div className="grid h-full w-full grid-cols-12 grid-rows-12 gap-4 p-4">
        {/* Main Map Area - Takes up ~80% (rows 1-10, cols 1-9) */}
        <div className="col-span-9 row-span-10 rounded-lg border border-border bg-card p-4">
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">CyberSentinel</h2>
              <p className="mt-2 text-muted-foreground">Real-Time Threat Intelligence Dashboard</p>
              <p className="mt-4 text-sm text-muted-foreground">Map visualization will appear here</p>
            </div>
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
                <Badge variant="outline" className="font-mono">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active Critical</span>
                <Badge variant="destructive" className="font-mono">0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Top Source</span>
                <span className="text-xs font-mono text-foreground">--</span>
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
              <Button className="w-full" variant="default">
                Start Simulation
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
                <div className="text-muted-foreground">
                  [SYSTEM] CyberSentinel initialized. Waiting for threat events...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
