"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LanguageModal({
  isOpen,
  onClose,
}: LanguageModalProps) {
  const { messages } = useLanguage();
  const t = messages.settings?.languageModal || {};

  useEffect(() => {
    if (isOpen) {
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
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {t.title || "Interface Language"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {t.subtitle || "Select your preferred language for the XUI platform."}
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

            {/* Language Options */}
            <div className="space-y-3">
              {/* English */}
              <div className="p-4 rounded-2xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-between shadow-[0_0_20px_rgba(37,99,235,0.15)]">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-xs font-bold font-mono text-blue-300">
                    EN
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    {t.english || "English (US)"}
                  </h4>
                </div>

                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                </div>
              </div>
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
