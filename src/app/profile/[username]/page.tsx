import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  BadgeCheck,
  Globe,
  Layers,
  ArrowLeft,
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
import { getRegistryCatalog } from "@/lib/registry";
import ComponentCard from "@/components/components-page/ComponentCard";

interface AuthorProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function AuthorProfilePage({ params }: AuthorProfilePageProps) {
  const { username } = await params;
  const decoded = decodeURIComponent(username).toLowerCase();

  const isXUI = decoded === "xui" || decoded === "@xui_dev";
  const authorName = isXUI ? "XUI Platform" : decoded.toUpperCase();
  const authorHandle = isXUI ? "@xui_dev" : `@${decoded}`;
  const authorAvatar = isXUI ? "/XUI.png" : "/XUI.png";

  const catalog = await getRegistryCatalog();
  const allComponents = catalog.items.map((item) => ({
    id: item.name,
    slug: item.name,
    title: item.title,
    description: item.description || "",
    category:
      item.category === "footer"
        ? "button"
        : (item.category as any) || "patterns",
    categoryLabel:
      item.categoryLabel?.toLowerCase() === "footer"
        ? "Button"
        : item.categoryLabel || "Component",
    author: item.author || "XUI",
    authorHandle: item.authorHandle || "@xui_dev",
    authorAvatar: item.authorAvatar || "/XUI.png",
    views: "0",
    dependencies: item.dependencies || [],
    reactCode: "",
  }));

  const authorComponents = allComponents.filter((comp) => {
    if (isXUI) return true; // XUI owns the catalog
    return comp.author.toLowerCase() === decoded;
  });

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 flex flex-col justify-between">
      <Navbar />

      {/* Ambient background glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-28 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-60 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px]" />
      </div>

      <main className="relative z-10 flex-1 pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1720px] mx-auto w-full flex flex-col gap-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/components"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.1] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Components</span>
          </Link>

          <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider">
            Verified Creator Profile
          </span>
        </div>

        {/* 1. Main Profile Card */}
        <div className="rounded-3xl sm:rounded-[36px] bg-[#0c0e18]/80 backdrop-blur-2xl border border-white/[0.12] overflow-hidden shadow-2xl">
          {/* Profile Header Details */}
          <div className="p-6 sm:p-8 relative">
            {/* Avatar Row */}
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="relative">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl p-1 bg-[#0c0e18] border-2 border-white/20 shadow-2xl overflow-hidden flex items-center justify-center">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                {/* Verified Badge Icon */}
                <div
                  className="absolute -bottom-1 -right-1 p-1 rounded-full bg-blue-600 text-white border-2 border-[#0c0e18] shadow-md"
                  title="Verified Official Platform"
                >
                  <BadgeCheck className="w-5 h-5 fill-white text-blue-600" />
                </div>
              </div>
            </div>

            {/* Info & Bio */}
            <div className="flex flex-col gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight select-text">
                  {authorName}
                </h1>
                <p className="text-xs sm:text-sm font-mono text-neutral-400 mt-1 select-text">
                  {authorHandle}
                </p>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl select-text">
                {isXUI
                  ? "The official primary publishing account for the XUI platform. Designing, developing, and curating interactive, physics-based UI components and 3D web experiences."
                  : `Creator profile for ${authorName} on XUI.`}
              </p>

              {/* Verified External Links */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <a
                  href="https://github.com/xui-dev/XUI-components-"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <GithubIcon className="w-3.5 h-3.5 text-neutral-400" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500" />
                </a>

                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-neutral-300 hover:text-white transition-all cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-neutral-400" />
                  <span>xui.dev</span>
                </Link>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono text-neutral-500 sm:ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Joined 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Components Published by this Author */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <span>Components by {authorName}</span>
            </h2>
            <span className="text-xs font-mono text-neutral-500">
              {authorComponents.length} published
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {authorComponents.map((comp) => (
              <ComponentCard key={comp.id} component={comp} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
