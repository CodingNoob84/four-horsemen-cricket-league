"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function AlertNotification() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 300000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="bg-red-50 border-red-200 text-red-800">
            <div className="flex items-start justify-between">
              <div>
                <AlertTitle className="text-red-800 font-bold">
                  How to Play
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  &quot;Please click on a match card under the Upcoming Matches
                  section. This will open a new page where you can select four
                  top-performing players, choose one as your captain, and pick
                  the team you believe will win. Your points will be calculated
                  based on the players&apos; performance and the match
                  result.&quot;
                </AlertDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-700 hover:bg-red-100 hover:text-red-800"
                onClick={() => setVisible(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </Alert>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
