"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { GAZE_MAP } from "@/data/gazeMap";
import { getHeroFrameSrc } from "@/lib/frames";

const TOTAL_FRAMES = 240;
const INITIAL_FRAME = 60; // Frame 60 looks straight/up at the user

export default function InteractiveFrameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetFrameRef = useRef<number>(INITIAL_FRAME);
  const currentFrameRef = useRef<number>(INITIAL_FRAME);
  const animationFrameIdRef = useRef<number | null>(null);
  const isInteractingRef = useRef<boolean>(false);
  const lastInteractionTimeRef = useRef<number>(0); // 0 ensures autonomous motion starts immediately
  const idleFrameProgressRef = useRef<number>(INITIAL_FRAME);
  const idleDirectionRef = useRef<number>(1);
  const pauseUntilRef = useRef<number>(0);
  const lastLoopTimeRef = useRef<number>(0);

  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Helper to format frame filename
  const getFrameSrc = (index: number) => getHeroFrameSrc(index);

  // Ultra-accurate 2D Gaze Solver: finds the exact frame matching cursor position
  const solveTargetFrame = useCallback((cursorX: number, cursorY: number, prevFrame: number): number => {
    let bestFrame = prevFrame;
    let minCost = Infinity;

    // Weight Y heavily (2.8x) so vertical head tilt (looking up vs looking down) is extremely precise
    const weightY = 2.8;
    const weightX = 1.3;

    for (let i = 0; i < GAZE_MAP.length; i++) {
      const item = GAZE_MAP[i];
      const dx = item.x - cursorX;
      const dy = item.y - cursorY;
      const distSq = dx * dx * weightX + dy * dy * weightY;

      // Subtle continuity cost to prefer natural neighboring head movements
      const frameDiff = Math.abs(item.f - prevFrame) / TOTAL_FRAMES;
      const continuityCost = frameDiff * 0.12;

      const totalCost = distSq + continuityCost;

      if (totalCost < minCost) {
        minCost = totalCost;
        bestFrame = item.f;
      }
    }

    return bestFrame;
  }, []);

  // Draw current frame on canvas with Retina scaling and seamless 16:9 fit
  const drawCurrentFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const img = imagesRef.current[frameIdx - 1];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear with pure deep black
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Calculate aspect ratio fit (1920x1080 source) with top clearance below the navbar
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const topClearance = (typeof window !== "undefined" && window.innerWidth >= 768 ? 90 : 75) * dpr;
    const availableHeight = Math.max(100, canvasHeight - topClearance);

    const imgAspect = 1920 / 1080;
    const availableAspect = canvasWidth / availableHeight;

    let drawWidth: number;
    let drawHeight: number;
    let drawX: number;
    let drawY: number;

    if (availableAspect > imgAspect) {
      // Screen is wider than 16:9: scale to fit available height below navbar
      drawHeight = availableHeight;
      drawWidth = drawHeight * imgAspect;
      drawX = (canvasWidth - drawWidth) / 2;
      drawY = topClearance;
    } else {
      // Screen is taller than 16:9 (mobile / portrait)
      drawWidth = canvasWidth;
      drawHeight = drawWidth / imgAspect;
      drawX = 0;
      drawY = topClearance + (availableHeight - drawHeight) / 2;
    }

    // Enable high-definition bicubic resampling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      img,
      Math.round(drawX),
      Math.round(drawY),
      Math.round(drawWidth),
      Math.round(drawHeight)
    );
  }, []);

  // Set up canvas dimensions with devicePixelRatio for ultra-sharp rendering
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

    const frameIdx = Math.min(
      TOTAL_FRAMES,
      Math.max(1, Math.round(currentFrameRef.current))
    );
    drawCurrentFrame(frameIdx);
  }, [drawCurrentFrame]);

  // Preload all 240 frames
  useEffect(() => {
    let loadedCount = 0;
    const images: HTMLImageElement[] = [];

    // Preload initial alert frame (Frame 60) first
    const initialFrame = new Image();
    initialFrame.src = getFrameSrc(INITIAL_FRAME);
    initialFrame.onload = () => {
      images[INITIAL_FRAME - 1] = initialFrame;
      drawCurrentFrame(INITIAL_FRAME);
    };

    // Load all frames
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFrameSrc(i);

      img.onload = () => {
        loadedCount++;
        images[i - 1] = img;
        const progress = Math.round((loadedCount / TOTAL_FRAMES) * 100);
        setLoadingProgress(progress);

        if (loadedCount === TOTAL_FRAMES) {
          setIsLoaded(true);
        }
      };

      img.onerror = () => {
        loadedCount++;
      };

      images.push(img);
    }

    imagesRef.current = images;
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [drawCurrentFrame, resizeCanvas]);

  // Main 60fps/120fps physics render loop with Autonomous Idle Motion & Cursor Lerping
  useEffect(() => {
    lastLoopTimeRef.current = performance.now();

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - lastLoopTimeRef.current) / 1000, 0.1);
      lastLoopTimeRef.current = now;

      const idleTime = now - lastInteractionTimeRef.current;

      // Autonomous mode active when user is not interacting OR has been idle for >1.4s
      const isAutonomous = !isInteractingRef.current || idleTime > 1400;

      if (isAutonomous) {
        // If we were just tracking pointer, synchronize idle counter to current frame
        if (isInteractingRef.current) {
          isInteractingRef.current = false;
          idleFrameProgressRef.current = currentFrameRef.current;
        }

        // Only progress if not in a brief turn-around pause
        if (now >= pauseUntilRef.current) {
          // Native 22fps cinematic playback speed
          const speed = 22;
          idleFrameProgressRef.current += idleDirectionRef.current * speed * dt;

          // Ping-pong at boundaries with natural observational hold
          if (idleFrameProgressRef.current >= TOTAL_FRAMES) {
            idleFrameProgressRef.current = TOTAL_FRAMES;
            idleDirectionRef.current = -1;
            pauseUntilRef.current = now + 650; // 0.65s hold
          } else if (idleFrameProgressRef.current <= 1) {
            idleFrameProgressRef.current = 1;
            idleDirectionRef.current = 1;
            pauseUntilRef.current = now + 650; // 0.65s hold
          }
        }

        targetFrameRef.current = idleFrameProgressRef.current;
      }

      // Responsive Lerp damping (0.12 when following cursor, 0.08 for buttery autonomous glide)
      const lerpSpeed = isAutonomous ? 0.08 : 0.12;
      currentFrameRef.current +=
        (targetFrameRef.current - currentFrameRef.current) * lerpSpeed;

      const frameToDraw = Math.min(
        TOTAL_FRAMES,
        Math.max(1, Math.round(currentFrameRef.current))
      );

      drawCurrentFrame(frameToDraw);

      animationFrameIdRef.current = requestAnimationFrame(animate);
    };

    animationFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [drawCurrentFrame]);

  // Global Pointer Listeners for Window, Document, and Touch Devices
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      isInteractingRef.current = true;
      lastInteractionTimeRef.current = performance.now();

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Normalized coordinates (0 to 1)
      const cursorX = Math.max(0, Math.min(1, e.clientX / width));
      const cursorY = Math.max(0, Math.min(1, e.clientY / height));

      // Solve for the exact frame whose head gaze matches this (X, Y)
      const target = solveTargetFrame(
        cursorX,
        cursorY,
        Math.round(currentFrameRef.current)
      );

      targetFrameRef.current = target;
    };

    const handlePointerLeave = () => {
      isInteractingRef.current = false;
      lastInteractionTimeRef.current = 0; // Immediately transition to autonomous motion
      idleFrameProgressRef.current = currentFrameRef.current;
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerMove, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);
    window.addEventListener("blur", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerMove);
      document.removeEventListener("mouseleave", handlePointerLeave);
      window.removeEventListener("blur", handlePointerLeave);
    };
  }, [solveTargetFrame]);

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-black cursor-crosshair select-none flex items-center justify-center"
    >
      {/* High-performance Render Canvas */}
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

      {/* Minimal sleek progress bar while loading in background */}
      {!isLoaded && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none transition-opacity duration-700">
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden backdrop-blur-md">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <span className="text-[11px] tracking-widest uppercase font-mono text-white/40">
            Loading Sequence {loadingProgress}%
          </span>
        </div>
      )}
    </div>
  );
}
