"use client";

import React, { useState } from "react";
import {
  Bookmark,
  Share2,
  Eye,
  Minus,
  Plus,
  RotateCcw,
  BadgeCheck,
} from "lucide-react";
import type { ComponentItem } from "@/data/componentsData";
import ComponentLivePreview from "./ComponentLivePreview";
import ShareModal from "./ShareModal";
import CreatorProfileModal from "./CreatorProfileModal";
import { useComponentStats } from "@/hooks/useComponentStats";
import { useSavedComponents } from "@/hooks/useSavedComponents";

export interface ComponentPreviewViewProps {
  component: ComponentItem;
  locale?: string;
}

export default function ComponentPreviewView({
  component,
  locale = "en",
}: ComponentPreviewViewProps) {
  const { views, recordShare } = useComponentStats(
    component.id,
    component.views,
    { autoFetch: true }
  );
  const { isSaved: checkIsSaved, toggleSave } = useSavedComponents();
  const isSaved = checkIsSaved(component.id);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // Zoom & Refresh states
  const [zoom, setZoom] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleZoomStep = (delta: number) => {
    setZoom((prev) => {
      const next = Math.round((prev + delta) * 20) / 20;
      return Math.min(1.5, Math.max(0.5, next));
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRefreshKey((prev) => prev + 1);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 450);
  };

  const handleSave = (e: React.MouseEvent) => {
    toggleSave(component.id, e);
  };

  const handleShare = async () => {
    recordShare();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: component.title,
          text: component.description,
          url: window.location.href,
        });
        return;
      } catch {
        // User cancelled or unsupported, fallback to modal
      }
    }
    setIsShareOpen(true);
  };

  const title = component.title;
  const description = component.description;

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
      {/* ── 1. Main Interactive Preview Playground ── */}
      <div
        className="group relative w-full rounded-3xl bg-[#0b0d18]/90 backdrop-blur-2xl border border-white/[0.12] overflow-hidden transition-all shadow-2xl"
        style={{
          boxShadow:
            "0 30px 70px -15px rgba(0, 0, 0, 0.9), inset 0 1px 1px 0 rgba(255, 255, 255, 0.18)",
        }}
      >
        {/* Floating Top Control Toolbar on Hover */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 focus-within:opacity-100 -translate-y-2 group-hover:translate-y-0 focus-within:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto focus-within:pointer-events-auto">
          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-2xl bg-[#0e101c]/90 backdrop-blur-2xl border border-white/[0.14] shadow-[0_15px_35px_rgba(0,0,0,0.85),inset_0_1px_1px_rgba(255,255,255,0.2)]">
            {/* Minus button */}
            <button
              type="button"
              onClick={() => handleZoomStep(-0.1)}
              disabled={zoom <= 0.5}
              className="p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-90"
              title="Zoom out (-)"
              aria-label="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            {/* Range Slider */}
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-16 sm:w-28 h-1.5 bg-white/20 hover:bg-white/30 rounded-lg appearance-none cursor-pointer accent-blue-500 transition-colors"
              title={`Zoom: ${Math.round(zoom * 100)}%`}
              aria-label="Zoom slider"
            />

            {/* Plus button */}
            <button
              type="button"
              onClick={() => handleZoomStep(0.1)}
              disabled={zoom >= 1.5}
              className="p-1 sm:p-1.5 rounded-lg text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-90"
              title="Zoom in (+)"
              aria-label="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>

            {/* Percentage / Reset to 100% */}
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="text-[11px] font-mono font-medium text-neutral-300 hover:text-white transition-colors cursor-pointer select-none px-1.5 py-0.5 rounded hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              title="Reset Zoom to 100%"
              aria-label="Reset zoom to 100%"
            >
              {Math.round(zoom * 100)}%
            </button>

            {/* Hairline Divider */}
            <div className="w-px h-4 bg-white/15 mx-0.5 shrink-0" />

            {/* Refresh Button */}
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.06] hover:bg-blue-600/25 hover:border-blue-500/40 border border-white/[0.1] transition-all cursor-pointer active:scale-95 group/refresh focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              title="Refresh component"
              aria-label="Refresh component preview"
            >
              <RotateCcw
                className={`w-3.5 h-3.5 text-blue-400 transition-transform duration-500 ${
                  isRefreshing ? "-rotate-180" : "group-hover/refresh:-rotate-45"
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Live Canvas Area */}
        <div
          className="relative min-h-[300px] sm:min-h-[440px] flex items-center justify-center p-4 sm:p-8 transition-colors duration-300 overflow-hidden bg-[#090b14]"
        >
          {/* Scaled Component Container */}
          <div
            key={refreshKey}
            className={`w-full flex items-center justify-center transition-all duration-300 ${
              isRefreshing ? "opacity-30 scale-95" : "opacity-100 scale-100"
            }`}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center center",
              transition: "transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease",
            }}
          >
            <ComponentLivePreview
              id={component.id}
              interactive={true}
              code={component.reactCode || component.typescriptCode || component.javascriptCode || component.htmlCode}
            />
          </div>
        </div>
      </div>

      {/* ── 2. Action & Stats Bar (Responsive 2-tier on mobile, 1-tier on desktop) ── */}
      <div
        className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-2.5 sm:px-5 sm:py-3 rounded-2xl bg-[#0e101c]/80 backdrop-blur-xl border border-white/[0.1] shadow-xl"
        style={{
          boxShadow:
            "0 15px 35px -10px rgba(0, 0, 0, 0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Tier 1: Action Buttons: Save, Share (Full width grid on mobile) */}
        <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Save / Bookmark button */}
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? "Remove from saved components" : "Save component"}
            className={`flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
              isSaved
                ? "bg-blue-600/20 border-blue-500/40 text-blue-300 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                : "bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1] text-neutral-300 hover:text-white"
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${
                isSaved ? "fill-blue-400 text-blue-400 scale-110" : "text-neutral-400"
              }`}
            />
            <span>{isSaved ? "Saved" : "Save"}</span>
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share component"
            className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-1.5 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] text-neutral-300 hover:text-white transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
            title="Share component"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
            <span>Share</span>
          </button>
        </div>

        {/* Tier 2: Stats & Creator Attribution */}
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06] w-full sm:w-auto">
          {/* Views count */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Eye className="w-4 h-4 text-neutral-500" />
            <span>Views {views}</span>
          </div>

          {/* Hairline divider */}
          <div className="w-px h-4 bg-white/10 hidden sm:block" />

          {/* Creator Attribution (Clickable to view Profile) */}
          <button
            type="button"
            onClick={() => setIsCreatorOpen(true)}
            className="group/creator flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-blue-500/40 transition-all cursor-pointer active:scale-95"
            title={`View ${component.author} Profile`}
          >
            <div className="relative shrink-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-white/20 bg-black flex items-center justify-center shadow-md">
                <img
                  src={component.authorAvatar || "/XUI.png"}
                  alt={component.author}
                  className="w-full h-full object-cover"
                />
              </div>
              <div
                className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-blue-600 text-white border-2 border-[#0d0f1a] flex items-center justify-center shadow-sm"
                title="Verified"
              >
                <BadgeCheck className="w-3 h-3 fill-white text-blue-600" />
              </div>
            </div>

            <span className="text-xs sm:text-sm text-neutral-300 font-medium flex items-center gap-1.5">
              Created by <strong className="text-white group-hover/creator:text-blue-400 font-semibold transition-colors">{component.author}</strong>
            </span>
          </button>
        </div>
      </div>

      {/* ── Share Modal Popup ── */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        componentId={component.id}
        title={title}
        description={description}
      />

      {/* ── Creator Profile Modal ── */}
      <CreatorProfileModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        author={component.author}
        authorHandle={component.authorHandle}
        authorAvatar={component.authorAvatar}
      />
    </div>
  );
}
