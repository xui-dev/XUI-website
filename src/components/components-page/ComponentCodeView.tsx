"use client";

import React, { useState, useRef, useEffect } from "react";
import { Download, FileText, Archive, Check, ChevronDown } from "lucide-react";
import type { ComponentItem } from "@/data/componentsData";
import { XUICodeBlock } from "./CodeBlock";
import { downloadComponentZip, downloadComponentMarkdown } from "@/lib/zipExporter";

export interface ComponentCodeViewProps {
  component: ComponentItem;
  locale?: string;
}

export default function ComponentCodeView({ component }: ComponentCodeViewProps) {
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [isDownloadingMd, setIsDownloadingMd] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    try {
      await downloadComponentZip({
        title: component.title,
        slug: component.slug,
        typescriptCode: component.typescriptCode || component.reactCode,
        dependencies: component.dependencies,
      });
    } catch (err) {
      console.error("Failed to download zip", err);
    } finally {
      setTimeout(() => setIsDownloadingZip(false), 1200);
    }
  };

  const handleDownloadMd = () => {
    setIsDownloadingMd(true);
    try {
      downloadComponentMarkdown({
        title: component.title,
        slug: component.slug,
        typescriptCode: component.typescriptCode || component.reactCode,
        dependencies: component.dependencies,
      });
    } catch (err) {
      console.error("Failed to download markdown", err);
    } finally {
      setTimeout(() => setIsDownloadingMd(false), 1200);
    }
  };

  /** Download dropdown — injected into the TypeScript card header */
  const downloadDropdown = (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDownloadOpen(!isDownloadOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono border cursor-pointer active:scale-95 transition-all text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.1]"
      >
        <Download className="w-3.5 h-3.5 text-blue-400" />
        <span className="font-sans">Download</span>
        <ChevronDown
          className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
            isDownloadOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isDownloadOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 p-1.5 rounded-2xl bg-[#0f111e]/98 backdrop-blur-2xl border border-white/[0.14] z-[100] flex flex-col gap-1"
          style={{
            boxShadow:
              "0 20px 40px -10px rgba(0,0,0,0.95), inset 0 1px 1px rgba(255,255,255,0.12)",
          }}
        >
          {/* ZIP */}
          <button
            type="button"
            onClick={() => { handleDownloadZip(); setIsDownloadOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer text-left"
          >
            {isDownloadingZip ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Archive className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <div className="flex flex-col">
              <span>ZIP</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {isDownloadingZip ? "Downloading..." : "TypeScript + Tailwind (.zip)"}
              </span>
            </div>
          </button>

          {/* Md file */}
          <button
            type="button"
            onClick={() => { handleDownloadMd(); setIsDownloadOpen(false); }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white hover:bg-white/[0.08] transition-all cursor-pointer text-left"
          >
            {isDownloadingMd ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-purple-400 shrink-0" />
            )}
            <div className="flex flex-col">
              <span>Md file</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {isDownloadingMd ? "Downloading..." : "Docs & code"}
              </span>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5 sm:gap-3.5 w-full max-w-5xl mx-auto">
      {/* ── Separate Language Switcher Bar (Detached from Mac Window) ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[#0a0c16]/85 backdrop-blur-2xl border border-white/[0.14] shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] w-fit self-start overflow-x-auto no-scrollbar">
        <button
          type="button"
          className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-semibold bg-gradient-to-b from-white/[0.11] to-white/[0.04] text-white border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)] cursor-pointer whitespace-nowrap"
        >
          {/* React Logo */}
          <svg
            className="w-4 h-4 text-[#00D8FF] shrink-0"
            viewBox="0 0 115.3 100"
            fill="currentColor"
          >
            <ellipse cx="57.65" cy="50" rx="16.7" ry="16.7" fill="#00D8FF" />
            <path
              d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
              fill="none"
              stroke="#00D8FF"
              strokeWidth="6"
              transform="rotate(30 57.65 50)"
            />
            <path
              d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
              fill="none"
              stroke="#00D8FF"
              strokeWidth="6"
              transform="rotate(90 57.65 50)"
            />
            <path
              d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
              fill="none"
              stroke="#00D8FF"
              strokeWidth="6"
              transform="rotate(150 57.65 50)"
            />
          </svg>
          <span>React</span>
        </button>
      </div>

      {/* Single TypeScript (TSX = TypeScript + Tailwind) code block */}
      <XUICodeBlock
        code={component.typescriptCode || component.reactCode}
        language="tsx"
        filename={`${capitalize(component.slug)}.tsx`}
        badgeColor="text-blue-400 bg-blue-500/15 border-blue-500/30"
        accentBar="bg-blue-500"
        extraActions={downloadDropdown}
      />
    </div>
  );
}

function capitalize(str: string) {
  return str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}
