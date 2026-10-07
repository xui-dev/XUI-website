"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Share2,
  X,
  ExternalLink,
  MessageCircle,
  Send,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import CopyButton from "@/components/ui/CopyButton";

export interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  componentId: string;
  title: string;
  description?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  componentId,
  title,
  description,
}: ShareModalProps) {
  const { messages, dir } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Compute full share URL safely on client
  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setShareUrl(`${origin}/components/${componentId}`);
      if (typeof navigator !== "undefined" && !!navigator.share) {
        setCanNativeShare(true);
      }
    }
  }, [componentId]);

  // Handle Escape key to close
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);


  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `XUI — ${title}`,
          text: description || `Check out this component on XUI: ${title}`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    }
  };

  // Social share URLs
  const encodedUrl = encodeURIComponent(shareUrl);
  const shareText = encodeURIComponent(
    `Check out ${title} on XUI — Next-gen UI library:`
  );

  const twitterUrl = `https://twitter.com/intent/tweet?text=${shareText}&url=${encodedUrl}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-md my-auto rounded-3xl sm:rounded-[28px] bg-[#0d101a]/95 backdrop-blur-2xl border border-white/[0.14] p-5 sm:p-6 text-white shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.25)] overflow-hidden"
          >
            {/* Top specular glow line */}
            <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/40 to-transparent" />

            {/* Header: Title + Close button */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {messages.share?.title || "Share Component"}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 font-medium">
                    {title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-400 hover:text-white transition-all cursor-pointer active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                aria-label="Close share dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Link Input & Copy Button Box */}
            <div className="flex flex-col gap-2 mb-5">
              <label className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                {messages.share?.copyLink || "Component Link"}
              </label>

              <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/[0.12] focus-within:border-blue-500/60 transition-colors">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="flex-1 bg-transparent px-3 text-xs sm:text-sm font-mono text-neutral-200 outline-none select-all truncate"
                />

                <CopyButton
                  text={shareUrl}
                  label={messages.share?.copyBtn || "Copy"}
                  copiedLabel={messages.share?.copied || "Copied!"}
                  className={`px-3.5 py-2 rounded-xl font-semibold shrink-0
                    bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500
                    text-white shadow-[0_4px_12px_rgba(37,99,235,0.35)]`}
                />
              </div>
            </div>

            {/* Social Share Icons */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col gap-3">
              <span className="text-[11px] font-mono text-neutral-400">
                {messages.share?.socials || "Share via social platforms:"}
              </span>

              <div className="grid grid-cols-4 gap-2">
                {/* X (Twitter) */}
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.2] transition-all text-neutral-300 hover:text-white group cursor-pointer"
                  title="Share on X"
                >
                  <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  <span className="text-[10px] font-medium">X</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/10 border border-white/[0.08] hover:border-emerald-500/30 transition-all text-neutral-300 hover:text-emerald-400 group cursor-pointer"
                  title="Share on WhatsApp"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium">WhatsApp</span>
                </a>

                {/* Telegram */}
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/[0.04] hover:bg-cyan-500/10 border border-white/[0.08] hover:border-cyan-500/30 transition-all text-neutral-300 hover:text-cyan-400 group cursor-pointer"
                  title="Share on Telegram"
                >
                  <Send className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-medium">Telegram</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-white/[0.04] hover:bg-blue-500/10 border border-white/[0.08] hover:border-blue-500/30 transition-all text-neutral-300 hover:text-blue-400 group cursor-pointer"
                  title="Share on LinkedIn"
                >
                  <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.46 1.46 0 1 0-.01-2.92 1.46 1.46 0 0 0 .01 2.92M7.86 18.5V10.13H5.07V18.5h2.79z" />
                  </svg>
                  <span className="text-[10px] font-medium">LinkedIn</span>
                </a>
              </div>

              {/* Native Device Share (if available on mobile/macOS) */}
              {canNativeShare && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="mt-1 w-full py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] text-xs text-neutral-400 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{messages.share?.nativeShare || "More options on your device..."}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
