"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserAvatar from "@/components/ui/UserAvatar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  LogOut,
  User as UserIcon,
  Bookmark,
  Settings,
  BookOpen,
  Flag,
  ChevronDown,
} from "lucide-react";

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const { messages } = useLanguage();
  const t = messages.auth?.userMenu || {};

  const [isOpen, setIsOpen] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      setIsLocalhost(
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname === "[::1]"
      );
    }
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!user) return null;

  const userMetadata = user.user_metadata || {};
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;
  const paletteIndex =
    typeof userMetadata.avatar_palette === "number"
      ? userMetadata.avatar_palette
      : null;
  const fullName =
    userMetadata.full_name ||
    userMetadata.name ||
    user.email?.split("@")[0] ||
    "User";
  const userInitial = fullName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      {/* ── Navbar Liquid Glass User Trigger Pill ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="group relative overflow-hidden flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl
                   bg-white/[0.08] hover:bg-white/[0.15] active:bg-white/[0.2]
                   border border-white/20 hover:border-white/35
                   shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.4)]
                   transition-all duration-200 cursor-pointer"
        aria-expanded={isOpen}
      >
        {/* Specular sheen */}
        <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/15 to-transparent rounded-xl" />

        {/* User Avatar with Custom Geometric Shapes (GitHub Identicon style) */}
        <UserAvatar
          name={fullName}
          avatarUrl={avatarUrl}
          paletteIndex={paletteIndex}
          size={26}
        />

        {/* Name / Short label */}
        <span className="text-xs font-semibold text-neutral-200 group-hover:text-white max-w-[90px] sm:max-w-[120px] truncate">
          {fullName}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Dropdown Menu (Liquid Glass Aesthetic) ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 rounded-3xl p-3 bg-[#0e121c]/90 backdrop-blur-3xl border border-white/[0.14] shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.25)] z-50 overflow-hidden"
          >
            {/* Top specular highlight */}
            <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

          {/* User Details Header */}
          <div className="p-2.5 mb-2 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
            <div className="flex items-center gap-3">
              <UserAvatar
                name={fullName}
                avatarUrl={avatarUrl}
                paletteIndex={paletteIndex}
                size={36}
              />
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold text-white truncate">
                  {fullName}
                </p>
                <p className="text-[11px] text-neutral-400 truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-0.5 mb-2">
            {/* 1. Profile */}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <UserIcon className="w-4 h-4 text-white" />
              <span>{t.profile || "Profile"}</span>
            </Link>

            {/* 2. Saved Items */}
            <Link
              href="/saved"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Bookmark className="w-4 h-4 text-white" />
              <span>{t.myFavorites || "Saved Items"}</span>
            </Link>

            {/* 3. Settings */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Settings className="w-4 h-4 text-white" />
              <span>{t.settings || "Settings"}</span>
            </Link>

            {/* 4. Docs */}
            <Link
              href="/docs"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <BookOpen className="w-4 h-4 text-white" />
              <span>{t.docs || "Docs"}</span>
            </Link>

            {/* 5. Report & Feedback */}
            <a
              href="mailto:support@xui.dev?subject=XUI%20Feedback%20%2F%20Issue%20Report"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
            >
              <Flag className="w-4 h-4 text-white" />
              <span>{t.report || "Report & Feedback"}</span>
            </a>

            {/* Admin Dashboard (only visible for designated admin when on localhost) */}
            {isLocalhost && user.email?.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "xui.dev.off@gmail.com").toLowerCase() && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.20] transition-all mt-1"
              >
                <span>Admin Dashboard</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.12] text-neutral-300">
                  Admin
                </span>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/[0.08] my-1" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              signOut();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.signOut || "Sign Out"}</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
    </div>
  );
}
