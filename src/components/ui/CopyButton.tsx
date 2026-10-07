"use client";

import React, { useState } from "react";
import { Check, Copy, Terminal } from "lucide-react";

/** Keyframes injected globally once */
const KEYFRAMES = `
  @keyframes xui-ripple {
    0%   { opacity: 1; transform: scale(0.3); }
    100% { opacity: 0; transform: scale(2.8); }
  }
`;

interface CopyButtonProps {
  /** Text to copy to clipboard */
  text: string;
  /** Label shown before copy */
  label?: string;
  /** Label shown after copy */
  copiedLabel?: string;
  /** Icon variant: 'copy' (default) | 'terminal' */
  icon?: "copy" | "terminal";
  /** Extra class for the button container */
  className?: string;
  /** Stop click propagation (useful inside links) */
  stopPropagation?: boolean;
  /** Prevent default (useful inside links) */
  preventDefault?: boolean;
}

export default function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
  icon = "copy",
  className = "",
  stopPropagation = false,
  preventDefault = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [ripple, setRipple] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) e.stopPropagation();
    if (preventDefault) e.preventDefault();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <>
      {/* Inject keyframes once */}
      <style>{KEYFRAMES}</style>

      <button
        type="button"
        onClick={handleClick}
        style={{
          position: "relative",
          overflow: "hidden",
          transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
          transform: copied ? "scale(1.06)" : "scale(1)",
        }}
        className={`flex items-center gap-1.5 cursor-pointer select-none font-mono text-xs transition-colors duration-200
          ${copied
            ? "text-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.3)]"
            : ""
          }
          ${className}`}
      >
        {/* Ripple burst */}
        {ripple && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "inherit",
              background:
                "radial-gradient(circle, rgba(52,211,153,0.38) 0%, transparent 70%)",
              animation: "xui-ripple 0.6s ease-out forwards",
              pointerEvents: "none",
            }}
          />
        )}

        {/* "Before copy" content */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition:
              "opacity 0.15s ease, transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
            opacity: copied ? 0 : 1,
            transform: copied
              ? "scale(0.5) rotate(-15deg)"
              : "scale(1) rotate(0deg)",
            position: copied ? "absolute" : "relative",
            pointerEvents: "none",
          }}
        >
          {icon === "terminal" ? (
            <Terminal className="h-3.5 w-3.5 text-blue-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
          <span className="font-sans">{label}</span>
        </span>

        {/* "After copy" content */}
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition:
              "opacity 0.2s ease 0.05s, transform 0.25s cubic-bezier(0.34,1.56,0.64,1) 0.05s",
            opacity: copied ? 1 : 0,
            transform: copied
              ? "scale(1) rotate(0deg)"
              : "scale(0.5) rotate(15deg)",
            position: copied ? "relative" : "absolute",
            pointerEvents: "none",
          }}
        >
          <Check className="h-3.5 w-3.5" />
          <span className="font-sans">{copiedLabel}</span>
        </span>
      </button>
    </>
  );
}
