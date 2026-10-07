"use client";

import { motion, AnimatePresence } from "motion/react";
import MacCodeCard from "@/components/MacCodeCard";

interface LaserOverlayProps {
  laserProgress: number; // 0 to 1
  currentLaserFrame: number; // 1 to 96
  active: boolean;
  opacity?: number;
}

export default function LaserOverlay({
  active,
  opacity = 1,
}: LaserOverlayProps) {
  const isVisible = active && opacity > 0.01;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          dir="ltr"
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="absolute inset-0 z-20 pointer-events-none select-none flex items-end sm:items-start justify-center sm:justify-start px-3 sm:px-7 lg:px-10 pb-5 sm:pb-0 pt-0 sm:pt-32"
        >
          {/* ── Left-Flanked on desktop, Centered and Bottom on mobile ── */}
          <div className="w-full max-w-[1720px] mx-auto flex items-end sm:items-start justify-center sm:justify-start px-0 sm:px-6 pointer-events-none">
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: 38,
                filter: "blur(12px)",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                scale: 0.94,
                y: 22,
                filter: "blur(8px)",
              }}
              transition={{
                type: "spring",
                stiffness: 240,
                damping: 22,
                mass: 0.85,
              }}
              className="pointer-events-auto w-full flex justify-center sm:justify-start relative"
            >
              {/* Entrance Ambient Laser Flare Pulse */}
              <motion.div
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: [0, 0.75, 0.35], scale: [0.7, 1.15, 1] }}
                transition={{ duration: 0.85, ease: "easeOut" }}
                className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.3)_0%,rgba(37,99,235,0.15)_45%,transparent_75%)] blur-3xl -z-10"
              />

              <MacCodeCard />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
