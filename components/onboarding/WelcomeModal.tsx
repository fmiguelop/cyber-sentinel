"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ONBOARDING_STORAGE_KEY = "hasSeenOnboarding";
const DESKTOP_BREAKPOINT = 1024;

interface WelcomeModalProps {
  onStartTour: () => void;
}

export function WelcomeModal({ onStartTour }: WelcomeModalProps) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    try {
      const hasSeenOnboarding = localStorage.getItem(ONBOARDING_STORAGE_KEY);
      if (hasSeenOnboarding === null) {
        setOpen(true);
      }
    } catch (error) {
      console.warn("Failed to check onboarding status:", error);
    }
  }, []);

  const handleClose = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch (error) {
      console.warn("Failed to save onboarding status:", error);
    }
    setOpen(false);
  };

  const handleStartTour = () => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    } catch (error) {
      console.warn("Failed to save onboarding status:", error);
    }
    setOpen(false);
    setTimeout(() => {
      onStartTour();
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Welcome to CyberSentinel</DialogTitle>
          {isDesktop ? (
            <DialogDescription>
              This is a real-time threat intelligence dashboard visualizing
              simulated cyber attacks globally.
            </DialogDescription>
          ) : (
            <div className="text-sm text-muted-foreground space-y-4">
              <p>
                This is a real-time threat intelligence dashboard visualizing
                simulated cyber attacks globally.
              </p>
              <div className="space-y-3 text-left">
                <div>
                  <p className="font-semibold mb-1">Global Threat Status</p>
                  <p className="text-xs text-muted-foreground">
                    Monitor threat levels and metrics in the left panel. Tap
                    the menu icon to access controls.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Simulation Controls</p>
                  <p className="text-xs text-muted-foreground">
                    Control simulation speed, pause, reset, and filter threats
                    by type or severity.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Interactive Map</p>
                  <p className="text-xs text-muted-foreground">
                    View threat visualizations on the map. Tap attack lines or
                    city nodes for details.
                  </p>
                </div>
                <div>
                  <p className="font-semibold mb-1">Event Log</p>
                  <p className="text-xs text-muted-foreground">
                    Real-time feed of detected events at the bottom. Export logs
                    to JSON/CSV.
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isDesktop ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Skip
              </Button>
              <Button onClick={handleStartTour}>Start System Tour</Button>
            </>
          ) : (
            <Button onClick={handleClose} className="w-full">
              Got it
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
