"use client";
import { useState } from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { useThreatSimulation } from "@/hooks/useThreatSimulation";
import { useCriticalAlertSound } from "@/hooks/useCriticalAlertSound";
import { CyberMap } from "@/components/map/CyberMap";
import { StatHUD } from "@/components/dashboard/StatHUD";
import { ControlPanel } from "@/components/dashboard/ControlPanel";
import { ResponsiveLog } from "@/components/dashboard/ResponsiveLog";
import { DefconCard } from "@/components/dashboard/StatHUD";
import { ControlsCard, FiltersCard } from "@/components/dashboard/ControlPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Logo } from "@/components/branding/logo";
function MobileHeader({ onMenuClick }: {
    onMenuClick: () => void;
}) {
    return (<header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center">
        <Image src="/assets/logo-icon.svg" alt="CyberSentinel" width={32} height={32} className="h-8 w-auto" priority/>
      </div>
      <Button variant="ghost" size="icon" onClick={onMenuClick} className="focus-visible:ring-2 focus-visible:ring-ring" aria-label="Open settings menu">
        <Menu className="h-5 w-5"/>
      </Button>
    </header>);
}
export default function Home() {
    useThreatSimulation();
    useCriticalAlertSound();
    const [sheetOpen, setSheetOpen] = useState(false);
    return (<div className="relative h-screen w-screen overflow-hidden bg-background">
      
      <div className="lg:hidden">
        <MobileHeader onMenuClick={() => setSheetOpen(true)}/>
      </div>

      
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-[85vw] sm:max-w-sm overflow-y-auto pt-6">
          <SheetHeader className="pb-4">
            <SheetTitle>Settings</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 pb-6">
            <DefconCard disableTooltip={true}/>
            <Card className="border-border bg-card shadow-lg">
              <CardContent className="space-y-5 pt-6">
                <ControlsCard />
              </CardContent>
            </Card>
            <Card className="border-border bg-card shadow-lg">
              <CardContent className="space-y-5 pt-6">
                <FiltersCard />
              </CardContent>
            </Card>
          </div>
        </SheetContent>
      </Sheet>

      
      <div className="relative h-full w-full lg:grid lg:grid-cols-12 lg:grid-rows-12 lg:gap-4 lg:p-4">
        
        <div className="absolute inset-0 z-0 pt-14 lg:pt-0 lg:relative lg:col-span-9 lg:row-span-10 rounded-lg border border-border bg-card overflow-hidden">
          <CyberMap />
        </div>

        
        <div className="hidden lg:flex lg:col-span-3 lg:row-span-12 flex-col gap-4">
          <Logo />
          <StatHUD />
          <ControlPanel />
        </div>

        
        <div className="hidden lg:block lg:col-span-9 lg:row-span-2">
          <ResponsiveLog />
        </div>
      </div>

      
      <div className="lg:hidden">
        <ResponsiveLog />
      </div>
    </div>);
}
