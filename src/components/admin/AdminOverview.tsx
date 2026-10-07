"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import {
  Layers,
  Film,
  BarChart3,
  Inbox,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface AdminOverviewProps {
  componentsCount: number;
  onOpenComponents: () => void;
}

export default function AdminOverview({
  componentsCount,
  onOpenComponents,
}: AdminOverviewProps) {
  const cards = [
    {
      id: "components",
      title: "Components",
      tagline: "Component Registry & CLI System",
      description:
        "Inspect, preview, publish, and delete components in the local registry with direct CLI package and cloud synchronization.",
      icon: Layers,
      color: "blue",
      glowColor: "rgba(59, 130, 246, 0.35)",
      borderColor: "group-hover:border-blue-500/50",
      buttonBg: "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]",
      metric: `${componentsCount} Components in Registry`,
      isLive: true,
      onClick: onOpenComponents,
    },
    {
      id: "video-editor",
      title: "Video Editor",
      tagline: "Cinematic Clips & Visual Showcase",
      description:
        "Interactive recording studio to capture component demos, kinetic animations, and high-fidelity video exports.",
      icon: Film,
      color: "purple",
      glowColor: "rgba(168, 85, 247, 0.25)",
      borderColor: "group-hover:border-purple-500/40",
      metric: "Under Active Development",
      isLive: false,
    },
    {
      id: "analytics",
      title: "Analytics",
      tagline: "Telemetry & Developer Metrics",
      description:
        "Deep telemetry metrics tracking component installations, CLI package downloads, page views, and developer engagement.",
      icon: BarChart3,
      color: "emerald",
      glowColor: "rgba(16, 185, 129, 0.25)",
      borderColor: "group-hover:border-emerald-500/40",
      metric: "Live Telemetry Engine",
      isLive: false,
    },
    {
      id: "requests",
      title: "Requests",
      tagline: "Community & Custom Submissions",
      description:
        "Centralized review queue for community component suggestions, custom 3D inquiries, and developer feedback.",
      icon: Inbox,
      color: "amber",
      glowColor: "rgba(245, 158, 11, 0.25)",
      borderColor: "group-hover:border-amber-500/40",
      metric: "Request Queue Pipeline",
      isLive: false,
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  };

  return (
    <div className="w-full flex flex-col gap-10">
      {/* ── Top Overview Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/[0.08] pb-8">
        <div className="flex flex-col items-start gap-2.5">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <span>Control Center</span>
          </h1>

          <p className="text-neutral-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Centralized hub for managing the XUI library, developer registry tools, and platform telemetry. Select an area below to get started.
          </p>
        </div>
      </div>

      {/* ── 4 Main Cards Grid ── */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-7"
      >
        {cards.map((card) => {
          const Icon = card.icon;

          if (card.isLive) {
            return (
              <motion.div
                key={card.id}
                variants={cardVariants}
                onClick={card.onClick}
                className={`group relative rounded-3xl p-7 bg-[#0e101c]/80 hover:bg-[#121526]/95 backdrop-blur-2xl border border-white/[0.12] ${card.borderColor} shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between gap-6 hover:shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_40px_${card.glowColor}] hover:-translate-y-1`}
              >
                {/* Specular sheen on top */}
                <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

                {/* Ambient glow in corner */}
                <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-blue-600/15 rounded-full blur-3xl group-hover:bg-blue-600/25 transition-all duration-500" />

                {/* Card Top: Icon */}
                <div className="flex items-start justify-between gap-4 relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.25)] group-hover:scale-105 transition-transform duration-300">
                    <Icon className="w-7 h-7" />
                  </div>
                </div>

                {/* Card Body: Title & Description */}
                <div className="flex flex-col gap-2 relative z-10">
                  <h2 className="text-xl sm:text-2xl font-bold text-white group-hover:text-blue-300 transition-colors">
                    {card.title}
                  </h2>

                  <div className="text-[11px] font-mono text-blue-400 tracking-wide uppercase">
                    {card.tagline}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mt-1">
                    {card.description}
                  </p>
                </div>

                {/* Card Footer: Metric & Action Button */}
                <div className="pt-4 border-t border-white/[0.08] flex items-center justify-between gap-4 relative z-10">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-300">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>{card.metric}</span>
                  </div>

                  <button
                    type="button"
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer active:scale-95 ${card.buttonBg}`}
                  >
                    <span>Manage Components</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.div>
            );
          }

          // Placeholder / Planned Feature Cards (Video Editor, Analytics, Requests)
          return (
            <motion.div
              key={card.id}
              variants={cardVariants}
              className={`group relative rounded-3xl p-7 bg-[#0c0e18]/70 hover:bg-[#0f1220]/80 backdrop-blur-2xl border border-white/[0.09] ${card.borderColor} shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between gap-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.6),0_0_30px_${card.glowColor}]`}
            >
              {/* Specular sheen on top */}
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

              {/* Ambient glow in corner */}
              <div
                className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: card.glowColor }}
              />

              {/* Card Top: Icon */}
              <div className="flex items-start justify-between gap-4 relative z-10">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-105"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <Icon className="w-7 h-7 text-neutral-300 group-hover:text-white transition-colors" />
                </div>
              </div>

              {/* Card Body: Title & Description */}
              <div className="flex flex-col gap-2 relative z-10">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-200 group-hover:text-white transition-colors">
                  {card.title}
                </h2>

                <div className="text-[11px] font-mono text-neutral-500 tracking-wide uppercase">
                  {card.tagline}
                </div>

                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mt-1">
                  {card.description}
                </p>
              </div>

              {/* Card Footer: Status Bar & Placeholder Action */}
              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" />
                  <span>{card.metric}</span>
                </div>

                <span className="px-3.5 py-1.5 rounded-xl text-xs font-mono font-medium text-neutral-400 bg-white/[0.04] border border-white/[0.06]">
                  Planned Feature
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
