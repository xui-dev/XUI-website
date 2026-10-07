"use client";

import { useEffect, useState } from "react";

interface CyberPreloaderProps {
  progress: number; // 0 to 100
  isLoaded: boolean;
  totalFrames?: number;
  loadedFrames?: number;
}

export default function CyberPreloader({
  progress,
  isLoaded,
}: CyberPreloaderProps) {
  const [shouldRender, setShouldRender] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  // Format number: 2 digits (00 to 99), then 100 when fully complete
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));
  const displayValue = clamped < 100 ? String(clamped).padStart(2, "0") : "100";

  // Strict scroll lock while preloading
  useEffect(() => {
    if (!isLoaded) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isLoaded]);

  // Handle smooth cinematic transition once loaded
  useEffect(() => {
    if (isLoaded) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  return (
    <aside
      aria-label="Engine Preloader"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black select-none pointer-events-auto transition-all duration-700 ease-out ${
        isExiting
          ? "opacity-0 scale-[1.05] pointer-events-none blur-sm"
          : "opacity-100 scale-100"
      }`}
    >
      {/* ── Central Crisp Royal Blue 2-Digit Counter (No Blurs / No Auras) ── */}
      <div className="relative z-10 flex items-center justify-center">
        <div className="relative flex items-baseline">
          <span className="font-mono font-black text-8xl sm:text-9xl md:text-[150px] lg:text-[190px] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#3B82F6] via-[#2563EB] to-[#1D4ED8]">
            {displayValue}
          </span>

          {/* Crisp Royal Blue Percentage Symbol */}
          <span className="ml-1 sm:ml-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold text-[#2563EB]">
            %
          </span>
        </div>
      </div>
    </aside>
  );
}
