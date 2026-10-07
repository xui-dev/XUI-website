"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  Terminal,
  Zap,
  Code2,
  Layers,
  Sparkles,
  Sliders,
  Palette,
  Cpu,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Info,
} from "lucide-react";

interface DocItem {
  id: string;
  category: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  badge: string;
  description: string;
  command?: string;
  commandId?: string;
  codeSnippet?: {
    language: string;
    filename?: string;
    code: string;
  };
  features: {
    title: string;
    desc: string;
  }[];
  callout?: {
    type: "tip" | "info" | "warning";
    text: string;
  };
}

const DOCS_DATA: DocItem[] = [
  {
    id: "introduction",
    category: "Getting Started",
    label: "Introduction",
    icon: BookOpen,
    badge: "Overview",
    title: "Introduction to XUI",
    description:
      "XUI is an ultra-premium collection of animated kinetic components, 3D WebGL canvases, and dark-glassmorphic interfaces engineered for high-performance React and Next.js applications.",
    features: [
      {
        title: "Kinetic Micro-Interactions",
        desc: "Spring-physics animations and velocity-aware tactile gestures powered by Motion (Framer Motion).",
      },
      {
        title: "You Own the Code",
        desc: "Zero opaque black-box packages. Drop components directly into your codebase with complete freedom to edit.",
      },
      {
        title: "Tailwind CSS Native",
        desc: "Styled with modern Tailwind utility classes and CSS variables, fully compatible with Tailwind v3 and v4.",
      },
      {
        title: "Obsidian Titanium Aesthetics",
        desc: "Curated dark mode palette with specular hairlines, ambient depth, and luminous accents out of the box.",
      },
    ],
    callout: {
      type: "tip",
      text: "XUI components are designed to co-exist cleanly with existing libraries like shadcn/ui and Radix UI without style collisions.",
    },
  },
  {
    id: "quickstart",
    category: "Getting Started",
    label: "Quick Start",
    icon: Zap,
    badge: "Setup in 60s",
    title: "Quick Start Guide",
    description:
      "Initialize XUI in your project with one command. The CLI automatically inspects your framework, installs necessary peer dependencies, and sets up your design tokens.",
    command: "npx xui init",
    commandId: "quickstart-init",
    features: [
      {
        title: "Automatic Project Detection",
        desc: "Detects Next.js (App / Pages router), Vite, Remix, or Astro automatically.",
      },
      {
        title: "Peer Dependency Setup",
        desc: "Installs motion, lucide-react, clsx, and tailwind-merge if they are not already installed.",
      },
      {
        title: "Scaffolded Component Directory",
        desc: "Creates a dedicated components/xui folder ready for component imports.",
      },
    ],
    callout: {
      type: "info",
      text: "Prefer manual installation? You can also browse any component on the Explore page and copy the TSX code directly.",
    },
  },
  {
    id: "cli",
    category: "Getting Started",
    label: "CLI Reference",
    icon: Terminal,
    badge: "Command Line",
    title: "XUI Command Line Interface",
    description:
      "Add any component directly into your local codebase. The CLI manages imports, assets, and type definitions without manual file creation.",
    command: "npx xui add dynamic-floating-dock",
    commandId: "cli-add",
    codeSnippet: {
      language: "bash",
      filename: "terminal",
      code: `# Add a specific component
npx xui add dynamic-floating-dock

# List all available components in the registry
npx xui list

# Check installed components for upstream updates
npx xui diff`,
    },
    features: [
      {
        title: "Single File Isolation",
        desc: "Each component is completely self-contained, avoiding tangled dependencies across your tree.",
      },
      {
        title: "Type Safety",
        desc: "Full TypeScript definitions and prop interfaces are automatically included.",
      },
      {
        title: "Conflict Free",
        desc: "Prompts before overwriting any local modifications you have made to downloaded components.",
      },
    ],
  },
  {
    id: "frameworks",
    category: "Configuration",
    label: "Frameworks",
    icon: Layers,
    badge: "Ecosystem",
    title: "Supported Frameworks",
    description:
      "XUI components are built on React 18 & 19 primitives, engineered to support both server-rendered and client-hydrated environments seamlessly.",
    codeSnippet: {
      language: "tsx",
      filename: "app/page.tsx",
      code: `"use client";

import DynamicFloatingDock from "@/components/xui/DynamicFloatingDock";

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center">
      <DynamicFloatingDock />
    </main>
  );
}`,
    },
    features: [
      {
        title: "Next.js App Router (14 / 15 / 16)",
        desc: "Seamless integration using 'use client' directives at component boundaries.",
      },
      {
        title: "Vite & React 19",
        desc: "Blazing fast HMR and optimized bundle splitting with zero extra bundler configuration.",
      },
      {
        title: "Remix & React Router v7",
        desc: "Full support for route-based code splitting and progressive enhancement.",
      },
      {
        title: "Astro React Islands",
        desc: "Use client:idle or client:visible to hydrate kinetic widgets on demand.",
      },
    ],
  },
  {
    id: "tailwind",
    category: "Configuration",
    label: "Tailwind CSS",
    icon: Code2,
    badge: "Styling",
    title: "Tailwind CSS Setup",
    description:
      "XUI utilizes clean Tailwind CSS utility classes and modern CSS custom properties. It works flawlessly with both Tailwind CSS v3 and Tailwind CSS v4.",
    codeSnippet: {
      language: "css",
      filename: "globals.css",
      code: `@import "tailwindcss";

:root {
  --background: #000000;
  --foreground: #ffffff;
  --accent-blue: #3b82f6;
  --accent-cyan: #06b6d4;
}

/* Custom Specular Hairline Utility */
@utility hairline-specular {
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
}`,
    },
    features: [
      {
        title: "Tailwind v4 Native",
        desc: "Leverages modern @utility and CSS variable declarations with lightning build times.",
      },
      {
        title: "Dark Mode First",
        desc: "Every component is calibrated for deep black environments, eliminating washed-out grays.",
      },
      {
        title: "Zero CSS Collisions",
        desc: "Tailwind utility scoping prevents unexpected style overrides across parent applications.",
      },
    ],
  },
  {
    id: "motion",
    category: "Interactions",
    label: "Kinetic Physics",
    icon: Sparkles,
    badge: "Animation",
    title: "Kinetic Physics & Motion",
    description:
      "Instead of robotic linear eases, XUI implements physical spring dynamics modeled after real-world elasticity, damping, and inertial momentum.",
    codeSnippet: {
      language: "typescript",
      filename: "motion.config.ts",
      code: `// Standard XUI Spring Preset
export const kineticSpring = {
  type: "spring",
  stiffness: 380,
  damping: 28,
  mass: 0.8,
};

// Fluid Hover Transition
export const hoverTransition = {
  type: "spring",
  stiffness: 450,
  damping: 35,
};`,
    },
    features: [
      {
        title: "Natural Tactile Feedback",
        desc: "Springs react proportionally to gesture speed, giving components weight and responsiveness.",
      },
      {
        title: "Hardware Accelerated",
        desc: "Animations operate strictly on composite transform and opacity layers for reliable 60fps.",
      },
      {
        title: "Accessibility Conscious",
        desc: "Automatically respects prefers-reduced-motion settings across all operating systems.",
      },
    ],
  },
  {
    id: "theming",
    category: "Interactions",
    label: "Theming & Tokens",
    icon: Palette,
    badge: "Design System",
    title: "Adaptive Theming & Tokens",
    description:
      "Easily align XUI components with your company brand guidelines by overriding CSS tokens or injecting Tailwind color classes.",
    features: [
      {
        title: "Obsidian Titanium Base",
        desc: "Our signature dark slate (#0e101c) background provides depth without muddy contrast.",
      },
      {
        title: "Specular Hairlines",
        desc: "Subtle top hairline gradients create physical light reflections mimicking real glass.",
      },
      {
        title: "Ambient Glow Overlays",
        desc: "Deep radial color bleeds add dimension without slowing down GPU rasterization.",
      },
    ],
    callout: {
      type: "tip",
      text: "You can change an entire component's color personality simply by adjusting the border and hover shadow glow utilities.",
    },
  },
  {
    id: "performance",
    category: "Engineering",
    label: "Performance & 3D",
    icon: Cpu,
    badge: "Optimization",
    title: "WebGL & 3D Performance",
    description:
      "Components featuring WebGL canvases, 3D meshes, and shader pipelines are built with aggressive optimization techniques to protect client battery and frame rates.",
    features: [
      {
        title: "Viewport Observer Pausing",
        desc: "Three.js and OGL animation loops pause automatically when scrolled off-screen.",
      },
      {
        title: "High-DPI Retina Clamping",
        desc: "Device pixel ratios are capped at 2x to prevent unnecessary 4K GPU rendering overhead.",
      },
      {
        title: "WebGL Context Recovery",
        desc: "Includes graceful fallbacks and automatic recovery if GPU context is lost in background tabs.",
      },
    ],
  },
  {
    id: "troubleshooting",
    category: "Engineering",
    label: "Troubleshooting",
    icon: HelpCircle,
    badge: "FAQ",
    title: "Troubleshooting & FAQ",
    description:
      "Solutions to the most common setup questions when integrating kinetic animations into React applications.",
    features: [
      {
        title: "'window is not defined' in Next.js",
        desc: "When using 3D canvases, load the component with dynamic(() => import(...), { ssr: false }).",
      },
      {
        title: "Missing Tailwind Styles",
        desc: "Ensure your tailwind.config.ts content array covers './components/xui/**/*.{js,ts,jsx,tsx}'.",
      },
      {
        title: "Layout Shifting During Gestures",
        desc: "Provide fixed width/height constraints or use Framer Motion layoutId for smooth FLIP morphs.",
      },
    ],
    callout: {
      type: "tip",
      text: "Need extra help? Join our developer Discord or open an issue on our GitHub repository.",
    },
  },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState<string>("introduction");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>("");

  const activeIndex = DOCS_DATA.findIndex((d) => d.id === activeId);
  const activeDoc = DOCS_DATA[activeIndex] || DOCS_DATA[0];

  const prevDoc = activeIndex > 0 ? DOCS_DATA[activeIndex - 1] : null;
  const nextDoc =
    activeIndex < DOCS_DATA.length - 1 ? DOCS_DATA[activeIndex + 1] : null;

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDocs = DOCS_DATA.filter(
    (item) =>
      item.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      dir="ltr"
      className="min-h-screen bg-black text-white selection:bg-blue-600/30 selection:text-blue-200 overflow-x-hidden flex flex-col"
    >
      {/* ── Fixed Floating Navbar Dock ── */}
      <Navbar />

      {/* ── Ambient Background Glow Halos (Consistent with XUI site) ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-24 left-1/4 w-[550px] h-[550px] bg-blue-600/[0.12] rounded-full blur-[160px]" />
        <div className="absolute top-72 right-1/4 w-[600px] h-[600px] bg-indigo-600/[0.08] rounded-full blur-[180px]" />
        <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-emerald-500/[0.05] rounded-full blur-[150px]" />
        {/* Subtle grid texture overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />
      </div>

      {/* ── Main Layout Architecture (Sidebar + Content Panel) ── */}
      <main className="relative z-10 flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 xl:px-10 max-w-[1720px] mx-auto w-full flex flex-col">
        {/* ── Top Header Navigation Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight select-text">
              Documentation & Guides
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 select-text">
              Everything you need to drop kinetic, interactive components into your React apps.
            </p>
          </div>

          <Link
            href="/components"
            className="group flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium bg-[#0e101c]/90 hover:bg-[#151728] text-neutral-300 hover:text-white border border-white/[0.12] hover:border-white/[0.25] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all w-fit cursor-pointer"
          >
            <span>Browse Components</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 text-blue-400" />
          </Link>
        </div>

        {/* ── Two-Column Architecture (Sidebar + Content Card) ── */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start flex-1">
          {/* ══════════════════════════════════════════════════════════
              LEFT SIDEBAR: Obsidian Titanium Navigation Card
          ══════════════════════════════════════════════════════════ */}
          <aside className="w-full lg:w-72 shrink-0 rounded-3xl bg-[#0e101c]/80 backdrop-blur-2xl border border-white/[0.1] shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.12)] p-4 sm:p-5 flex flex-col gap-4 lg:sticky lg:top-32 relative overflow-hidden">
            {/* Top Specular Hairline */}
            <span className="pointer-events-none absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Quick Search in docs */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search topics..."
                aria-label="Filter documentation topics"
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-white/[0.1] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all font-sans"
              />
            </div>

            {/* Navigation Items List */}
            <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible no-scrollbar py-1">
              {filteredDocs.map((item) => {
                const isActive = item.id === activeDoc.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveId(item.id)}
                    className={`group relative flex items-center justify-between w-full px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap lg:whitespace-normal text-left select-none ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600/25 via-indigo-600/15 to-transparent text-white border border-blue-500/40 shadow-[0_0_20px_rgba(37,99,235,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] font-semibold"
                        : "text-neutral-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
                    }`}
                  >
                    <span>{item.label}</span>

                    {isActive && (
                      <span className="hidden lg:inline-flex w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]" />
                    )}
                  </button>
                );
              })}

              {filteredDocs.length === 0 && (
                <div className="p-4 text-center text-xs text-neutral-500">
                  No matching topics found.
                </div>
              )}
            </nav>
          </aside>

          {/* ══════════════════════════════════════════════════════════
              RIGHT MAIN CARD: Obsidian High-Fidelity Content Panel
          ══════════════════════════════════════════════════════════ */}
          <article className="flex-1 w-full rounded-3xl bg-[#0e101c]/80 backdrop-blur-2xl border border-white/[0.1] shadow-[0_20px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.12)] p-6 sm:p-10 lg:p-12 relative overflow-hidden flex flex-col justify-between min-h-[580px]">
            {/* Top Specular Hairline Highlight */}
            <span className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

            {/* Corner Decorative Ambient Blur */}
            <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-blue-600/[0.08] rounded-full blur-[100px]" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeDoc.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="flex flex-col gap-6"
              >
                {/* Section Hero Title */}
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight select-text leading-tight">
                  {activeDoc.title}
                </h2>

                {/* Main Description */}
                <p className="text-sm sm:text-base lg:text-lg text-neutral-300 leading-relaxed max-w-3xl select-text">
                  {activeDoc.description}
                </p>

                {/* Interactive CLI Command Box (if present) */}
                {activeDoc.command && (
                  <div className="relative group p-4 sm:p-5 rounded-2xl bg-black/70 border border-white/[0.14] shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)] backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 font-mono text-xs sm:text-sm text-neutral-200">
                      <Terminal className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="text-neutral-500 select-none">$</span>
                      <code className="select-all text-white font-semibold">
                        {activeDoc.command}
                      </code>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        copyText(activeDoc.command!, activeDoc.commandId!)
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.16] text-neutral-200 hover:text-white border border-white/[0.1] text-xs font-medium transition-all cursor-pointer self-end sm:self-auto active:scale-95"
                    >
                      {copiedId === activeDoc.commandId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-300 font-semibold">
                            Copied
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Command</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Formatted Code Block (if present) */}
                {activeDoc.codeSnippet && (
                  <div className="rounded-2xl bg-black/80 border border-white/[0.12] overflow-hidden shadow-2xl">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.08] text-xs font-mono text-neutral-400">
                      <span className="flex items-center gap-2">
                        <span className="flex gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-red-500/40 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 inline-block" />
                        </span>
                        <span className="text-neutral-300 ml-1">
                          {activeDoc.codeSnippet.filename}
                        </span>
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            activeDoc.codeSnippet!.code,
                            activeDoc.id + "-code"
                          )
                        }
                        className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === activeDoc.id + "-code" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-neutral-200 leading-relaxed select-text">
                      <code>{activeDoc.codeSnippet.code}</code>
                    </pre>
                  </div>
                )}

                {/* Feature Highlights Grid */}
                <div className="mt-2 flex flex-col gap-3">
                  <span className="text-xs uppercase font-mono tracking-widest text-neutral-400 font-semibold">
                    Core Specifications
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {activeDoc.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] hover:border-white/[0.12] transition-all flex flex-col gap-1.5"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_6px_#60a5fa]" />
                          <h4 className="text-xs sm:text-sm font-semibold text-white select-text">
                            {feature.title}
                          </h4>
                        </div>
                        <p className="text-xs text-neutral-400 leading-relaxed select-text">
                          {feature.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Callout Box */}
                {activeDoc.callout && (
                  <div className="p-4 rounded-2xl bg-blue-500/[0.08] border border-blue-500/20 text-xs sm:text-sm text-blue-200 flex items-start gap-3">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed select-text">
                      {activeDoc.callout.text}
                    </p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* ── Footer Navigation (Previous / Next Topic) ── */}
            <div className="pt-8 mt-8 border-t border-white/[0.08] flex items-center justify-between gap-4">
              {prevDoc ? (
                <button
                  type="button"
                  onClick={() => setActiveId(prevDoc.id)}
                  className="group flex flex-col items-start gap-1 p-2 rounded-xl text-left cursor-pointer hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1 group-hover:text-neutral-400">
                    <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-0.5" />
                    <span>Previous</span>
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-neutral-300 group-hover:text-white">
                    {prevDoc.label}
                  </span>
                </button>
              ) : (
                <div />
              )}

              {nextDoc ? (
                <button
                  type="button"
                  onClick={() => setActiveId(nextDoc.id)}
                  className="group flex flex-col items-end gap-1 p-2 rounded-xl text-right cursor-pointer hover:bg-white/[0.04] transition-colors"
                >
                  <span className="text-[11px] font-mono text-neutral-500 flex items-center gap-1 group-hover:text-neutral-400">
                    <span>Next</span>
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                  <span className="text-xs sm:text-sm font-medium text-neutral-300 group-hover:text-white">
                    {nextDoc.label}
                  </span>
                </button>
              ) : (
                <div />
              )}
            </div>
          </article>
        </div>
      </main>

      {/* ── Site Footer ── */}
      <Footer />
    </div>
  );
}
