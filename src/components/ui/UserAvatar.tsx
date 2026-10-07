"use client";

import React, { useMemo } from "react";
import Image from "next/image";

export interface CyberPalette {
  name: string;
  fg: string;
  bg: string;
  ring: string;
}

export interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
  shape?: "circle" | "rounded";
  paletteIndex?: number | null;
}

// Deterministic string hasher (djb2-like)
function hashString(str: string): number {
  let hash = 5381;
  const s = str.trim().toLowerCase();
  for (let i = 0; i < s.length; i++) {
    hash = (hash << 5) + hash + s.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Simple LCG Pseudo-random generator for consistent geometric distribution
function createRng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// 16 XUI Neo-Cyber Color Palettes
export const PALETTES: CyberPalette[] = [
  { name: "Cyan Laser", fg: "#00E5FF", bg: "#041824", ring: "#00E5FF45" },
  { name: "Electric Blue", fg: "#3B82F6", bg: "#071738", ring: "#3B82F645" },
  { name: "Hyper Violet", fg: "#8B5CF6", bg: "#1a0d36", ring: "#8B5CF645" },
  { name: "Neon Magenta", fg: "#EC4899", bg: "#2d071c", ring: "#EC489945" },
  { name: "Matrix Emerald", fg: "#10B981", bg: "#042116", ring: "#10B98145" },
  { name: "Plasma Amber", fg: "#F59E0B", bg: "#2b1803", ring: "#F59E0B45" },
  { name: "Indigo Deep", fg: "#6366F1", bg: "#101233", ring: "#6366F145" },
  { name: "Quantum Teal", fg: "#14B8A6", bg: "#05211e", ring: "#14B8A645" },
  { name: "Ruby Core", fg: "#F43F5E", bg: "#2e0611", ring: "#F43F5E45" },
  { name: "Azure Flux", fg: "#06B6D4", bg: "#041b24", ring: "#06B6D445" },
  { name: "Royal Orchid", fg: "#A855F7", bg: "#200933", ring: "#A855F745" },
  { name: "Acid Lime", fg: "#84CC16", bg: "#152404", ring: "#84CC1645" },
  { name: "Crimson", fg: "#E11D48", bg: "#2a050f", ring: "#E11D4845" },
  { name: "Ultramarine", fg: "#4F46E5", bg: "#0c0e30", ring: "#4F46E545" },
  { name: "Jade", fg: "#059669", bg: "#031c13", ring: "#05966945" },
  { name: "Solar Flare", fg: "#D97706", bg: "#291502", ring: "#D9770645" },
];

export default function UserAvatar({
  name = "User",
  avatarUrl,
  size = 28,
  className = "",
  shape = "circle",
  paletteIndex,
}: UserAvatarProps) {
  // Generate GitHub-style 5x5 symmetric geometric identicon
  const identicon = useMemo(() => {
    const hash = hashString(name);
    const chosenPalette =
      paletteIndex !== undefined &&
      paletteIndex !== null &&
      paletteIndex >= 0 &&
      paletteIndex < PALETTES.length
        ? PALETTES[paletteIndex]
        : PALETTES[hash % PALETTES.length];
    const rng = createRng(hash);

    // 5x5 grid with horizontal symmetry (mirror columns 0 & 1 to 4 & 3)
    const cells: { x: number; y: number }[] = [];

    for (let x = 0; x < 3; x++) {
      for (let y = 0; y < 5; y++) {
        // Probability threshold for a pixel
        if (rng() > 0.42) {
          cells.push({ x, y });
          if (x !== 2) {
            cells.push({ x: 4 - x, y }); // Mirror horizontally
          }
        }
      }
    }

    // Fallback: Ensure at least 5 cells are visible so the pattern is never bare
    if (cells.length < 5) {
      cells.push(
        { x: 2, y: 1 },
        { x: 2, y: 2 },
        { x: 2, y: 3 },
        { x: 1, y: 2 },
        { x: 3, y: 2 }
      );
    }

    return { cells, palette: chosenPalette };
  }, [name, paletteIndex]);

  const shapeClass = shape === "circle" ? "rounded-full" : "rounded-2xl";

  return (
    <div
      className={`relative overflow-hidden shrink-0 select-none flex items-center justify-center ${shapeClass} ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        boxShadow: `0 0 14px -3px ${identicon.palette.ring}, inset 0 1px 1px rgba(255,255,255,0.25)`,
        border: `1px solid ${identicon.palette.ring}`,
      }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          unoptimized
        />
      ) : (
        <svg
          viewBox="0 0 5 5"
          className="w-full h-full block"
          style={{ backgroundColor: identicon.palette.bg }}
          shapeRendering="crispEdges"
        >
          {identicon.cells.map(({ x, y }, idx) => (
            <rect
              key={idx}
              x={x}
              y={y}
              width={1}
              height={1}
              rx={0.24}
              fill={identicon.palette.fg}
            />
          ))}
        </svg>
      )}

      {/* Glossy top specular highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-full" />
    </div>
  );
}
