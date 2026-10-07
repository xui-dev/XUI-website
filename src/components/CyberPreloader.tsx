"use client";

import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

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
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [deviceMode, setDeviceMode] = useState<"phone" | "desktop">("phone");

  // Format number: 2 digits (00 to 99), then 100 when fully complete
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const displayValue =
    clampedProgress < 100 ? String(clampedProgress).padStart(2, "0") : "100";

  // Check if client is using a mobile screen
  useEffect(() => {
    const checkMobile = () => {
      const isMobile =
        window.innerWidth < 768 ||
        /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobileDevice(isMobile);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Morph from Phone to Desktop early (at 15% progress or after 600ms)
  // This guarantees the visitor actually sees the transformation and watches the desktop screen
  useEffect(() => {
    if (clampedProgress >= 15) {
      setDeviceMode("desktop");
    }
  }, [clampedProgress]);

  useEffect(() => {
    // Also trigger morph after 600ms so it happens smoothly even on slow networks
    const morphTimer = setTimeout(() => {
      setDeviceMode("desktop");
    }, 600);
    return () => clearTimeout(morphTimer);
  }, []);

  // Handle cinematic exit once loaded:
  // Hold for 1.4s so the user comfortably sees the full 100% desktop workstation
  useEffect(() => {
    if (isLoaded) {
      setDeviceMode("desktop");
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setShouldRender(false);
        }, 700);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [isLoaded]);

  if (!shouldRender) return null;

  const isDesktop = deviceMode === "desktop";

  return (
    <aside
      aria-label="Engine Preloader"
      role="status"
      aria-live="polite"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black select-none pointer-events-auto transition-all duration-700 ease-out px-4 ${
        isExiting
          ? "opacity-0 scale-[1.04] pointer-events-none blur-sm"
          : "opacity-100 scale-100"
      }`}
    >
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-xl">
        {/* ── The Transforming Device (Phone ➔ Desktop Monitor) ── */}
        <div className="relative flex flex-col items-center justify-end min-h-[160px] sm:min-h-[180px] mb-2">
          <div
            className={`relative flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
              isDesktop ? "scale-100" : "scale-[0.95]"
            }`}
          >
            {/* Outer Chassis */}
            <div
              className={`relative overflow-hidden bg-gradient-to-b from-[#111827] via-[#0b0f19] to-[#05070d] border border-blue-500/30 transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isDesktop
                  ? "w-[240px] sm:w-[290px] h-[135px] sm:h-[165px] rounded-xl"
                  : "w-[76px] sm:w-[84px] h-[138px] sm:h-[152px] rounded-[22px]"
              }`}
            >

              {/* Pure Clean Screen Display (Zero Content Inside) */}
              <div
                className={`absolute inset-[4px] bg-[#020306] overflow-hidden transition-all duration-700 ${
                  isDesktop ? "rounded-lg" : "rounded-[18px]"
                }`}
              >
                {/* Diagonal Glass Specular Sheen */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Monitor Stand (Smoothly deploys in Desktop Mode) */}
            <div
              className={`flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                isDesktop
                  ? "opacity-100 translate-y-0 h-7"
                  : "opacity-0 -translate-y-3 h-0 pointer-events-none"
              }`}
            >
              {/* Stand Neck */}
              <div className="w-5 sm:w-6 h-5 bg-gradient-to-b from-[#141b2d] to-[#0a0f1d] border-x border-white/10" />
              {/* Stand Base */}
              <div className="w-20 sm:w-24 h-2 rounded-t-sm bg-gradient-to-r from-[#141b2d] via-[#1f293d] to-[#141b2d] border-t border-x border-white/15" />
            </div>
          </div>
        </div>

        {/* ── Central Crisp Royal Blue 2-Digit Counter (00 to 100) - No Auras / No Glitch Box ── */}
        <div className="relative flex items-baseline justify-center select-none my-1">
          <span
            className="font-mono font-black text-7xl sm:text-8xl md:text-9xl leading-none tracking-tighter"
            style={{
              background: "linear-gradient(180deg, #3B82F6 0%, #2563EB 50%, #1D4ED8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            {displayValue}
          </span>
          <span className="ml-1 sm:ml-2 text-2xl sm:text-3xl md:text-4xl font-mono font-bold text-[#2563EB]">
            %
          </span>
        </div>

        {/* ── Minimal Laser Progress Bar ── */}
        <div className="w-56 sm:w-72 h-[3px] bg-white/10 rounded-full overflow-hidden mt-3 relative">
          <div
            className="h-full bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#2563EB] rounded-full transition-all duration-150 ease-out"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* ── English Notice: Desktop Recommendation ── */}
        <div className="flex flex-col items-center text-center mt-6 px-4">
          <h2 className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/80 font-mono">
            Optimized for Desktop Workstations
          </h2>
          <p className="text-[11px] sm:text-xs text-white/40 mt-1 max-w-sm leading-relaxed">
            Engineered for high-refresh desktop monitors and interactive mouse input.
          </p>

          {/* If on mobile, give clear polite advice and optional continue */}
          {isMobileDevice && (
            <div className="mt-4 flex flex-col items-center">
              <span className="text-[10px] text-amber-300/80 font-mono">
                Mobile detected • For optimal fluidity, open on PC or Mac
              </span>
              {isLoaded && (
                <button
                  type="button"
                  onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => setShouldRender(false), 500);
                  }}
                  className="mt-2.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] text-white/90 transition-all active:scale-95 flex items-center gap-1 font-mono"
                >
                  <span>Continue on mobile</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
