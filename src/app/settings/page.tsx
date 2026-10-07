"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PrivacySecurityModal from "@/components/settings/PrivacySecurityModal";
import LanguageModal from "@/components/settings/LanguageModal";
import SupportModal from "@/components/settings/SupportModal";
import { useLanguage } from "@/context/LanguageContext";
import {
  User as UserIcon,
  Shield,
  Globe,
  LifeBuoy,
  ArrowLeft,
} from "lucide-react";

export default function SettingsPage() {
  const { messages } = useLanguage();
  const t = messages.settings || {};

  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

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
              {t.title || "Platform Settings"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-1 select-text">
              {t.subtitle || "Manage your preferences, security, and account settings."}
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

        {/* 4 Unified Cards Matching Profile Page */}
        <div className="flex flex-col gap-4">
          {/* 1. Profile (البروفايل) */}
          <Link
            href="/profile"
            className="group p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 hover:bg-[#121526] backdrop-blur-2xl border border-white/[0.12] hover:border-blue-500/40 shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <UserIcon className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors select-text">
                {t.profileCard?.title || "Profile"}
              </h3>
            </div>

            <span className="px-4 py-2 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all">
              {t.profileCard?.action || "View"}
            </span>
          </Link>

          {/* 2. Privacy & Security (الخصوصية والامان) */}
          <div
            onClick={() => setIsPrivacyModalOpen(true)}
            className="group p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 hover:bg-[#121526] backdrop-blur-2xl border border-white/[0.12] hover:border-blue-500/40 shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Shield className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors select-text">
                {t.privacyCard?.title || "Privacy & Security"}
              </h3>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {t.privacyCard?.action || "Manage"}
            </button>
          </div>

          {/* 3. Language (اللغة) */}
          <div
            onClick={() => setIsLanguageModalOpen(true)}
            className="group p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 hover:bg-[#121526] backdrop-blur-2xl border border-white/[0.12] hover:border-blue-500/40 shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Globe className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors select-text">
                {t.languageCard?.title || "Language"}
              </h3>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {t.languageCard?.action || "English"}
            </button>
          </div>

          {/* 4. Support (الدعم) */}
          <div
            onClick={() => setIsSupportModalOpen(true)}
            className="group p-5 sm:p-6 rounded-2xl bg-[#0e101c]/80 hover:bg-[#121526] backdrop-blur-2xl border border-white/[0.12] hover:border-blue-500/40 shadow-xl transition-all duration-200 cursor-pointer flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-[52px] h-[52px] rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-300 shadow-md group-hover:scale-105 transition-transform shrink-0">
                <LifeBuoy className="w-5 h-5 text-neutral-300" />
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors select-text">
                {t.supportCard?.title || "Support"}
              </h3>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600/10 group-hover:bg-blue-600/20 border border-blue-500/25 text-blue-400 text-xs font-semibold transition-all cursor-pointer"
            >
              {t.supportCard?.action || "Contact"}
            </button>
          </div>
        </div>
      </main>

      {/* Interactive Modals */}
      <PrivacySecurityModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <LanguageModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
      />

      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />
    </div>
  );
}
