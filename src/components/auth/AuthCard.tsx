"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import XUILogo from "@/components/XUILogo";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface AuthCardProps {
  initialMode?: "signin" | "signup";
  onSuccess?: () => void;
  isModal?: boolean;
}

export default function AuthCard({
  initialMode = "signin",
  onSuccess,
  isModal = false,
}: AuthCardProps) {
  const { signInWithGoogle, signInWithGithub, signInWithEmail, signUpWithEmail } = useAuth();
  const { messages } = useLanguage();
  const t = messages.auth || {};

  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle GitHub OAuth
  const handleGithubSignIn = async () => {
    try {
      setLoadingGithub(true);
      setErrorMessage(null);
      const { error } = await signInWithGithub();
      if (error) {
        setErrorMessage(error.message || "Failed to sign in with GitHub");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e?.message || "Failed to sign in with GitHub");
    } finally {
      setLoadingGithub(false);
    }
  };

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMessage(null);
      const { error } = await signInWithGoogle();
      if (error) {
        setErrorMessage(error.message || t.errorGeneral || "Failed to sign in with Google");
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e?.message || t.errorGeneral || "Failed to sign in with Google");
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Handle Email Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage("Please enter your email and password");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    setLoadingSubmit(true);

    try {
      if (mode === "signin") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setErrorMessage(error.message);
        } else {
          if (onSuccess) onSuccess();
        }
      } else {
        const { error } = await signUpWithEmail(email, password, fullName);
        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage(
            t.successSignUp || "Account created! Check your email to confirm."
          );
          if (onSuccess) onSuccess();
        }
      }
    } catch (err: unknown) {
      const e = err as Error;
      setErrorMessage(e?.message || t.errorGeneral || "Authentication failed");
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <div
      dir="ltr"
      className={`relative w-full overflow-hidden transition-all duration-300 ${
        isModal ? "p-6 sm:p-8" : "max-w-md p-8 sm:p-9 rounded-[28px] sm:rounded-[32px]"
      } rounded-[28px] sm:rounded-[32px] bg-[#0c0e18]/85 backdrop-blur-2xl backdrop-saturate-180 border border-white/[0.14]`}
      style={{
        boxShadow:
          "0 28px 70px -14px rgba(0, 0, 0, 0.95), 0 0 50px -10px rgba(0, 229, 255, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 0.25), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.7)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
      }}
    >
      {/* ── Top Specular Sheen (Exact match with Navbar dock) ── */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent rounded-full" />

      {/* ── Subsurface Laser Flare (Exact match with MacCodeCard) ── */}
      <div
        className="pointer-events-none absolute -bottom-16 -right-16 w-60 h-60 rounded-full blur-[60px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(0, 229, 255, 0.8) 0%, rgba(64, 106, 218, 0.4) 50%, transparent 80%)",
        }}
      />

      {/* ── Header: Logo + Title + Subtitle ── */}
      <div className="relative z-10 flex flex-col items-center text-center mb-6">
        <div className="mb-3.5 p-2.5 rounded-2xl bg-[#121216]/80 border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]">
          <XUILogo height={22} color="#ffffff" />
        </div>

        <h2 className="text-2xl sm:text-[26px] font-bold text-white tracking-tight">
          {mode === "signin"
            ? t.titleSignIn || "Welcome Back"
            : t.titleSignUp || "Create Account"}
        </h2>

        <p className="mt-1 text-xs sm:text-[13px] text-neutral-400 max-w-xs leading-relaxed font-normal">
          {mode === "signin"
            ? t.subtitleSignIn || "Continue crafting next-gen interfaces with XUI"
            : t.subtitleSignUp || "Join the elite community of creative developers"}
        </p>
      </div>

      {/* ── Tab Switcher (Matches MacCodeCard framework switcher) ── */}
      <div className="relative z-10 mb-5 p-1 rounded-2xl bg-[#080913]/90 border border-white/[0.10] shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)] flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            setMode("signin");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            mode === "signin"
              ? "bg-gradient-to-b from-white/[0.20] to-white/[0.08] text-white border border-white/[0.22] shadow-[0_4px_16px_rgba(0,229,255,0.22),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          {t.signInBtn || "Sign In"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode("signup");
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
          className={`flex-1 py-1.5 sm:py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
            mode === "signup"
              ? "bg-gradient-to-b from-white/[0.20] to-white/[0.08] text-white border border-white/[0.22] shadow-[0_4px_16px_rgba(0,229,255,0.22),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
          }`}
        >
          {t.signUpBtn || "Create Account"}
        </button>
      </div>

      {/* ── Social OAuth Buttons (GitHub + Google) ── */}
      <div className="relative z-10 flex flex-col gap-2.5 mb-5">
        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGithubSignIn}
          disabled={loadingGithub}
          className="relative group w-full overflow-hidden flex items-center justify-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                     bg-[#161822]/90 hover:bg-[#1e202e] active:bg-[#252838]
                     border border-white/[0.16] hover:border-white/[0.30]
                     shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)]
                     text-xs sm:text-[13px] font-semibold text-white transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-60"
        >
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          {loadingGithub ? (
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
          ) : (
            <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
          )}
          <span className="relative z-10 tracking-wide">
            {t.continueWithGithub || "Continue with GitHub"}
          </span>
        </button>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loadingGoogle}
          className="relative group w-full overflow-hidden flex items-center justify-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                     bg-[#121216]/90 hover:bg-[#181a24] active:bg-[#1e2230]
                     border border-white/[0.16] hover:border-white/[0.30]
                     shadow-[0_4px_20px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.25)]
                     text-xs sm:text-[13px] font-semibold text-white transition-all duration-200 active:scale-[0.98] cursor-pointer disabled:opacity-60"
        >
          {/* Pure white specular sweep sheen */}
          <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {loadingGoogle ? (
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.36 7.35 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
          )}

          <span className="relative z-10 tracking-wide">
            {t.continueWithGoogle || "Continue with Google"}
          </span>
        </button>
      </div>

      {/* ── Hairline Divider with Monospace Tag ── */}
      <div className="relative z-10 flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-white/[0.10]" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
          {t.or || "or with email"}
        </span>
        <div className="flex-1 h-px bg-white/[0.10]" />
      </div>

      {/* ── Status Notifications (Subtle XUI Pills) ── */}
      {errorMessage && (
        <div className="relative z-10 mb-3.5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
          <span className="flex-1 leading-snug">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="relative z-10 mb-3.5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span className="flex-1 leading-snug">{successMessage}</span>
        </div>
      )}

      {/* ── Form: Recessed Obsidian Inputs ── */}
      <form onSubmit={handleSubmit} className="relative z-10 space-y-3">
        {mode === "signup" && (
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1 px-1">
              {t.fullName || "Full Name"}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t.fullNamePlaceholder || "John Doe"}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080913]/90 border border-white/[0.10]
                           text-xs sm:text-sm text-white placeholder-neutral-500
                           focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30
                           transition-all duration-200"
                style={{
                  boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.6)",
                }}
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-300 mb-1 px-1">
            {t.email || "Email Address"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder || "name@example.com"}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080913]/90 border border-white/[0.10]
                         text-xs sm:text-sm text-white placeholder-neutral-500
                         focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30
                         transition-all duration-200"
              style={{
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.6)",
              }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1 px-1">
            <label className="text-xs font-medium text-neutral-300">
              {t.password || "Password"}
            </label>
            {/* MUT-04: Forgot password hidden temporarily until password-reset handler/route is built */}
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#080913]/90 border border-white/[0.10]
                         text-xs sm:text-sm text-white placeholder-neutral-500
                         focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30
                         transition-all duration-200"
              style={{
                boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.6)",
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Primary Action Button (XUI Luminous Porcelain CTA matching HeroSection) ── */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loadingSubmit}
            className="relative group overflow-hidden w-full h-11 sm:h-12 px-5 rounded-[14px]
                       inline-flex items-center justify-center gap-2.5 text-xs sm:text-sm font-semibold tracking-tight text-neutral-950
                       bg-gradient-to-b from-white via-[#f7f7f8] to-[#e4e4e9]
                       border border-white/90
                       shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-4px_rgba(255,255,255,0.25),inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_0_rgba(0,0,0,0.08)]
                       hover:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_14px_32px_-4px_rgba(255,255,255,0.4),inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_0_rgba(0,0,0,0.08)]
                       hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]
                       transition-all duration-200 ease-out cursor-pointer disabled:opacity-60"
          >
            {/* Diagonal Light Sweep Sheen */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            {loadingSubmit ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-900" />
            ) : (
              <>
                <span className="relative z-10">
                  {mode === "signin"
                    ? t.signInBtn || "Sign In"
                    : t.signUpBtn || "Create Account"}
                </span>

                <span className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-black/[0.07] group-hover:bg-black group-hover:text-white text-neutral-800 transition-all duration-200">
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Footer Link: Switch Mode ── */}
      <div className="relative z-10 mt-5 text-center text-xs text-neutral-400">
        {mode === "signin" ? (
          <>
            <span>{t.noAccount || "Don't have an account?"} </span>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 cursor-pointer ml-1"
            >
              {t.createOne || "Create one now"}
            </button>
          </>
        ) : (
          <>
            <span>{t.hasAccount || "Already have an account?"} </span>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-4 cursor-pointer ml-1"
            >
              {t.signInHere || "Sign in here"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
