"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  BadgeCheck,
  Globe,
  ExternalLink,
  Calendar,
} from "lucide-react";

function GithubIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

export interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  author?: string;
  authorHandle?: string;
  authorAvatar?: string;
}

export default function CreatorProfileModal({
  isOpen,
  onClose,
  author = "XUI",
  authorHandle = "@xui_dev",
  authorAvatar = "/XUI.png",
}: CreatorProfileModalProps) {
  const [mounted, setMounted] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  const isXUI = author.toUpperCase() === "XUI";
  const displayName = isXUI ? "XUI Platform" : author;
  const displayHandle = isXUI ? "@xui_dev" : authorHandle;

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
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 15 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-lg my-auto rounded-3xl sm:rounded-[32px] bg-[#0c0e18]/95 backdrop-blur-3xl border border-white/[0.14] text-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.95),inset_0_1px_1px_rgba(255,255,255,0.22)] overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white/80 hover:text-white transition-all cursor-pointer active:scale-90 z-20 backdrop-blur-md"
              aria-label="Close Profile"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Avatar Row */}
            <div className="pt-6 px-6 relative flex items-center justify-between pr-16 mb-4">
              <div className="relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl p-1 bg-[#0c0e18] border-2 border-white/20 shadow-xl overflow-hidden flex items-center justify-center">
                  {!imgError ? (
                    <img
                      src={authorAvatar}
                      alt={author}
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white uppercase">
                      {author.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Verified Badge Icon */}
                <div
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white border-2 border-[#0c0e18] shadow-md"
                  title="Verified Official Platform"
                >
                  <BadgeCheck className="w-4 h-4 fill-white text-blue-600" />
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="px-6 pb-6 flex flex-col gap-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {displayName}
                </h2>
                <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-0.5">
                  {displayHandle}
                </p>
              </div>

              {/* Bio */}
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {isXUI
                  ? "The official core account of XUI Platform. Curating and engineering next-generation, physics-based animated components and 3D web experiences."
                  : `Creator and maintainer contributing components to the XUI ecosystem.`}
              </p>

              {/* 5. Verified Links */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href="https://github.com/xui-dev/XUI-components-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>GitHub</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>

                <Link
                  href="/"
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  <span>xui.dev</span>
                </Link>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-neutral-500 ml-auto">
                  <Calendar className="w-3 h-3" />
                  <span>Verified 2026</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
