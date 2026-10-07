"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, LifeBuoy, Mail, BookOpen, Copy, Check, ExternalLink } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SupportModal({
  isOpen,
  onClose,
}: SupportModalProps) {
  const { messages } = useLanguage();
  const t = messages.settings?.supportModal || {};

  const [copied, setCopied] = useState(false);
  const supportEmail = t.emailAddress || "support@xui.dev";

  useEffect(() => {
    if (isOpen) {
      setCopied(false);
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Scrim */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
            }}
            className="relative z-10 w-full max-w-lg my-auto rounded-3xl bg-[#0c0e18] border border-white/[0.14] shadow-2xl p-6 sm:p-8 flex flex-col gap-6 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {t.title || "Help & Support"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {t.subtitle || "Need assistance, have feedback, or found a bug? We are here to help."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
                title={t.close || "Close"}
                aria-label={t.close || "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Email Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>{t.emailTitle || "Direct Support Email"}</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  24/7 Response
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <p className="text-sm font-semibold text-white font-mono">
                  {supportEmail}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-xs font-semibold text-neutral-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">{t.copied || "Copied!"}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>{t.copyEmail || "Copy Email"}</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`mailto:${supportEmail}?subject=XUI%20Platform%20Support%20Request`}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all cursor-pointer shrink-0"
                  >
                    <span>{t.sendEmail || "Send Email"}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Docs & Tutorials Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-2 rounded-xl bg-white/[0.04] text-blue-400 shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    {t.docsTitle || "Documentation & Guides"}
                  </h4>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {t.docsDesc || "Explore API references and kinetic component integration tutorials."}
                  </p>
                </div>
              </div>

              <Link
                href="/docs"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all shrink-0"
              >
                {t.openDocs || "Browse Docs"}
              </Link>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-neutral-300 hover:text-white transition-all cursor-pointer"
              >
                {t.close || "Close"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
