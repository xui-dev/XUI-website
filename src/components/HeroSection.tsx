"use client";

import Link from "next/link";
import XUILogo from "@/components/XUILogo";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowRight, Star } from "lucide-react";

interface HeroSectionProps {
  style?: React.CSSProperties;
  className?: string;
}

export default function HeroSection({ style, className = "" }: HeroSectionProps) {
  const { messages, dir } = useLanguage();
  const t = messages.hero;

  return (
    <div
      dir={dir}
      style={style}
      className={`absolute inset-0 z-20 flex flex-col justify-end sm:justify-center pb-20 sm:pb-0 px-5 sm:px-12 lg:px-20 xl:px-28 pointer-events-none select-none ${className}`}
    >
      <div className="max-w-2xl flex flex-col items-start gap-3 sm:gap-6 lg:gap-8">
        {/* 1. Hero Logo (Desktop only - mobile already has logo in navbar & robot chest) */}
        <div className="hidden sm:inline-flex relative items-center pointer-events-auto group mb-1 sm:mb-2">
          {/* Ambient electric blue aura from robot's eye color */}
          <div className="absolute -inset-6 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.4)_0%,rgba(0,162,255,0.15)_45%,transparent_75%)] blur-2xl pointer-events-none" />

          <Link
            href="/"
            className="relative flex items-center transition-transform duration-300 hover:scale-[1.03]"
            aria-label="XUI Brand"
          >
            <XUILogo height={74} color="#ffffff" />
          </Link>
        </div>

        {/* 2. Main Headline */}
        <div className="flex flex-col">
          <h1 className="text-2xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.14] text-balance">
            <span className="block">{t.titleLine1}</span>
            <span className="block bg-gradient-to-r from-white via-white to-neutral-300 bg-clip-text text-transparent">
              {t.titleLine2}
            </span>
          </h1>
        </div>

        {/* 3. Subtitle Paragraph */}
        <p className="text-xs sm:text-base lg:text-lg text-neutral-300 sm:text-neutral-400 font-normal leading-relaxed max-w-sm sm:max-w-lg line-clamp-2 sm:line-clamp-none">
          {t.subtitle}
        </p>

        {/* 4. Action Buttons (Ultra-Premium Handcrafted CTAs) */}
        <div className="flex flex-row items-center gap-2.5 sm:gap-4 pt-1 sm:pt-2 pointer-events-auto">
          {/* Primary CTA: Browse Components (Unified Blue Gradient CTA) */}
          <Link
            href="/components"
            className="relative group overflow-hidden h-10 sm:h-12 px-5 sm:px-6 rounded-2xl
                       inline-flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold tracking-tight text-white
                       bg-gradient-to-r from-blue-600 to-indigo-600
                       border border-blue-400/30
                       shadow-[0_0_30px_rgba(37,99,235,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)]
                       hover:shadow-[0_0_45px_rgba(37,99,235,0.7),inset_0_1px_1px_rgba(255,255,255,0.4)]
                       hover:scale-[1.02] active:scale-[0.98]
                       transition-all duration-200 cursor-pointer shrink-0"
          >
            <span className="relative z-10 whitespace-nowrap">{t.browseBtn}</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1 shrink-0" />
          </Link>

          {/* Secondary CTA: Star on GitHub (Obsidian Titanium with Live Star Counter Badge, Zero Yellow) */}
          <a
            href="https://github.com/xui-dev/XUI-components-"
            target="_blank"
            rel="noopener noreferrer"
            className="relative group overflow-hidden h-10 sm:h-12 px-3.5 sm:px-5 rounded-2xl
                       inline-flex items-center gap-2 text-xs sm:text-sm font-medium tracking-tight text-neutral-200 hover:text-white
                       bg-[#0d0e12]/85 hover:bg-[#15161e]/90 backdrop-blur-xl
                       border border-white/[0.12] hover:border-white/[0.25]
                       shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_24px_rgba(0,0,0,0.6)]
                       hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_12px_28px_rgba(0,0,0,0.7)]
                       hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                       transition-all duration-200 ease-out cursor-pointer shrink-0"
          >
            {/* Top Specular Hairline Highlight */}
            <span className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* GitHub Octocat Icon */}
            <svg
              className="relative z-10 w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-300 group-hover:text-white transition-colors"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>

            <span className="relative z-10 whitespace-nowrap">{t.githubBtn}</span>

            {/* Hairline Divider */}
            <span className="w-px h-3 sm:h-3.5 bg-white/15 group-hover:bg-white/25 transition-colors" />

            {/* Platinum Star Metric Pill (No Yellow) */}
            <span className="relative z-10 flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white/[0.06] group-hover:bg-white/[0.1] border border-white/[0.08] text-[11px] font-mono font-medium text-neutral-300 group-hover:text-white transition-colors">
              <Star className="w-3 h-3 text-neutral-300 group-hover:text-white fill-white/15 group-hover:fill-white/30 transition-colors" />
              <span>{t.starCount || "14.8k"}</span>
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
