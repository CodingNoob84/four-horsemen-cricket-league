"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export const TimerFutureMatches = ({ dateTime }: { dateTime: string }) => {
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const matchTime = new Date(dateTime).getTime();
      const currentTime = new Date().getTime();
      const difference = matchTime - currentTime;

      if (difference <= 0) {
        setTimeRemaining("Match has started!");
        setIsExpired(true);
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining(
        `${days > 0 ? `${days}d ` : ""}${hours}h ${minutes}m ${seconds}s`
      );
    };

    updateCountdown(); // Initial call
    const timer = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(timer); // Cleanup on unmount
  }, [dateTime]);

  return (
    <Card className="overflow-hidden border-2 border-primary/20 rounded-xl mb-2 bg-gradient-to-br from-background to-muted/50 shadow-md">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className="flex justify-center items-center">
          <Badge
            variant="outline"
            className="px-3 py-1.5 bg-primary/5 border-primary/20 flex items-center gap-2"
          >
            <Clock className="h-4 w-4 text-primary animate-pulse" />
            <span className="font-mono text-lg font-semibold tracking-tight">
              {timeRemaining}
            </span>
          </Badge>
        </div>

        <div className="flex items-center justify-center gap-2 mt-1 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
            You can&apos;t add data for future matches
          </p>
        </div>

        <div className="flex justify-center items-center mt-1">
          <div className="relative w-full h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-primary/70 rounded-full"
              style={{
                width: isExpired ? "100%" : "0%",
                animation: !isExpired
                  ? "progress-animation linear forwards"
                  : "none",
                animationDuration: `${new Date(dateTime).getTime() - new Date().getTime()}ms`,
              }}
            />
          </div>
        </div>
      </CardContent>

      <style jsx global>{`
        @keyframes progress-animation {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </Card>
  );
};
