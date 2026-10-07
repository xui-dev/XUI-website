"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Lock, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

interface NameEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export default function NameEditorModal({
  isOpen,
  onClose,
  currentName,
}: NameEditorModalProps) {
  const { user, updateUserProfile } = useAuth();
  const { messages } = useLanguage();
  const t = messages.profile?.nameModal || {};

  const [newName, setNewName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Check 7-day cooldown
  const nameUpdatedAt = user?.user_metadata?.name_updated_at;
  const lastUpdatedTime = nameUpdatedAt ? new Date(nameUpdatedAt).getTime() : 0;
  const timeSinceLastUpdate = Date.now() - lastUpdatedTime;
  const isCooldownActive = Boolean(lastUpdatedTime > 0 && timeSinceLastUpdate < SEVEN_DAYS_MS);

  // Calculate remaining time
  const remainingMs = Math.max(0, SEVEN_DAYS_MS - timeSinceLastUpdate);
  const remainingDays = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
  const remainingHours = Math.floor(
    (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
  );
  const remainingMinutes = Math.floor(
    (remainingMs % (60 * 60 * 1000)) / (60 * 1000)
  );

  const formattedRemainingTime =
    remainingDays > 0
      ? `${remainingDays}d ${remainingHours}h`
      : `${remainingHours}h ${remainingMinutes}m`;

  useEffect(() => {
    if (isOpen) {
      setNewName(currentName);
      setErrorMsg(null);
      setIsSaving(false);

      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, currentName, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCooldownActive) return;

    const trimmed = newName.trim();
    if (trimmed.length < 2) {
      setErrorMsg(t.minCharError || "Name must be at least 2 characters.");
      return;
    }
    if (trimmed.length > 50) {
      setErrorMsg(t.maxCharError || "Name cannot exceed 50 characters.");
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const { error } = await updateUserProfile({
        full_name: trimmed,
        name_updated_at: new Date().toISOString(),
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        onClose();
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMsg(e.message || "Failed to update name");
    } finally {
      setIsSaving(false);
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
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {t.title || "Edit Display Name"}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1">
              {t.subtitle || "Update your publicly visible developer name."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs">
            {errorMsg}
          </div>
        )}

        {/* Cooldown Active Banner */}
        {isCooldownActive ? (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-200">
                {t.lockedTitle || "Name Change Locked"}
              </h4>
              <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
                {t.lockedNotice ||
                  "You recently changed your display name. Names can only be changed once every 7 days."}
              </p>
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-xs font-mono font-bold text-amber-200">
                <span>
                  {(t.lockedTimeLeft || "Cooldown expires in: {time}").replace(
                    "{time}",
                    formattedRemainingTime
                  )}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Warning rule notice when unlocked */
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/25 text-blue-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed">
              {t.cooldownWarning ||
                "Important: You can only change your name once every 7 days. Choose carefully."}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label
              htmlFor="full_name_input"
              className="text-xs font-semibold text-neutral-300 block mb-2"
            >
              {t.inputLabel || "New Display Name"}
            </label>
            <div className="relative">
              <input
                id="full_name_input"
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={isCooldownActive || isSaving}
                maxLength={50}
                placeholder={t.inputPlaceholder || "Enter your full name"}
                className={`w-full py-3 px-4 rounded-xl bg-black/40 border text-sm text-white placeholder-neutral-500 focus:outline-none transition-all ${
                  isCooldownActive
                    ? "border-white/10 opacity-60 cursor-not-allowed"
                    : "border-white/20 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50"
                }`}
              />
              {isCooldownActive && (
                <div className="absolute right-3.5 top-3.5 text-neutral-500">
                  <Lock className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex justify-between items-center mt-1.5 px-1">
              <span className="text-[11px] text-neutral-500 font-mono">
                Min 2, max 50 characters
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {newName.length}/50
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {isCooldownActive ? (t.close || "Close") : (t.cancelBtn || "Cancel")}
            </button>

            {!isCooldownActive && (
              <button
                type="submit"
                disabled={isSaving || newName.trim().length < 2 || newName.trim() === currentName}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.saving || "Saving..."}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{t.saveBtn || "Save Name"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
}
