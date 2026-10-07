"use client";

import React from "react";
import Link from "next/link";
import ElasticMesh from "./ElasticMesh";
import BlurText from "./BlurText";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight } from "lucide-react";

export default function Websites3DSection() {
  const { messages } = useLanguage();
  const t = messages.websites3D || {
    title: "Looking for a 3D Website?",
    showTemplates: "Show Templates",
    customRequest: "Custom Request",
  };

  const handleCustomRequest = () => {
    const subject = encodeURIComponent("Custom 3D Website Request");
    window.location.href = `mailto:contact@xui.dev?subject=${subject}`;
  };

  return (
    <section
      id="3d-websites"
      dir="ltr"
      className="relative w-full pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center bg-black overflow-hidden select-none scroll-mt-6"
    >
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        {/* ── 1. Title with BlurText (Grand Scale) ── */}
        <div className="w-full flex justify-center text-center mb-6 sm:mb-8">
          <BlurText
            key={t.title}
            text={t.title}
            delay={90}
            animateBy="words"
            direction="top"
            className="text-4xl sm:text-6xl lg:text-7xl xl:text-[80px] font-extrabold tracking-tight text-white justify-center leading-tight"
          />
        </div>

        {/* ── 2. Pure 3D Elastic Mesh (Original Size Restored) ── */}
        <div className="relative w-full max-w-4xl aspect-[16/9] min-h-[260px] sm:min-h-[440px] md:min-h-[500px] flex items-center justify-center">
          <div className="relative w-full h-full rounded-[24px] overflow-hidden">
            <ElasticMesh
              image="/3D.jpeg"
              interaction="hover"
              tilt={14}
              shading={0.5}
              color1="#5227FF"
              color2="#B19EEF"
              showGrid={true}
              gridDensity={20}
              gridOpacity={0.28}
              gridColor="#ffffff"
              highlight="#ffffff"
              borderRadius={24}
              stiffness={0.05}
              damping={0.2}
              grabRadius={0.6}
              pull={0.4}
              wobble={5}
              resolution={25}
              enabled={true}
            />
          </div>
        </div>

        {/* ── 3. Authentic XUI Buttons (Unified Blue Gradient CTA) ── */}
        <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4 pointer-events-auto">
          {/* Primary CTA: Show Templates (Unified with the Blue Gradient Button from Image 2) */}
          <Link
            href="/components?category=3d-web-templates"
            className="relative group overflow-hidden h-11 sm:h-12 px-6 sm:px-7 rounded-2xl
                       inline-flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm font-semibold tracking-tight text-white
                       bg-gradient-to-r from-blue-600 to-indigo-600
                       border border-blue-400/30
                       shadow-[0_0_30px_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)]
                       hover:shadow-[0_0_45px_rgba(37,99,235,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]
                       hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 cursor-pointer"
          >
            <span>{t.showTemplates}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary CTA: Custom Request (Obsidian Titanium with Specular Hairline) */}
          <button
            type="button"
            onClick={handleCustomRequest}
            className="relative group overflow-hidden h-11 sm:h-12 px-5 sm:px-6 rounded-2xl
                       inline-flex items-center gap-2.5 text-xs sm:text-sm font-medium tracking-tight text-neutral-200 hover:text-white
                       bg-[#0d0e12]/85 hover:bg-[#15161e]/90 backdrop-blur-xl
                       border border-white/[0.12] hover:border-white/[0.25]
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_24px_rgba(0,0,0,0.6)]
                       hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_28px_rgba(0,0,0,0.7)]
                       hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                       transition-all duration-200 ease-out cursor-pointer"
          >
            {/* Top Specular Hairline Highlight */}
            <span className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            <span className="relative z-10">{t.customRequest}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
