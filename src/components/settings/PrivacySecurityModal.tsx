"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Lock, CheckCircle2, LogOut, KeyRound, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface PrivacySecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacySecurityModal({
  isOpen,
  onClose,
}: PrivacySecurityModalProps) {
  const { user, signOut, openAuthModal } = useAuth();
  const { messages } = useLanguage();
  const t = messages.settings?.privacyModal || {};

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

  const provider = user?.app_metadata?.provider || (user?.email ? "Email" : "None");

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
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {t.title || "Privacy & Security"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {t.subtitle || "Review your active security configurations and session details."}
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

            {/* Session Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  {t.sessionTitle || "Authentication Session"}
                </span>
                {user ? (
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {t.activeSession || "Active & Encrypted"}
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] text-neutral-400 text-[11px] font-medium">
                    {t.guest || "Guest"}
                  </span>
                )}
              </div>

              {user ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div>
                    <p className="text-sm font-semibold text-white font-mono truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-neutral-400 capitalize">
                      Provider: <span className="text-neutral-200">{provider}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      signOut();
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.signOutBtn || "Sign Out"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <p className="text-xs text-neutral-400">
                    {t.signInNotice || "Sign in to manage active authentication sessions and credentials."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal("signin");
                    }}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer shrink-0"
                  >
                    {t.signInBtn || "Sign In Now"}
                  </button>
                </div>
              )}
            </div>

            {/* Security Standards */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-white/[0.04] text-blue-400 shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  {t.securityStatus || "Security & Encryption"}
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  {t.securityDesc || "End-to-end TLS 1.3 encryption with Supabase JWT authentication. Zero third-party telemetry or ad-trackers."}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
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
