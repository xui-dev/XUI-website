"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import XUILogo from "@/components/XUILogo";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/auth/UserMenu";
import {
  Menu,
  X,
  Settings,
  User as UserIcon,
  Bookmark,
  BookOpen,
  Flag,
  LogOut,
  LogIn,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Navbar() {
  const { messages, dir } = useLanguage();
  const { user, signOut, openAuthModal, isAuthModalOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const t = messages.navbar;

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

  const userMetadata = user?.user_metadata || {};
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || null;
  const paletteIndex =
    typeof userMetadata.avatar_palette === "number"
      ? userMetadata.avatar_palette
      : null;
  const fullName =
    userMetadata.full_name ||
    userMetadata.name ||
    user?.email?.split("@")[0] ||
    "User";
  const userInitial = fullName.charAt(0).toUpperCase();

  return (
    <header className="fixed top-3 sm:top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.25rem)] sm:w-[calc(100%-3.5rem)] lg:w-[calc(100%-5rem)] max-w-[1720px] pointer-events-none flex flex-col items-center transition-all duration-300">
      {/* ══════════════════════════════════════════════════════════════════
          DESKTOP NAVIGATION (Dual Island Dock on sm and up)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="hidden sm:flex items-center justify-between w-full gap-3">
        {/* ── Island 1: Main Navigation Dock (Logo + Links) ── */}
        <nav
          dir={dir}
          className="pointer-events-auto relative flex items-center gap-2.5 sm:gap-4 px-3 sm:px-5 py-2 sm:py-2.5
                     rounded-2xl sm:rounded-[22px]
                     bg-[#121216]/65 backdrop-blur-2xl backdrop-saturate-180
                     border border-white/[0.14]
                     transition-all duration-300 ease-out overflow-x-auto no-scrollbar"
          style={{
            boxShadow:
              "0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.6)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {/* Apple Liquid Glass Top Specular Sheen */}
          <div className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent rounded-full" />

          {/* 1. Left Section: Logo + Beta Badge */}
          <div className="flex items-center shrink-0">
            <Link
              href="/"
              className="flex items-center gap-2 transition-transform duration-200 hover:scale-105 active:scale-95"
              aria-label="XUI Home"
            >
              <XUILogo height={22} color="#ffffff" />
              <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-mono font-medium tracking-wider text-white bg-white/[0.08] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] select-none leading-none">
                beta
              </span>
            </Link>
          </div>

          {/* Hairline vertical divider */}
          <div className="w-px h-4 bg-white/15 shrink-0" />

          {/* 2. Center Section: 3 Navigation Items */}
          <ul className="flex items-center gap-1 sm:gap-1.5 list-none m-0 p-0">
            <li>
              <Link
                href="/components"
                className="relative px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium text-neutral-300 hover:text-white 
                           hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200 whitespace-nowrap"
              >
                {t?.links?.components || "Components"}
              </Link>
            </li>
            <li>
              <Link
                href="/components?category=3d-web-templates"
                className="relative px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium text-neutral-300 hover:text-white 
                           hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200 whitespace-nowrap"
              >
                3D web templates
              </Link>
            </li>
            <li>
              <Link
                href="/docs"
                className="relative px-2.5 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-medium text-neutral-300 hover:text-white 
                           hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200 whitespace-nowrap"
              >
                Docs
              </Link>
            </li>
          </ul>

          {/* Hairline vertical divider */}
          <div className="w-px h-4 bg-white/15 shrink-0" />

          {/* Settings Icon Pill (replacing language switcher) */}
          <Link
            href="/settings"
            className="flex items-center justify-center p-1.5 sm:p-2 rounded-xl text-neutral-400 hover:text-white 
                       bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] transition-all duration-200 cursor-pointer active:scale-95 shrink-0 group"
            title="Settings"
            aria-label="Settings"
          >
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-400 group-hover:text-white group-hover:rotate-45 transition-transform duration-300" />
          </Link>
        </nav>

        {/* ── Island 2: Standalone Action Dock (Sign In Pill or User Menu) ── */}
        <div
          dir={dir}
          className="pointer-events-auto relative flex items-center p-1 sm:p-1.5
                     rounded-2xl sm:rounded-[22px]
                     bg-[#121216]/65 backdrop-blur-2xl backdrop-saturate-180
                     border border-white/[0.14]
                     transition-all duration-300 ease-out shrink-0"
          style={{
            boxShadow:
              "0 24px 60px -12px rgba(0, 0, 0, 0.85), inset 0 1px 1px 0 rgba(255, 255, 255, 0.22), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.6)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
          }}
        >
          {/* Apple Liquid Glass Top Specular Sheen */}
          <div className="pointer-events-none absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent rounded-full" />

          {/* If logged in, show Liquid Glass UserMenu */}
          {user ? (
            <UserMenu />
          ) : (
            <button
              type="button"
              onClick={() => openAuthModal("signin")}
              className="relative group overflow-hidden px-4 sm:px-5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-white
                         bg-white/[0.10] hover:bg-white/[0.18] active:bg-white/[0.24]
                         backdrop-blur-2xl backdrop-saturate-200
                         border border-white/20 hover:border-white/35
                         shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.4)]
                         transition-colors duration-200 active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/25 to-transparent" />
              <span className="relative z-10 whitespace-nowrap">{t.signIn}</span>
            </button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          MOBILE NAVIGATION (Minimal Dock + Full Drawer Sidebar on < sm)
      ══════════════════════════════════════════════════════════════════ */}
      <div className="flex sm:hidden flex-col w-full pointer-events-auto relative">
        {/* ── Minimalist Top Dock (Logo + Menu Toggle Only) ── */}
        <div
          dir={dir}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl
                     bg-[#10121a]/85 backdrop-blur-2xl backdrop-saturate-200
                     border border-white/[0.15] shadow-[0_16px_40px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.22)]"
        >
          {/* Logo + Beta Badge */}
          <Link
            href="/"
            className="flex items-center gap-1.5 shrink-0 pr-1"
            aria-label="XUI Home"
            onClick={() => setMobileMenuOpen(false)}
          >
            <XUILogo height={20} color="#ffffff" />
            <span className="px-1.5 py-0.5 rounded-[5px] text-[9px] font-mono font-medium tracking-wider text-white bg-white/[0.08] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] select-none leading-none">
              beta
            </span>
          </Link>

          {/* Right Actions: Settings + Menu Toggle */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center p-2 rounded-xl text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] transition-all duration-200 cursor-pointer active:scale-95 group"
              title="Settings"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:rotate-45 transition-transform duration-300" />
            </Link>

            {/* Hamburger Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-neutral-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] active:scale-95 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/60"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-blue-400" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* ── Expandable Mobile Frosted Sidebar Drawer ── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 p-3.5 rounded-3xl bg-[#0c0e18]/95 backdrop-blur-3xl border border-white/[0.14] shadow-[0_24px_50px_rgba(0,0,0,0.95)] flex flex-col gap-2.5 z-50 max-h-[85vh] overflow-y-auto"
            >
              {/* 1. Account Section (User Details or Sign In Button) */}
              {user ? (
                <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex flex-col gap-3">
                  {/* User info Header */}
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      name={fullName}
                      avatarUrl={avatarUrl}
                      paletteIndex={paletteIndex}
                      size={40}
                    />
                    <div className="overflow-hidden flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {fullName}
                      </p>
                      <p className="text-xs text-neutral-400 truncate font-mono">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {/* Profile & User Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/[0.06]">
                    <Link
                      href="/profile"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-white" />
                      <span>Profile</span>
                    </Link>

                    <Link
                      href="/saved"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-white" />
                      <span>Saved</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <Settings className="w-4 h-4 text-white" />
                      <span>Settings</span>
                    </Link>

                    <Link
                      href="/docs"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-white" />
                      <span>Docs</span>
                    </Link>
                  </div>

                  {/* Report + Sign Out row */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-white/[0.06] text-xs">
                    <a
                      href="mailto:support@xui.dev?subject=XUI%20Feedback%20%2F%20Issue%20Report"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Flag className="w-3.5 h-3.5 text-white" />
                      <span>Report</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        signOut();
                      }}
                      className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>

                  {/* Admin link if designated admin AND on localhost */}
                  {isLocalhost && user.email?.toLowerCase() === (process.env.NEXT_PUBLIC_ADMIN_EMAIL || "xui.dev.off@gmail.com").toLowerCase() && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-neutral-200 hover:text-white bg-white/[0.05] hover:bg-white/[0.10] border border-white/[0.10] hover:border-white/[0.20] transition-all"
                    >
                      <span>Admin Dashboard</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-white/[0.08] border border-white/[0.12] text-neutral-300">
                        Admin
                      </span>
                    </Link>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("signin");
                  }}
                  className="relative group overflow-hidden w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/[0.10] hover:bg-white/[0.16] active:bg-white/[0.22] backdrop-blur-2xl backdrop-saturate-200 border border-white/20 hover:border-white/30 shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_8px_24px_rgba(0,0,0,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <LogIn className="w-4 h-4 text-neutral-200" />
                  <span className="relative z-10">{t.signIn || "Sign In / Create Account"}</span>
                </button>
              )}

              {/* 2. Navigation Links */}
              <nav aria-label="Mobile navigation" className="flex flex-col gap-0.5 pt-1">
                <Link
                  href="/components"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200"
                >
                  {t?.links?.components || "Components"}
                </Link>

                <Link
                  href="/components?category=3d-web-templates"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200"
                >
                  3D web templates
                </Link>

                <Link
                  href="/docs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-2.5 rounded-xl text-sm font-medium text-neutral-300 hover:text-white hover:bg-white/[0.08] active:bg-white/[0.12] transition-all duration-200"
                >
                  Docs
                </Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

