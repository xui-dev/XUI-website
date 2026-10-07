"use client";

import React, { useState } from "react";
import Link from "next/link";
import UserAvatar from "@/components/ui/UserAvatar";
import Navbar from "@/components/Navbar";
import AvatarCustomizerModal from "@/components/profile/AvatarCustomizerModal";
import NameEditorModal from "@/components/profile/NameEditorModal";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  User as UserIcon,
  Calendar,
  LogOut,
  Mail,
  ArrowLeft,
} from "lucide-react";

export default function ProfilePage() {
  const { user, signOut, openAuthModal } = useAuth();
  const { messages } = useLanguage();
  const t = messages.profile || {};

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <div className="p-4 mb-4 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)]">
            <UserIcon className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold mb-2 select-text">
            {t.signInTitle || "Sign in to view Profile"}
          </h2>
          <p className="text-sm text-neutral-400 mb-6 select-text">
            {t.signInDesc ||
              "Please sign in to access your personal developer dashboard and saved components."}
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("signin")}
            className="w-full py-3 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg cursor-pointer"
          >
            {t.signInBtn || "Sign In Now"}
          </button>
        </main>
      </div>
    );
  }

  const userMeta = user.user_metadata || {};
  const fullName =
    userMeta.full_name || userMeta.name || user.email?.split("@")[0] || "Developer";
  const avatarUrl = userMeta.avatar_url || userMeta.picture || null;
  const paletteIndex =
    typeof userMeta.avatar_palette === "number" ? userMeta.avatar_palette : null;

  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recent";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 flex flex-col justify-between">
      <Navbar />

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-28 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-60 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-6xl xl:max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Navigation / Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight select-text">
              {t.title || "Developer Profile"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 select-text">
              {t.subtitle ||
                "Manage your personal developer identity and account preferences."}
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.06] hover:bg-white/[0.1] text-neutral-300 hover:text-white transition-all w-fit self-start sm:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t.backHome || "Back to Home"}</span>
          </Link>
        </div>

        {/* Profile Header Card (Existing - Left intact) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0e101c]/80 backdrop-blur-2xl border border-white/[0.12] shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with Custom Geometric Shapes or Uploaded Photo */}
            <UserAvatar
              name={fullName}
              avatarUrl={avatarUrl}
              paletteIndex={paletteIndex}
              size={76}
              shape="circle"
              className="border border-white/20 shadow-xl"
            />

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight select-text">
                {fullName}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 font-mono mt-1 select-text">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-neutral-500 font-mono select-text">
                <Calendar className="w-3.5 h-3.5" />
                <span>
                  {t.memberSince || "Member since"} {createdAt}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => signOut()}
              className="px-4 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              title={t.signOut || "Sign Out"}
            >
              <LogOut className="w-4 h-4" />
              <span>{t.signOut || "Sign Out"}</span>
            </button>
          </div>
        </div>

        {/* Underneath: Individual Unified Cards for Each Element */}
        <div className="flex flex-col gap-4">
          {/* 1. Profile Avatar Card */}
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="group p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 hover:bg-[#121526] backdrop-blur-2xl border border-white/[0.12] hover:border-blue-500/40 shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <UserAvatar
                name={fullName}
                avatarUrl={avatarUrl}
                paletteIndex={paletteIndex}
                size={52}
                shape="circle"
                className="border border-white/20 shadow-md group-hover:scale-105 transition-transform"
              />
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors select-text">
                {t.avatarCard?.title || "Profile Avatar"}
              </h3>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {t.avatarCard?.action || "Customize"}
            </button>
          </div>

          {/* 2. Display Name Card */}
          <div
            onClick={() => setIsNameModalOpen(true)}
            className="group p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 hover:bg-[#121526] backdrop-blur-2xl border border-white/[0.12] hover:border-blue-500/40 shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <UserIcon className="w-5 h-5 text-neutral-300" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                  {t.nameCard?.title || "Display Name"}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mt-0.5 select-text">
                  {fullName}
                </h3>
              </div>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {t.nameCard?.action || "Edit Name"}
            </button>
          </div>

          {/* 3. Email Address Card (FIXED & READ-ONLY) */}
          <div
            className="p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 backdrop-blur-2xl border border-white/[0.12] shadow-xl flex items-center justify-between gap-4 cursor-default select-none"
          >
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-md shrink-0">
                <Mail className="w-5 h-5 text-neutral-300" />
              </div>
              <div>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider block">
                  {t.emailCard?.title || "Email Address"}
                </span>
                <h3 className="text-base font-bold text-white font-mono mt-0.5 select-text">
                  {user.email}
                </h3>
              </div>
            </div>

            <span className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-neutral-400">
              {t.emailCard?.readOnly || "Read-Only"}
            </span>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AvatarCustomizerModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        currentAvatarUrl={avatarUrl}
        currentPaletteIndex={paletteIndex}
        userName={fullName}
      />

      <NameEditorModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        currentName={fullName}
      />
    </div>
  );
}
