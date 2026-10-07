"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GAZE_MAP } from "@/data/gazeMap";
import HeroSection from "@/components/HeroSection";
import LaserOverlay from "@/components/LaserOverlay";
import ParticleShowcaseSection from "@/components/landing/ParticleShowcaseSection";
import CyberPreloader from "@/components/CyberPreloader";
import {
  getHeroFrameSrc,
  getLaserFrameSrc,
  getFlightFrameSrc,
} from "@/lib/frames";

const TOTAL_HERO_FRAMES = 240;
const TOTAL_LASER_FRAMES = 96;
const TOTAL_FLIGHT_FRAMES = 96;
const INITIAL_FRAME = 60; // Looking at user
const LOOK_DOWN_FRAME = 240; // Gaze locked straight down

type ExperienceMode = "hero" | "laser" | "flight" | "particles";

export default function RobotExperience() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Preloaded image caches (chunked & deferred to prevent mobile memory exhaustion)
  const heroImagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const laserImagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const flightImagesRef = useRef<(HTMLImageElement | undefined)[]>([]);
  const lastDrawnImageRef = useRef<HTMLImageElement | null>(null);
  const laserLoadingStartedRef = useRef(false);
  const flightLoadingStartedRef = useRef(false);
  const startLoadingLaserRef = useRef<() => void>(() => {});
  const startLoadingFlightRef = useRef<() => void>(() => {});

  // Hero gaze states
  const targetHeroFrameRef = useRef<number>(INITIAL_FRAME);
  const currentHeroFrameRef = useRef<number>(INITIAL_FRAME);
  const isInteractingRef = useRef<boolean>(false);
  const lastInteractionTimeRef = useRef<number>(0);
  const idleFrameProgressRef = useRef<number>(INITIAL_FRAME);
  const idleDirectionRef = useRef<number>(1);
  const pauseUntilRef = useRef<number>(0);
  const lastLoopTimeRef = useRef<number>(0);

  // Scroll & Phase states
  const scrollProgressRef = useRef<number>(0);
  const targetLaserFrameRef = useRef<number>(1);
  const currentLaserFrameRef = useRef<number>(1);
  const targetFlightFrameRef = useRef<number>(1);
  const currentFlightFrameRef = useRef<number>(1);
  const modeRef = useRef<ExperienceMode>("hero");

  // React state for overlay rendering
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [currentLaserFrame, setCurrentLaserFrame] = useState<number>(1);
  const [isLaserActive, setIsLaserActive] = useState<boolean>(false);
  const [laserOpacity, setLaserOpacity] = useState<number>(1);
  const [isParticlesActive, setIsParticlesActive] = useState<boolean>(false);
  const [particlesOpacity, setParticlesOpacity] = useState<number>(0);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [loadedHeroCount, setLoadedHeroCount] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Animation frame loop id
  const animationFrameIdRef = useRef<number | null>(null);

  // Fallback finder: locates closest available loaded frame to prevent any black flicker
  const getNearestFrame = useCallback(
    (
      array: (HTMLImageElement | undefined)[],
      targetIdx: number,
      total: number
    ): HTMLImageElement | undefined => {
      const direct = array[targetIdx - 1];
      if (direct && direct.complete && direct.naturalWidth > 0) {
        return direct;
      }
      for (let r = 1; r < total; r++) {
        const left = targetIdx - 1 - r;
        if (left >= 0 && array[left]?.complete && array[left]?.naturalWidth) {
          return array[left];
        }
        const right = targetIdx - 1 + r;
        if (right < total && array[right]?.complete && array[right]?.naturalWidth) {
          return array[right];
        }
      }
      return lastDrawnImageRef.current ?? undefined;
    },
    []
  );

  // 2D Gaze Solver
  const solveTargetFrame = useCallback(
    (cursorX: number, cursorY: number, prevFrame: number): number => {
      let bestFrame = prevFrame;
      let minCost = Infinity;

      const weightY = 2.8;
      const weightX = 1.3;

      for (let i = 0; i < GAZE_MAP.length; i++) {
        const item = GAZE_MAP[i];
        const dx = item.x - cursorX;
        const dy = item.y - cursorY;
        const distSq = dx * dx * weightX + dy * dy * weightY;
        const frameDiff = Math.abs(item.f - prevFrame) / TOTAL_HERO_FRAMES;
        const continuityCost = frameDiff * 0.12;
        const totalCost = distSq + continuityCost;

        if (totalCost < minCost) {
          minCost = totalCost;
          bestFrame = item.f;
        }
      }

      return bestFrame;
    },
    []
  );

  // Universal Canvas Drawer with fallback to last rendered frame to eliminate black flicker
  const drawImageOnCanvas = useCallback((img: HTMLImageElement | undefined) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let targetImg =
      img && img.complete && img.naturalWidth > 0
        ? img
        : lastDrawnImageRef.current ?? undefined;
    if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) return;

    lastDrawnImageRef.current = targetImg;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Pure pitch black backdrop
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const topClearance =
      (typeof window !== "undefined" && window.innerWidth >= 768 ? 90 : 75) *
      dpr;
    const availableHeight = Math.max(100, canvasHeight - topClearance);

    const imgAspect = 1920 / 1080;
    const availableAspect = canvasWidth / availableHeight;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    const isPortrait = availableAspect < 1.05;

    if (availableAspect > imgAspect) {
      drawHeight = availableHeight;
      drawWidth = drawHeight * imgAspect;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = topClearance;
    } else if (isPortrait) {
      // Smart Portrait Focal Framing for Mobile:
      // The robot in the 1920x1080 video is located on the right (center X = 76.2% of frame).
      // On mobile screens, focus specifically on the robot's center and frame him majestically in the upper portion!
      drawHeight = Math.max(availableHeight * 0.65, canvasWidth * 1.15);
      drawWidth = drawHeight * imgAspect;
      const eyeRatioX = 0.762;
      drawX = canvasWidth * 0.52 - drawWidth * eyeRatioX;
      drawY = topClearance - 0.04 * drawHeight;
    } else {
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      drawX = 0;
      drawY = topClearance + (availableHeight - drawHeight) / 2;
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      targetImg,
      Math.round(drawX),
      Math.round(drawY),
      Math.round(drawWidth),
      Math.round(drawHeight)
    );
  }, []);

  // Resize canvas dimensions to match viewport with retina DPR
  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Redraw current state based on active mode
    const mode = modeRef.current;
    if (mode === "hero") {
      const idx = Math.min(
        TOTAL_HERO_FRAMES,
        Math.max(1, Math.round(currentHeroFrameRef.current))
      );
      drawImageOnCanvas(
        getNearestFrame(heroImagesRef.current, idx, TOTAL_HERO_FRAMES)
      );
    } else if (mode === "laser") {
      const idx = Math.min(
        TOTAL_LASER_FRAMES,
        Math.max(1, Math.round(currentLaserFrameRef.current))
      );
      drawImageOnCanvas(
        getNearestFrame(laserImagesRef.current, idx, TOTAL_LASER_FRAMES)
      );
    } else if (mode === "flight") {
      const idx = Math.min(
        TOTAL_FLIGHT_FRAMES,
        Math.max(1, Math.round(currentFlightFrameRef.current))
      );
      drawImageOnCanvas(
        getNearestFrame(flightImagesRef.current, idx, TOTAL_FLIGHT_FRAMES)
      );
    } else {
      // Particles mode: draw clean void
      const ctx = canvas.getContext("2d", { alpha: false });
      if (ctx) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, [drawImageOnCanvas, getNearestFrame]);

  // Progressive, staged loading with concurrency limits to prevent mobile memory exhaustion & connection pool starvation
  useEffect(() => {
    let isCancelled = false;
    let idleLaserTimeout: ReturnType<typeof setTimeout> | null = null;
    let idleFlightTimeout: ReturnType<typeof setTimeout> | null = null;

    // Helper: load frame URLs with a bounded concurrency pool (8 parallel requests) and off-thread decoding
    const loadBatch = (
      urls: string[],
      targetArray: (HTMLImageElement | undefined)[],
      concurrency: number,
      onProgress?: (loaded: number) => void,
      onComplete?: () => void
    ) => {
      let active = 0;
      let nextIdx = 0;
      let loaded = 0;

      const pump = () => {
        if (isCancelled) return;
        while (active < concurrency && nextIdx < urls.length) {
          const i = nextIdx++;
          active++;
          const img = new Image();
          img.src = urls[i];
          const done = () => {
            active--;
            loaded++;
            targetArray[i] = img;
            onProgress?.(loaded);
            if (loaded === urls.length) {
              onComplete?.();
            } else {
              pump();
            }
          };

          img.onload = () => {
            if ("decode" in img) {
              img.decode().catch(() => {}).finally(done);
            } else {
              done();
            }
          };
          img.onerror = done;
        }
      };
      pump();
    };

    // 1. Initial critical frame (Frame 60) for instantaneous first paint
    const initialFrame = new Image();
    initialFrame.src = getHeroFrameSrc(INITIAL_FRAME);
    initialFrame.onload = () => {
      if (isCancelled) return;
      heroImagesRef.current[INITIAL_FRAME - 1] = initialFrame;
      drawImageOnCanvas(initialFrame);
    };

    // 2. Define Laser & Flight loader functions
    startLoadingLaserRef.current = () => {
      if (laserLoadingStartedRef.current || isCancelled) return;
      laserLoadingStartedRef.current = true;
      if (idleLaserTimeout) clearTimeout(idleLaserTimeout);

      const laserUrls: string[] = [];
      for (let j = 1; j <= TOTAL_LASER_FRAMES; j++) {
        laserUrls.push(getLaserFrameSrc(j));
      }
      loadBatch(laserUrls, laserImagesRef.current, 8, undefined, () => {
        // Laser completed: schedule idle flight loading
        if (!flightLoadingStartedRef.current && !isCancelled) {
          if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            (window as any).requestIdleCallback(() => {
              startLoadingFlightRef.current();
            });
          } else {
            idleFlightTimeout = setTimeout(() => {
              startLoadingFlightRef.current();
            }, 1000);
          }
        }
      });
    };

    startLoadingFlightRef.current = () => {
      if (flightLoadingStartedRef.current || isCancelled) return;
      flightLoadingStartedRef.current = true;
      if (idleFlightTimeout) clearTimeout(idleFlightTimeout);

      const flightUrls: string[] = [];
      for (let k = 1; k <= TOTAL_FLIGHT_FRAMES; k++) {
        flightUrls.push(getFlightFrameSrc(k));
      }
      loadBatch(flightUrls, flightImagesRef.current, 8);
    };

    // 3. Hero frames: load all 240 frames driving the big blue counter
    const heroUrls: string[] = [];
    for (let i = 1; i <= TOTAL_HERO_FRAMES; i++) {
      heroUrls.push(getHeroFrameSrc(i));
    }

    loadBatch(
      heroUrls,
      heroImagesRef.current,
      8,
      (loaded) => {
        setLoadedHeroCount(loaded);
        const pct = Math.round((loaded / TOTAL_HERO_FRAMES) * 100);
        setLoadingProgress(pct);
        if (loaded >= TOTAL_HERO_FRAMES) {
          setIsLoaded(true);
        }
      },
      () => {
        setIsLoaded(true);
        // Pre-warm laser frames in background via idle callback
        if (!laserLoadingStartedRef.current && !isCancelled) {
          if (typeof window !== "undefined" && "requestIdleCallback" in window) {
            (window as any).requestIdleCallback(() => {
              startLoadingLaserRef.current();
            });
          } else {
            idleLaserTimeout = setTimeout(() => {
              startLoadingLaserRef.current();
            }, 800);
          }
        }
      }
    );

    // Safety fallback: ensure UI unlocks after 12s if majority of frames are ready
    const safetyTimer = setTimeout(() => {
      if (!isCancelled) {
        setIsLoaded(true);
      }
    }, 12000);

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      isCancelled = true;
      if (idleLaserTimeout) clearTimeout(idleLaserTimeout);
      if (idleFlightTimeout) clearTimeout(idleFlightTimeout);
      clearTimeout(safetyTimer);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [drawImageOnCanvas, resizeCanvas]);

  // Scroll listener for sticky 4-stage cinematic sequence
  useEffect(() => {
    const handleScroll = () => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;

      if (totalScrollable <= 0) return;

      const raw = -rect.top / totalScrollable;
      const progress = Math.max(0, Math.min(1, raw));
      scrollProgressRef.current = progress;

      // Trigger lazy pre-loading as user approaches respective stages
      if (progress > 0.01 && !laserLoadingStartedRef.current) {
        startLoadingLaserRef.current();
      }
      if (progress > 0.20 && !flightLoadingStartedRef.current) {
        startLoadingFlightRef.current();
      }

      // ── Stage 1: Hero Gaze (0.00 -> 0.12) ──
      if (progress < 0.12) {
        modeRef.current = "hero";
        setIsLaserActive(false);
        setIsParticlesActive(false);

        // Tilt head down as scroll starts
        if (progress > 0.03) {
          const blend = (progress - 0.03) / 0.09;
          const currentTarget = targetHeroFrameRef.current;
          targetHeroFrameRef.current = Math.round(
            currentTarget * (1 - blend) + LOOK_DOWN_FRAME * blend
          );
        }
      }
      // ── Stage 2: Laser Blast & MacCodeCard (0.12 -> 0.44) ──
      else if (progress >= 0.12 && progress < 0.44) {
        modeRef.current = "laser";
        setIsLaserActive(true);
        setIsParticlesActive(false);

        const laserProgress = (progress - 0.12) / 0.32;
        const targetFrame = Math.min(
          TOTAL_LASER_FRAMES,
          Math.max(1, Math.round(laserProgress * (TOTAL_LASER_FRAMES - 1)) + 1)
        );
        targetLaserFrameRef.current = targetFrame;
        setLaserOpacity(1);
      }
      // ── Stage 3: Laser Shutdown & Robot Flight (0.44 -> 0.72) ──
      else if (progress >= 0.44 && progress < 0.72) {
        modeRef.current = "flight";
        setIsParticlesActive(false);

        // Dissolve MacCodeCard as robot powers down
        const fadeProgress = (progress - 0.44) / 0.06;
        const opacity = Math.max(0, 1 - fadeProgress);
        setLaserOpacity(opacity);
        setIsLaserActive(opacity > 0.02);

        // Scrub flight frames (1 -> 96)
        const flightProgress = (progress - 0.44) / 0.28;
        const targetFrame = Math.min(
          TOTAL_FLIGHT_FRAMES,
          Math.max(
            1,
            Math.round(flightProgress * (TOTAL_FLIGHT_FRAMES - 1)) + 1
          )
        );
        targetFlightFrameRef.current = targetFrame;
      }
      // ── Stage 4: Stardust ParticleText Genesis (0.72 -> 1.00) ──
      else {
        modeRef.current = "particles";
        setIsLaserActive(false);
        setIsParticlesActive(true);

        const particleProgress = (progress - 0.72) / 0.12;
        const opacity = Math.min(1, Math.max(0, particleProgress));
        setParticlesOpacity(opacity);
      }

      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Main 60fps/120fps physics render loop
  useEffect(() => {
    lastLoopTimeRef.current = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastLoopTimeRef.current) / 1000, 0.1);
      lastLoopTimeRef.current = now;

      const mode = modeRef.current;

      // 1. Hero Mode
      if (mode === "hero") {
        const idleTime = now - lastInteractionTimeRef.current;
        const isAutonomous =
          (!isInteractingRef.current || idleTime > 1400) &&
          scrollProgressRef.current < 0.03;

        if (isAutonomous) {
          if (isInteractingRef.current) {
            isInteractingRef.current = false;
            idleFrameProgressRef.current = currentHeroFrameRef.current;
          }

          if (now >= pauseUntilRef.current) {
            const speed = 22;
            idleFrameProgressRef.current +=
              idleDirectionRef.current * speed * dt;

            if (idleFrameProgressRef.current >= TOTAL_HERO_FRAMES) {
              idleFrameProgressRef.current = TOTAL_HERO_FRAMES;
              idleDirectionRef.current = -1;
              pauseUntilRef.current = now + 650;
            } else if (idleFrameProgressRef.current <= 1) {
              idleFrameProgressRef.current = 1;
              idleDirectionRef.current = 1;
              pauseUntilRef.current = now + 650;
            }
          }

          targetHeroFrameRef.current = idleFrameProgressRef.current;
        }

        const lerpSpeed = isAutonomous ? 0.08 : 0.14;
        currentHeroFrameRef.current +=
          (targetHeroFrameRef.current - currentHeroFrameRef.current) * lerpSpeed;

        const frameToDraw = Math.min(
          TOTAL_HERO_FRAMES,
          Math.max(1, Math.round(currentHeroFrameRef.current))
        );

        const img = getNearestFrame(
          heroImagesRef.current,
          frameToDraw,
          TOTAL_HERO_FRAMES
        );
        if (img) drawImageOnCanvas(img);
      }
      // 2. Laser Mode
      else if (mode === "laser") {
        const lerpSpeed = 0.18;
        currentLaserFrameRef.current +=
          (targetLaserFrameRef.current - currentLaserFrameRef.current) *
          lerpSpeed;

        const frameToDraw = Math.min(
          TOTAL_LASER_FRAMES,
          Math.max(1, Math.round(currentLaserFrameRef.current))
        );

        setCurrentLaserFrame(frameToDraw);

        const img = getNearestFrame(
          laserImagesRef.current,
          frameToDraw,
          TOTAL_LASER_FRAMES
        );
        if (img) drawImageOnCanvas(img);
      }
      // 3. Flight Mode (Robot flight & shutdown)
      else if (mode === "flight") {
        const lerpSpeed = 0.2;
        currentFlightFrameRef.current +=
          (targetFlightFrameRef.current - currentFlightFrameRef.current) *
          lerpSpeed;

        const frameToDraw = Math.min(
          TOTAL_FLIGHT_FRAMES,
          Math.max(1, Math.round(currentFlightFrameRef.current))
        );

        const img = getNearestFrame(
          flightImagesRef.current,
          frameToDraw,
          TOTAL_FLIGHT_FRAMES
        );
        if (img) drawImageOnCanvas(img);
      }
      // 4. Particles Mode (Robot is gone)
      else {
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext("2d", { alpha: false });
          if (ctx) {
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [drawImageOnCanvas]);

  // Pointer listener for Gaze Tracking in Hero Mode
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (modeRef.current !== "hero" || scrollProgressRef.current > 0.08) return;

      isInteractingRef.current = true;
      lastInteractionTimeRef.current = performance.now();

      const width = window.innerWidth;
      const height = window.innerHeight;

      const cursorX = Math.max(0, Math.min(1, e.clientX / width));
      const cursorY = Math.max(0, Math.min(1, e.clientY / height));

      const target = solveTargetFrame(
        cursorX,
        cursorY,
        Math.round(currentHeroFrameRef.current)
      );

      targetHeroFrameRef.current = target;
    };

    const handlePointerLeave = () => {
      isInteractingRef.current = false;
      lastInteractionTimeRef.current = 0;
      idleFrameProgressRef.current = currentHeroFrameRef.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (modeRef.current !== "hero" || scrollProgressRef.current > 0.08) return;
      if (!e.touches || e.touches.length === 0) return;

      const touch = e.touches[0];
      isInteractingRef.current = true;
      lastInteractionTimeRef.current = performance.now();

      const width = window.innerWidth;
      const height = window.innerHeight;

      const cursorX = Math.max(0, Math.min(1, touch.clientX / width));
      const cursorY = Math.max(0, Math.min(1, touch.clientY / height));

      const target = solveTargetFrame(
        cursorX,
        cursorY,
        Math.round(currentHeroFrameRef.current)
      );

      targetHeroFrameRef.current = target;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchstart", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handlePointerLeave, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchstart", handleTouchMove);
      window.removeEventListener("touchend", handlePointerLeave);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, [solveTargetFrame]);

  // Derived overlay animations
  const heroOpacity = Math.max(0, 1 - scrollProgress / 0.1);
  const heroTranslateY = -(scrollProgress * 220);

  const laserProgress =
    scrollProgress >= 0.12 && scrollProgress < 0.44
      ? (scrollProgress - 0.12) / 0.32
      : scrollProgress >= 0.44
      ? 1
      : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[480vh] bg-black select-none"
    >
      {/* ── Sticky Viewport ── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        {/* High-Performance Canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full block"
          style={{
            imageRendering: "auto",
            filter: "contrast(1.03) brightness(1.01)",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        />

        {/* 1. Act I: Hero Section Overlay (dissolves on scroll) */}
        <HeroSection
          style={{
            opacity: heroOpacity,
            transform: `translateY(${heroTranslateY}px)`,
            pointerEvents: heroOpacity < 0.1 ? "none" : "auto",
          }}
        />

        {/* 2. Act II & III: Laser Sequence & MacCodeCard Overlay */}
        <LaserOverlay
          laserProgress={laserProgress}
          currentLaserFrame={currentLaserFrame}
          active={isLaserActive}
          opacity={laserOpacity}
        />

        {/* 3. Act IV: Particle Text Genesis Section (appears after robot flight) */}
        <ParticleShowcaseSection
          active={isParticlesActive}
          opacity={particlesOpacity}
        />

        {/* Full-screen Cyber Preloader with Giant 2-Digit Blue Counter (00 to 100) */}
        <CyberPreloader
          progress={loadingProgress}
          isLoaded={isLoaded}
          totalFrames={TOTAL_HERO_FRAMES}
          loadedFrames={loadedHeroCount}
        />
      </div>
    </div>
  );
}
