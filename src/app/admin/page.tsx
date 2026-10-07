"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminOverview from "@/components/admin/AdminOverview";
import AdminComponentsManager, {
  RegistryItem,
} from "@/components/admin/AdminComponentsManager";
import { Loader2, ShieldAlert } from "lucide-react";

export default function AdminPage() {
  const [isLocalhost, setIsLocalhost] = useState<boolean | null>(null);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<"overview" | "components">("overview");

  // 1. Check Localhost on Mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const isLocal =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]";
      setIsLocalhost(isLocal);

      // Support deep link ?view=components if explicitly provided
      const params = new URLSearchParams(window.location.search);
      if (params.get("view") === "components") {
        setActiveView("components");
      }
    }
  }, []);

  // 2. Load Registry Components
  const fetchRegistryItems = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/registry");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load components:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLocalhost) {
      fetchRegistryItems();
    }
  }, [isLocalhost]);

  // Handle View Switching with optional URL sync
  const handleSelectView = (view: "overview" | "components") => {
    setActiveView(view);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (view === "components") {
        url.searchParams.set("view", "components");
      } else {
        url.searchParams.delete("view");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  // If loading localhost check
  if (isLocalhost === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // If not localhost, restrict access strictly
  if (!isLocalhost) {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-red-600/30 selection:text-red-200 flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-24">
          <div className="max-w-md w-full p-8 rounded-3xl bg-[#0e101c]/90 border border-red-500/30 text-center shadow-2xl flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Access Restricted
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              The XUI Admin Control Panel is exclusively accessible from your
              local development environment (<code className="text-red-400 font-mono">http://localhost</code>).
            </p>
            <Link
              href="/components"
              className="mt-2 px-5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white text-xs font-semibold transition-all"
            >
              Return to Components
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Render Localhost Admin Dashboard ──
  return (
    <div
      dir="ltr"
      className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 flex flex-col justify-between"
    >
      <Navbar />

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-60 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 pt-24 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1720px] mx-auto w-full">
        <AnimatePresence mode="wait">
          {activeView === "overview" ? (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <AdminOverview
                componentsCount={items.length}
                onOpenComponents={() => handleSelectView("components")}
              />
            </motion.div>
          ) : (
            <motion.div
              key="components"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <AdminComponentsManager
                items={items}
                loading={loading}
                fetchRegistryItems={fetchRegistryItems}
                onBackToOverview={() => handleSelectView("overview")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
