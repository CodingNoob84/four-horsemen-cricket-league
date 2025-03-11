"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export function AlertNotification() {
  const [visible, setVisible] = useState(true);

  // Show alert every 5 minutes (300000 ms)
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setVisible(true);
      }, 300000); // 5 minutes

      return () => clearTimeout(timer);
    }
  }, [visible]);

  // For demo purposes, show alert every 30 seconds instead of 5 minutes
  // Comment out the above useEffect and uncomment this one for testing
  /*
  useEffect(() => {
    if (!visible) {
      const timer = setTimeout(() => {
        setVisible(true)
        setCounter(prev => prev + 1)
      }, 30000) // 30 seconds for testing
      
      return () => clearTimeout(timer)
    }
  }, [visible])
  */

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
                  IPL 2025 Starts March 22!
                </AlertTitle>
                <AlertDescription className="text-red-700">
                  We&apos;ve added a few dummy matches for you to play with
                  until the real tournament begins. Please report any bugs or
                  improvements you&apos;d like to see!
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
