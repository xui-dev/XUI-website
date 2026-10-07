"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Home } from "lucide-react";
import { motion } from "motion/react";

export default function NotFound() {
  return (
    <div
      dir="ltr"
      className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden flex flex-col justify-between"
    >
      {/* ── Fixed Floating Navbar Dock ── */}
      <Navbar />

      {/* ── Ambient Background Glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[180px]" />
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      {/* ── Main 404 Hero Section ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center py-24 sm:py-32 px-4 sm:px-6 max-w-4xl mx-auto w-full text-center">
        {/* Big Kinetic 404 Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6 select-none"
        >
          <h1
            className="text-7xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white/80 to-white/20 bg-clip-text text-transparent"
            style={{
              textShadow: "0 0 80px rgba(59, 130, 246, 0.3)",
            }}
          >
            404
          </h1>
          <div className="absolute -inset-4 bg-blue-600/15 blur-3xl -z-10 rounded-full" />
        </motion.div>

        {/* Title & Description */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex flex-col items-center gap-3 max-w-xl mb-10"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Component or Page Not Found
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
            The component or link you are looking for does not exist, was renamed, or has been deleted from the registry.
          </p>
        </motion.div>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center"
        >
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 hover:text-white font-semibold text-xs sm:text-sm border border-white/[0.12] transition-all cursor-pointer active:scale-95 shadow-lg"
          >
            <Home className="w-4 h-4 text-blue-400" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
