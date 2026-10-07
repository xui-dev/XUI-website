"use client";

import React, { useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthCard from "./AuthCard";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, authMode } = useAuth();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAuthModal();
      }
    },
    [closeAuthModal]
  );

  useEffect(() => {
    if (isAuthModalOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthModalOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* ── Translucent Scrim (Allows background robot & content to stay softly visible) ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeAuthModal}
            className="fixed inset-0 bg-black/65 backdrop-blur-md cursor-pointer"
          />

          {/* ── Unified XUI Obsidian Dock Modal ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{
              type: "spring",
              stiffness: 340,
              damping: 28,
            }}
            className="relative z-10 w-full max-w-md my-auto rounded-[28px] sm:rounded-[32px] overflow-hidden"
          >
            {/* Close Button (Matching XUI dock pills) */}
            <button
              type="button"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 z-30 p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.14] border border-white/[0.12] text-neutral-400 hover:text-white backdrop-blur-xl shadow-lg transition-all duration-200 active:scale-90 cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>

            <AuthCard
              initialMode={authMode}
              onSuccess={closeAuthModal}
              isModal={true}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
