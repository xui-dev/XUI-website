"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ComponentPreviewView from "@/components/components-page/ComponentPreviewView";
import ComponentCodeView from "@/components/components-page/ComponentCodeView";
import type { ComponentItem } from "@/data/componentsData";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, Eye, Code2, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CopyButton from "@/components/ui/CopyButton";

export interface ComponentDetailClientProps {
  component: ComponentItem;
}

export default function ComponentDetailClient({ component }: ComponentDetailClientProps) {
  const { locale, dir } = useLanguage();
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const title = component.title;
  const cliCommand = `npx xui add ${component.id}`;

  // Increment views on visit (session-deduplicated to prevent quota waste on refresh)
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const sessionKey = `xui_viewed_${component.id}`;
      if (sessionStorage.getItem(sessionKey)) {
        return; // Already counted in this browsing session
      }
      sessionStorage.setItem(sessionKey, "1");
    } catch {
      // Storage unavailable or disabled
    }

    fetch(`/api/stats/${component.id}?action=view`, { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.views !== undefined && typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("xui_views_sync", {
              detail: { id: component.id, views: data.views },
            })
          );
        }
      })
      .catch(() => {});
  }, [component.id]);

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden flex flex-col"
    >
      {/* ── Fixed Floating Navbar ── */}
      <Navbar />

      {/* ── Ambient Background Glows ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-24 left-1/3 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px]" />
        <div className="absolute bottom-24 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[150px]" />
      </div>

      <main className="relative z-10 flex-1 pt-24 sm:pt-36 pb-24 px-3.5 sm:px-6 lg:px-12 max-w-6xl mx-auto w-full flex flex-col gap-5 sm:gap-6">
        {/* ── Navigation Header: Back Link + Breadcrumb ── */}
        <div className="flex flex-row items-center justify-between gap-3">
          <Link
            href="/components"
            className="group flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform shrink-0" />
            <span>Back to Components</span>
          </Link>

          {/* Top Toggle Tabs: [ Preview ] and [ Code ] */}
          <div className="relative flex items-center p-1 rounded-2xl bg-[#10121e]/90 backdrop-blur-2xl border border-white/[0.12] shadow-xl shrink-0">
            {/* Preview Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveTab("preview")}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                activeTab === "preview" ? "text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {activeTab === "preview" && (
                <>
                  <motion.div
                    layoutId="activeTabPillGlow"
                    className="absolute -inset-1 rounded-2xl bg-blue-500/25 blur-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-400/40 shadow-[0_4px_20px_rgba(37,99,235,0.45)]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                </>
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <motion.span
                  animate={activeTab === "preview" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.span>
                <span>Preview</span>
              </span>
            </motion.button>

            {/* Code Button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => setActiveTab("code")}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors duration-200 cursor-pointer ${
                activeTab === "code" ? "text-white" : "text-neutral-400 hover:text-white"
              }`}
            >
              {activeTab === "code" && (
                <>
                  <motion.div
                    layoutId="activeTabPillGlow"
                    className="absolute -inset-1 rounded-2xl bg-blue-500/25 blur-md -z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                  <motion.div
                    layoutId="activeTabPill"
                    className="absolute inset-0 rounded-xl bg-gradient-to-b from-blue-500 to-blue-600 border border-blue-400/40 shadow-[0_4px_20px_rgba(37,99,235,0.45)]"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                </>
              )}
              <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                <motion.span
                  animate={activeTab === "code" ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-center"
                >
                  <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </motion.span>
                <span>Code</span>
              </span>
            </motion.button>
          </div>
        </div>

        {/* ── Component Title Header ── */}
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight select-text">
            {title}
          </h1>
        </div>

        {/* ── Active Tab View ── */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "preview" ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <ComponentPreviewView component={component} locale={locale} />
              </motion.div>
            ) : (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6 w-full max-w-5xl mx-auto"
              >
                {/* ── One-Click CLI Installation Bar (Code Tab Only) ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:px-5 sm:py-3.5 rounded-2xl bg-[#0e101c]/90 backdrop-blur-xl border border-white/[0.12] shadow-xl">
                  <div className="flex items-center gap-2.5 font-mono text-xs sm:text-sm text-neutral-300 overflow-x-auto no-scrollbar">
                    <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="text-neutral-500 select-none">$</span>
                    <span className="text-blue-300 font-semibold whitespace-nowrap">{cliCommand}</span>
                  </div>
                  <CopyButton
                    text={cliCommand}
                    label="Copy CLI"
                    icon="terminal"
                    className="self-end sm:self-auto px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/[0.12] text-white"
                  />
                </div>

                <ComponentCodeView component={component} locale={locale} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
