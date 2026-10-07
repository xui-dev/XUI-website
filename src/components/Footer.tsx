"use client";

import Link from "next/link";
import XUILogo from "@/components/XUILogo";
import { useLanguage } from "@/context/LanguageContext";

const SOCIAL_LINKS = [
  {
    label: "GitHub",
    href: "https://github.com/xui-dev/XUI-components-",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: "X / Twitter",
    href: "https://twitter.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.com",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
];

export default function Footer() {
  const { messages, dir, locale } = useLanguage();
  const t = messages.footer;

  return (
    <footer
      dir={dir}
      className="relative w-full bg-[#07070b] border-t border-white/[0.06] overflow-hidden"
    >
      {/* Ambient top-edge glow */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(64,106,218,0.6) 30%, rgba(0,180,255,0.8) 50%, rgba(64,106,218,0.6) 70%, transparent 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-32"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 0%, rgba(30,80,200,0.12) 0%, transparent 100%)",
        }}
      />

      <div className="relative mx-auto max-w-[1720px] px-6 sm:px-10 xl:px-12">
        {/* ── Main Grid ─────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 pt-16 pb-12">

          {/* Brand column — spans 2 cols on md */}
          <div className="col-span-2 flex flex-col gap-5">
            {/* Logo + Beta Badge */}
            <Link href="/" aria-label="XUI Home" className="inline-flex items-center gap-2.5 w-fit transition-opacity hover:opacity-80">
              <XUILogo height={26} color="#ffffff" />
              <span className="px-1.5 py-0.5 rounded-[5px] text-[10px] font-mono font-medium tracking-wider text-white bg-white/[0.08] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] select-none leading-none">
                beta
              </span>
            </Link>

            {/* Tagline */}
            <p className="text-sm text-neutral-500 leading-relaxed max-w-xs">
              {t.tagline}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 mt-1">
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="group flex items-center justify-center w-9 h-9 rounded-xl
                             bg-white/[0.04] hover:bg-white/[0.10]
                             border border-white/[0.07] hover:border-white/[0.18]
                             text-neutral-500 hover:text-white
                             transition-all duration-200 active:scale-95"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 1. Explore */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {t?.products?.title || "Explore"}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: t?.products?.components || "Components", href: "/components" },
                { label: t?.products?.templates || "3D web templates", href: "/#3d-websites" },
                { label: t?.products?.docs || "Docs", href: "/docs" },
                { label: t?.products?.saved || "Saved Components", href: "/saved" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-neutral-500 hover:text-white transition-colors duration-150"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 2. Platform */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {t?.company?.title || "Platform"}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: t?.company?.profile || "Profile", href: "/profile" },
                { label: t?.company?.settings || "Settings", href: "/settings" },
                { label: t?.company?.customRequest || "Custom 3D Request", href: "mailto:contact@xui.dev?subject=Custom%203D%20Website%20Request" },
              ].map((item) => (
                <li key={item.href}>
                  {item.href.startsWith("mailto:") ? (
                    <a
                      href={item.href}
                      className="text-sm text-neutral-500 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-500 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Community & Legal */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              {t?.legal?.title || "Community"}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {[
                { label: t?.legal?.github || "GitHub", href: "https://github.com/xui-dev/XUI-components-", external: true },
                { label: t?.legal?.license || "MIT License", href: "https://github.com/xui-dev/XUI-components-/blob/main/LICENSE", external: true },
                { label: t?.legal?.privacy || "Privacy Policy", href: "/docs", external: false },
                { label: t?.legal?.terms || "Terms of Service", href: "/docs", external: false },
              ].map((item) => (
                <li key={item.label}>
                  {item.external ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-500 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      className="text-sm text-neutral-500 hover:text-white transition-colors duration-150"
                    >
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ────────────────────────────── */}
        <div className="flex items-center justify-center py-6 border-t border-white/[0.05]">
          {/* Copyright */}
          <p className="text-xs text-neutral-600 text-center">
            {t.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
