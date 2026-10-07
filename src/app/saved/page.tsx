"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Bookmark, ArrowLeft, Loader2, Compass } from "lucide-react";
import type { ComponentItem } from "@/data/componentsData";
import ComponentCard from "@/components/components-page/ComponentCard";
import { useSavedComponents } from "@/hooks/useSavedComponents";

export default function SavedPage() {
  const { savedIds, isLoading: isSavedLoading, isAuthenticated } = useSavedComponents();
  const [savedComponents, setSavedComponents] = useState<ComponentItem[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(true);

  useEffect(() => {
    if (isSavedLoading) return;

    if (savedIds.length === 0) {
      setSavedComponents([]);
      setLoadingDetails(false);
      return;
    }

    let isMounted = true;
    async function fetchSavedItems() {
      setLoadingDetails(true);
      try {
        const results = await Promise.all(
          savedIds.map(async (id) => {
            try {
              const res = await fetch(`/api/registry/${id}`);
              if (!res.ok) return null;
              const data = await res.json();
              return {
                id: data.name,
                slug: data.name,
                title: data.title || id,
                description: data.description || "",
                category:
                  data.category === "footer"
                    ? "button"
                    : data.category || "patterns",
                categoryLabel:
                  data.categoryLabel?.toLowerCase() === "footer"
                    ? "Button"
                    : data.categoryLabel || "Component",
                author: data.author || "XUI",
                authorHandle: data.authorHandle || "@xui_dev",
                authorAvatar: "/XUI.png",
                views: data.views ?? "0",
                dependencies: data.dependencies || [],
                reactCode: data.files?.[0]?.content || "",
                typescriptCode: data.files?.[0]?.content || "",
                javascriptCode: "",
                htmlCode: "",
                cssCode: "",
                jsCode: "",
                vueCode: "",
                svelteCode: "",
              } as ComponentItem;
            } catch {
              return null;
            }
          })
        );

        if (isMounted) {
          setSavedComponents(results.filter((c): c is ComponentItem => c !== null));
        }
      } catch (err) {
        console.error("Failed to load saved components:", err);
      } finally {
        if (isMounted) {
          setLoadingDetails(false);
        }
      }
    }

    fetchSavedItems();
    return () => {
      isMounted = false;
    };
  }, [savedIds, isSavedLoading]);

  // Keep display in sync with live savedIds removals
  const activeComponents = savedComponents.filter((comp) => savedIds.includes(comp.id));
  const isLoading = isSavedLoading || loadingDetails;

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 flex flex-col">
      <Navbar />

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-28 left-1/4 w-[550px] h-[550px] bg-blue-600/15 rounded-full blur-[170px]" />
        <div className="absolute top-60 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1720px] mx-auto w-full flex flex-col gap-8">
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Your Bookmarked Library
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {isAuthenticated
                ? "Components saved to your XUI cloud account, available across all devices."
                : "Components saved in your browser. Sign in anytime to sync them to the cloud."}
            </p>
          </div>

          <Link
            href="/components"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 hover:text-white transition-all w-fit self-start sm:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Browse All Components</span>
          </Link>
        </div>

        {/* Components Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
            <span className="text-xs text-neutral-500 font-mono">Loading saved components...</span>
          </div>
        ) : activeComponents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {activeComponents.map((component) => (
              <ComponentCard key={component.id} component={component} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 px-6 rounded-3xl bg-[#0c0e1a]/60 border border-white/[0.08] text-center max-w-lg mx-auto w-full">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_24px_rgba(37,99,235,0.2)]">
              <Bookmark className="w-7 h-7 fill-blue-400/20 text-blue-400" />
            </div>
            <h2 className="text-lg font-bold text-white mb-1.5">No saved components yet</h2>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed mb-6">
              Click the <strong className="text-neutral-200">Save</strong> button on any component
              card or detail page to bookmark components for quick access.
            </p>
            <Link
              href="/components"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Components</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
