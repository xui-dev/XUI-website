"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const { locale, dir } = useLanguage();
  const router = useRouter();

  // If user is already logged in, redirect them back to home
  useEffect(() => {
    if (!isLoading && user) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  return (
    <div
      dir="ltr"
      className="relative min-h-screen w-full bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 overflow-hidden flex flex-col justify-center items-center px-4 sm:px-6 py-12"
    >
      {/* ── Ambient Background Glows (Matching XUI Components Page) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-60 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      {/* ── Top Floating Navigation Bar (Back Button) ── */}
      <div className="relative z-20 w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#121216]/80 hover:bg-[#1a1c26] border border-white/[0.14] backdrop-blur-xl text-xs sm:text-sm font-medium text-neutral-300 hover:text-white transition-all duration-200 shadow-lg active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Home</span>
        </Link>

        <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold px-2.5 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30">
          XUI Platform
        </span>
      </div>

      {/* ── Auth Card Container ── */}
      <div className="relative z-10 w-full flex justify-center">
        <AuthCard onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
}
