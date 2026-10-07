"use client";

import React, { useState, useEffect } from "react";
import ParticleText from "./ParticleText";
import { useLanguage } from "@/context/LanguageContext";

const PHRASES = [
  { id: "ui-design", text: "Kinetic UI components", label: "UI Components" },
  { id: "react", text: "React + TypeScript", label: "React + TS" },
  { id: "tailwind", text: "Tailwind CSS", label: "Tailwind" },
  { id: "interactive", text: "Motion Kinetics", label: "Motion" },
];

export interface ParticleShowcaseSectionProps {
  active?: boolean;
  opacity?: number;
}

export default function ParticleShowcaseSection({
  active = true,
  opacity = 1,
}: ParticleShowcaseSectionProps) {
  const { locale, dir } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);

  // Progressive auto-cycle every 3.8s
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % PHRASES.length);
    }, 3800);

    return () => clearInterval(interval);
  }, [active]);

  if (!active || opacity <= 0.01) return null;

  const currentPhrase = PHRASES[currentIdx];

  return (
    <section
      dir={dir}
      style={{ opacity }}
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 sm:px-8 pointer-events-auto transition-opacity duration-300 select-none"
    >
      {/* ── Ambient Radial Royal Blue Nebula ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="w-[360px] sm:w-[700px] h-[360px] sm:h-[700px] rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.30)_0%,rgba(79,9,237,0.18)_40%,transparent_70%)] blur-[90px] sm:blur-[120px]" />
      </div>

      {/* ── Progressive Phrase Pills Navigator ── */}
      <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-4 sm:mb-8 max-w-lg px-2">
        {PHRASES.map((phrase, idx) => {
          const isCurrent = currentIdx === idx;
          return (
            <button
              key={phrase.id}
              type="button"
              onClick={() => setCurrentIdx(idx)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all duration-300 cursor-pointer ${
                isCurrent
                  ? "bg-blue-600/30 text-blue-200 border border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-105 font-bold"
                  : "bg-white/[0.04] text-neutral-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.08]"
              }`}
            >
              {phrase.label}
            </button>
          );
        })}
      </div>

      {/* ── Particle Text Stage ── */}
      <div className="relative z-10 w-full max-w-5xl h-[280px] sm:h-[380px] flex items-center justify-center px-3 my-2">
        <ParticleText
          key={currentPhrase.id}
          text={currentPhrase.text}
          particleSize={3.0}
          density={2.5}
          color="#ffffff"
          highlightColor="#3B82F6"
          scatter={190}
          gatherDuration={1500}
          stagger={380}
          pointerRepel={50}
          repelRadius={140}
          idleDrift={0.8}
          trigger="mount"
          fontSize="clamp(3.6rem, 14vw, 8rem)"
          fontWeight={900}
          fontFamily="inherit"
          glow={true}
        />
      </div>
    </section>
  );
}
