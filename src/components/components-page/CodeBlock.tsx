"use client";

import React, { useState } from "react";
import CopyButton from "@/components/ui/CopyButton";
import { Code2 } from "lucide-react";

export interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className = "" }: CodeBlockProps) {
  return (
    <div
      className={`relative w-full rounded-2xl bg-[#0a0c16]/95 border border-white/[0.12] transition-all duration-200 ${className}`}
      style={{
        boxShadow:
          "0 20px 50px -10px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      {/* Specular Top Sheen */}
      <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      {children}
    </div>
  );
}

export interface CodeBlockGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlockGroup({ children, className = "" }: CodeBlockGroupProps) {
  return (
    <div
      className={`flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-4 py-2.5 backdrop-blur-md ${className}`}
    >
      {children}
    </div>
  );
}

export interface CodeBlockCodeProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CodeBlockCode({
  code,
  language = "tsx",
  showLineNumbers = true,
}: CodeBlockCodeProps) {
  const lines = code.trim().split("\n");

  return (
    <div className="relative overflow-x-auto select-text p-3 sm:p-4 font-mono text-[11px] sm:text-[13px] leading-relaxed text-neutral-300 selection:bg-blue-600/30 selection:text-blue-200 touch-scroll-x no-scrollbar">
      <pre className="m-0 flex flex-col font-mono min-w-max">
        {lines.map((line, idx) => (
          <div key={idx} className="table-row group">
            {showLineNumbers && (
              <span className="table-cell select-none pr-2 sm:pr-4 text-right font-mono text-[10px] sm:text-xs text-neutral-600 group-hover:text-neutral-500 w-6 sm:w-8 shrink-0">
                {idx + 1}
              </span>
            )}
            <span className="table-cell whitespace-pre font-mono">
              {formatSyntaxHighlight(line, language)}
            </span>
          </div>
        ))}
      </pre>
    </div>
  );
}

// Simple deterministic syntax highlighter for rich presentation
function formatSyntaxHighlight(line: string, _lang: string): React.ReactNode {
  // If comment
  if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*")) {
    return <span className="text-neutral-500 italic">{line}</span>;
  }

  // Tokens regex for keywords, strings, tags, types
  const parts = line.split(
    /(\b(?:import|export|from|default|function|const|let|var|return|if|else|type|interface|class|true|false|null|undefined|async|await|script|style|template)\b|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|<\/?[A-Za-z0-9_.-]+(?:\s|>|\/)|[{}\(\)\[\];=><+\-*\/&|!?:.,])/g
  );

  return parts.map((part, i) => {
    if (!part) return null;

    // Strings
    if (
      (part.startsWith('"') && part.endsWith('"')) ||
      (part.startsWith("'") && part.endsWith("'")) ||
      (part.startsWith("`") && part.endsWith("`"))
    ) {
      return (
        <span key={i} className="text-emerald-400">
          {part}
        </span>
      );
    }

    // Keywords
    if (
      /^(import|export|from|default|function|const|let|var|return|if|else|type|interface|class|true|false|null|undefined|async|await)$/.test(
        part
      )
    ) {
      return (
        <span key={i} className="text-purple-400 font-semibold">
          {part}
        </span>
      );
    }

    // HTML / JSX tags
    if (part.startsWith("<") || part.startsWith("</")) {
      return (
        <span key={i} className="text-blue-400">
          {part}
        </span>
      );
    }

    // Punctuation & operators
    if (/^[{}()\[\];,=><+\-*\/&!?:.]$/.test(part)) {
      return (
        <span key={i} className="text-neutral-400">
          {part}
        </span>
      );
    }

    return <span key={i}>{part}</span>;
  });
}

// Complete Ready-To-Use CodeBlock with Header and Copy action
export interface XUICodeBlockProps {
  code: string;
  language?: string;
  filename: string;
  frameworkBadge?: string;
  badgeColor?: string;
  /** accent bar color on the left edge of the header (tailwind bg class) */
  accentBar?: string;
  /** Extra action buttons rendered after the Copy button in the header */
  extraActions?: React.ReactNode;
}

function FrameworkBadge({ name }: { name: string }) {
  const isReact = name.toLowerCase().includes("react");
  const isTS = name.toLowerCase().includes("typescript") || name.toLowerCase().includes("ts");

  if (isReact) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold font-mono tracking-tight text-[#38bdf8] bg-gradient-to-r from-cyan-500/[0.14] to-blue-500/[0.08] border border-cyan-400/35 shadow-[0_2px_14px_rgba(0,216,255,0.18),inset_0_1px_1px_rgba(255,255,255,0.22)] select-none">
        <svg
          className="w-3.5 h-3.5 text-[#00D8FF] shrink-0"
          viewBox="0 0 115.3 100"
          fill="currentColor"
          aria-hidden="true"
        >
          <ellipse cx="57.65" cy="50" rx="11.4" ry="11.4" fill="#00D8FF" />
          <path
            d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
            fill="none"
            stroke="#00D8FF"
            strokeWidth="7"
            transform="rotate(30 57.65 50)"
          />
          <path
            d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
            fill="none"
            stroke="#00D8FF"
            strokeWidth="7"
            transform="rotate(90 57.65 50)"
          />
          <path
            d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
            fill="none"
            stroke="#00D8FF"
            strokeWidth="7"
            transform="rotate(150 57.65 50)"
          />
        </svg>
        <span>{name}</span>
      </span>
    );
  }

  if (isTS) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold font-mono tracking-tight text-blue-300 bg-gradient-to-r from-blue-500/[0.16] to-indigo-500/[0.08] border border-blue-400/35 shadow-[0_2px_14px_rgba(59,130,246,0.18),inset_0_1px_1px_rgba(255,255,255,0.22)] select-none">
        <svg className="w-3.5 h-3.5 rounded-[3px] shrink-0" viewBox="0 0 128 128" fill="none" aria-hidden="true">
          <rect width="128" height="128" rx="16" fill="#3178C6" />
          <path
            d="M74.4 77.2c2.4 4 6 6.3 11 6.3 4.3 0 7.3-2.1 7.3-5.2 0-3.6-3.7-4.8-9.8-7.5-8.5-3.6-13.8-8.2-13.8-17.1 0-10.4 8.2-18 20.8-18 8.6 0 14.8 2.8 19 9.8l-7.7 5.2c-2.3-3.8-5.3-5.3-9.5-5.3-4.5 0-6.7 2.3-6.7 4.9 0 3.3 3.3 4.5 9.7 7.3 9.4 4.1 14.2 8.7 14.2 17.5 0 11.5-8.8 18.5-22.3 18.5-10.4 0-17.8-3.7-22.1-11.4l9.2-5zm-44.8-39.7h37.4v9.6h-13.3v47.7h-10.9V47.1h-13.2v-9.6z"
            fill="#ffffff"
          />
        </svg>
        <span>{name}</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold font-mono tracking-tight text-neutral-200 bg-white/[0.06] border border-white/[0.14] shadow-[0_2px_8px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.15)] select-none">
      <span>{name}</span>
    </span>
  );
}

export function XUICodeBlock({
  code,
  language = "tsx",
  filename,
  frameworkBadge,
  badgeColor,
  accentBar = "bg-blue-500",
  extraActions,
}: XUICodeBlockProps) {
  return (
    <CodeBlock className="w-full shadow-2xl">
      {/* ── Header ── */}
      <div className="relative flex items-center justify-between px-4 py-2 border-b border-white/[0.07] min-h-[50px] overflow-visible">

        {/* Subtle header background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,255,255,0.035) 0%, transparent 60%)",
          }}
        />

        {/* Left: badge + filename */}
        <div className="relative flex items-center gap-2 pl-1 sm:pl-2">
          {/* Framework badge pill (if provided) */}
          {frameworkBadge && (
            <>
              <FrameworkBadge name={frameworkBadge} />
              <span className="text-white/[0.15] text-sm select-none">/</span>
            </>
          )}

          {/* Filename */}
          <span className="text-neutral-300 text-xs font-mono tracking-tight font-medium">
            {filename}
          </span>
        </div>

        {/* Right: actions */}
        <div className="relative flex items-center gap-2 py-2.5">
          <CopyButton
            text={code}
            className="px-2.5 py-1 rounded-lg border text-neutral-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.08] border-white/[0.09]"
          />
          {extraActions}
        </div>
      </div>

      <CodeBlockCode code={code} language={language} />
    </CodeBlock>
  );
}
