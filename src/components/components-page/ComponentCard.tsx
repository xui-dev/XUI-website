"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Eye, ArrowUpRight, Bookmark, Share2, BadgeCheck } from "lucide-react";
import type { ComponentItem } from "@/data/componentsData";
import ComponentLivePreview from "./ComponentLivePreview";
import ShareModal from "./ShareModal";
import CreatorProfileModal from "./CreatorProfileModal";
import { useComponentStats } from "@/hooks/useComponentStats";
import { useSavedComponents } from "@/hooks/useSavedComponents";

export interface ComponentCardProps {
  component: ComponentItem;
  locale?: string;
}

export default function ComponentCard({ component, locale = "en" }: ComponentCardProps) {
  const { views, recordShare } = useComponentStats(
    component.id,
    component.views
  );
  const { isSaved: checkIsSaved, toggleSave } = useSavedComponents();
  const isSaved = checkIsSaved(component.id);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);

  // High-performance Viewport Virtualization: Only mount iframe when scrolled into view
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Once loaded, keep it active
        }
      },
      { rootMargin: "250px" } // Pre-load 250px before entering viewport
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    recordShare();
    setIsShareOpen(true);
  };

  const title = component.title;
  const description = component.description;

  return (
    <div
      className="group relative flex flex-col rounded-3xl bg-[#0d0f1a]/80 backdrop-blur-2xl border border-white/[0.12] overflow-hidden transition-all duration-300 hover:border-white/[0.25] hover:-translate-y-1.5"
      style={{
        boxShadow:
          "0 20px 50px -15px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.16)",
      }}
    >
      {/* ── 1. Interactive Preview Area with Viewport Lazy-Mount ── */}
      <div
        ref={cardRef}
        className="relative h-72 sm:h-80 lg:h-[340px] xl:h-[360px] w-full flex items-center justify-center bg-black/40 overflow-hidden border-b border-white/[0.08]"
      >
        <div className="relative flex items-center justify-center w-full h-full overflow-hidden">
          {isVisible ? (
            <ComponentLivePreview
              id={component.id}
              code={component.reactCode || component.typescriptCode || component.javascriptCode || component.htmlCode}
              interactive={true}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-white/[0.01]">
              <span className="w-7 h-7 rounded-full border border-blue-500/20 border-t-blue-500 animate-spin" />
              <span className="text-[10px] text-neutral-500 font-mono tracking-wider">XUI PREVIEW</span>
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Card Info & Footer ── */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between gap-3.5 sm:gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            {/* Left Action Buttons: Save, Share */}
            <div className="flex items-center gap-1.5">
              {/* Bookmark / Save Button */}
              <button
                type="button"
                onClick={(e) => toggleSave(component.id, e)}
                aria-label={isSaved ? `Remove ${title} from saved` : `Save ${title}`}
                className={`flex items-center justify-center p-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60 ${
                  isSaved
                    ? "text-blue-400 bg-blue-500/15 border-blue-500/30 shadow-[0_0_12px_rgba(37,99,235,0.25)]"
                    : "text-neutral-400 hover:text-white bg-white/[0.03] border-white/[0.08] hover:bg-white/[0.08]"
                }`}
                title={isSaved ? "Saved to Bookmarks" : "Save to Bookmarks"}
              >
                <Bookmark
                  className={`w-3.5 h-3.5 transition-all ${
                    isSaved ? "fill-blue-400 text-blue-400 scale-110" : ""
                  }`}
                />
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShareClick}
                aria-label={`Share ${title}`}
                className="flex items-center justify-center p-1.5 rounded-lg text-xs font-mono text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                title="Share component link"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>

            {/* Right: Open Details Button (moved down from preview window) */}
            <Link
              href={`/components/${component.id}`}
              aria-label={`View details of ${title}`}
              className="group/details flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-blue-500/40 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              title="Open Details"
            >
              <span>Open Details</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 group-hover/details:translate-x-0.5 group-hover/details:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <Link href={`/components/${component.id}`} className="group/link block">
            <h3 className="text-base font-bold text-white group-hover/link:text-blue-300 transition-colors flex items-center gap-1.5 select-text">
              {title}
            </h3>
            <p className="text-xs text-neutral-400 line-clamp-2 mt-1 leading-relaxed select-text">
              {description}
            </p>
          </Link>
        </div>

        {/* Footer Meta: Views + Creator Attribution */}
        <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
          {/* Creator Attribution Pill (Clickable to view Profile) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsCreatorOpen(true);
            }}
            className="group/creator relative p-0.5 rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title={`View ${component.author} Profile`}
          >
            {/* Creator Circle Avatar with Overlay Verified Badge */}
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20 group-hover/creator:border-white/40 bg-black flex items-center justify-center shadow-md transition-colors">
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
                <BadgeCheck className="w-2.5 h-2.5 fill-white text-blue-600" />
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 text-neutral-500 font-mono text-[11px]">
            <Eye className="w-3.5 h-3.5" />
            <span>{views}</span>
          </div>
        </div>
      </div>

      {/* Share Modal Popup */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        componentId={component.id}
        title={title}
        description={description}
      />

      {/* Creator Profile Modal */}
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
