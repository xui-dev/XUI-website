"use client";

import { useState } from "react";

type Framework = "react" | "html" | "vue" | "svelte";

interface Config {
  color: string;
  speed: number;
  frequency: number;
  noise: number;
  bandWidth: number;
  rotation: number;
  intensity: number;
}

const DEFAULT_CONFIG: Config = {
  color: "#2563EB",
  speed: 0.35,
  frequency: 1.2,
  noise: 0.2,
  bandWidth: 0.18,
  rotation: 120,
  intensity: 1.6,
};

const FRAMEWORKS: { id: Framework; name: string }[] = [
  { id: "react", name: "React" },
  // Hidden for now — React only
  // { id: "html", name: "HTML / JS" },
  // { id: "vue", name: "Vue" },
  // { id: "svelte", name: "Svelte" },
];

export default function MacCodeCard() {
  const [activeFramework, setActiveFramework] = useState<Framework>("react");
  const [displayedFramework, setDisplayedFramework] = useState<Framework>("react");
  const [isFading, setIsFading] = useState<boolean>(false);

  const cfg = DEFAULT_CONFIG;

  const handleFrameworkChange = (fw: Framework) => {
    if (fw === activeFramework) return;
    setActiveFramework(fw);
    setIsFading(true);

    setTimeout(() => {
      setDisplayedFramework(fw);
      setIsFading(false);
    }, 140);
  };

  return (
    <div className="w-[690px] max-w-[95vw] flex flex-col gap-2.5 sm:gap-3.5 font-sans pointer-events-auto mx-auto sm:mx-0">
      {/* ── 1. Separate Language Switcher Bar (Detached from Mac Window) ── */}
      <div className="flex items-center gap-1 sm:gap-1.5 p-1 sm:p-1.5 rounded-2xl bg-[#0a0c16]/85 backdrop-blur-2xl border border-white/[0.14] shadow-[0_12px_32px_rgba(0,0,0,0.7),inset_0_1px_1px_rgba(255,255,255,0.2)] w-fit self-start overflow-x-auto no-scrollbar">
        {FRAMEWORKS.map((fw) => {
          const isActive = activeFramework === fw.id;
          return (
            <button
              key={fw.id}
              type="button"
              onClick={() => handleFrameworkChange(fw.id)}
              className={`relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-[13px] font-semibold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-b from-white/[0.11] to-white/[0.04] text-white border border-white/[0.14] shadow-[0_4px_16px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.18)]"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.06] border border-transparent"
              }`}
            >
              {/* Framework Logos */}
              {fw.id === "react" && (
                <svg
                  className="w-4 h-4 text-[#00D8FF] shrink-0"
                  viewBox="0 0 115.3 100"
                  fill="currentColor"
                >
                  <ellipse cx="57.65" cy="50" rx="16.7" ry="16.7" fill="#00D8FF" />
                  <path
                    d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
                    fill="none"
                    stroke="#00D8FF"
                    strokeWidth="6"
                    transform="rotate(30 57.65 50)"
                  />
                  <path
                    d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
                    fill="none"
                    stroke="#00D8FF"
                    strokeWidth="6"
                    transform="rotate(90 57.65 50)"
                  />
                  <path
                    d="M57.65,0 C42.75,0 30.7,22.4 30.7,50 C30.7,77.6 42.75,100 57.65,100 C72.55,100 84.6,77.6 84.6,50 C84.6,22.4 72.55,0 57.65,0 Z"
                    fill="none"
                    stroke="#00D8FF"
                    strokeWidth="6"
                    transform="rotate(150 57.65 50)"
                  />
                </svg>
              )}
              {fw.id === "html" && (
                <span className="w-4 h-4 rounded bg-[#F7DF1E] text-black text-[9px] font-black flex items-center justify-center shrink-0">
                  JS
                </span>
              )}
              {fw.id === "vue" && (
                <svg
                  className="w-4 h-4 shrink-0"
                  viewBox="0 0 261.76 226.69"
                  fill="none"
                >
                  <path
                    d="M161.096.001l-30.225 52.351L100.647.001H-.005l130.877 226.688L261.749.001z"
                    fill="#42B883"
                  />
                  <path
                    d="M161.096.001l-30.225 52.351L100.647.001H52.246l78.626 136.181L209.497.001z"
                    fill="#35495E"
                  />
                </svg>
              )}
              {fw.id === "svelte" && (
                <svg
                  className="w-4 h-4 text-[#FF3E00] shrink-0"
                  viewBox="0 0 106.7 128"
                  fill="currentColor"
                >
                  <path d="M96.7 16.5C84.2 4.7 66.5-1.1 48.7.3 30.1 1.7 13.5 11.2 5.1 27.2c-7.9 15.1-6.8 33.3 2.8 47.4-2.4 5.3-3.6 11.1-3.4 16.9.4 18.2 11.8 34.3 28.7 40.5 17.5 6.4 37.3 2.5 50.8-10.1 14.1-13.1 19.3-32.9 13.2-51.1 1.8-4.7 2.6-9.8 2.3-14.8-.5-15.6-8.8-30-22.8-39.5zm-52.6 97.4c-11.4 0-21.7-6.2-26.9-16.1-5.1-9.7-4.4-21.4 1.9-30.5l3.8-5.5 6.3 2.1c4.2 1.4 8.2 3.4 11.8 5.9l2.7 1.9-1.3 3c-1.3 3-2 6.3-2 9.6 0 7.4 4.3 14.1 11 17.2 6.8 3.1 14.8 2.1 20.6-2.5l5.5-4.4 3.7 5.6c4.6 7 4.1 16-1.3 22.4-4.2 5-10.3 7.9-16.1 7.9zm38.1-41.8l-3.8 5.5-6.3-2.1c-4.2-1.4-8.2-3.4-11.8-5.9l-2.7-1.9 1.3-3c1.3-3 2-6.3 2-9.6 0-7.4-4.3-14.1-11-17.2-6.8-3.1-14.8-2.1-20.6 2.5l-5.5 4.4-3.7-5.6c-4.6-7-4.1-16 1.3-22.4 4.8-5.7 12.2-8.9 19.6-8.5 11.4.6 21.3 7.5 25.6 18 4.3 10.3 2.8 22.2-4.4 31.8z" />
                </svg>
              )}
              <span>{fw.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── 2. Fixed-Size Taller macOS Window with Professional Laser Frosted Glass Experience ── */}
      <div
        className="relative w-full rounded-[26px] overflow-hidden transform-gpu
                   bg-[#080913]/70 backdrop-blur-3xl sm:backdrop-blur-[42px] backdrop-saturate-[210%]
                   border border-white/[0.14]"
        style={{
          boxShadow: `0 36px 90px -18px rgba(0, 0, 0, 0.95), 0 0 75px -10px rgba(0, 229, 255, 0.28), inset 0 1px 1.5px 0 rgba(255, 255, 255, 0.3), inset 0 -24px 50px -12px rgba(0, 229, 255, 0.16), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.6)`,
          WebkitBackdropFilter: "blur(42px) saturate(210%)",
          backdropFilter: "blur(42px) saturate(210%)",
        }}
      >
        {/* Apple Liquid Glass Top Specular Sheen (Exact match with Navbar) */}
        <div className="pointer-events-none absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full" />

        {/* ── Optical Laser Caustic Diffusion Layers (Subsurface scattering for laser passing behind) ── */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[26px]">
          {/* Laser beam entry refraction cone across bottom-right */}
          <div
            className="absolute -right-20 bottom-0 w-[440px] h-[280px] rounded-full blur-[50px] opacity-45"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 85% 75%, rgba(0, 229, 255, 0.75) 0%, rgba(0, 140, 255, 0.45) 40%, rgba(64, 106, 218, 0.2) 65%, transparent 80%)",
              transform: "rotate(-20deg)",
            }}
          />

          {/* Angular laser beam refracted shaft */}
          <div
            className="absolute -right-12 bottom-12 w-[340px] h-[90px] rounded-full blur-[35px] opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgba(0, 229, 255, 0.8) 0%, rgba(0, 180, 255, 0.5) 45%, transparent 80%)",
              transform: "rotate(-28deg)",
            }}
          />

          {/* Subsurface specular frosted glass dispersion grain */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-cyan-500/[0.04] to-transparent opacity-80" />
        </div>

        {/* Laser-lit glass edge refraction along bottom and right */}
        <div
          className="pointer-events-none absolute right-0 top-10 bottom-0 w-[1.5px] rounded-full"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, rgba(0, 229, 255, 0.4) 40%, rgba(0, 229, 255, 0.95) 85%, rgba(0, 229, 255, 1) 100%)",
            filter: "blur(0.5px)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 bottom-0 left-1/4 h-[1.5px] rounded-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(0, 229, 255, 0.6) 65%, rgba(0, 229, 255, 0.95) 90%, rgba(0, 229, 255, 1) 100%)",
            filter: "blur(0.5px)",
          }}
        />

        {/* ── macOS Window Header (Only Traffic Light Dots, No Copy Button) ── */}
        <div className="relative z-10 flex items-center px-5 sm:px-6 py-3.5 border-b border-white/[0.08] bg-white/[0.02]">
          <div className="flex items-center gap-2 group/lights">
            <span className="relative flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ff5f56] border border-[#e0443e]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_1px_3px_rgba(255,95,86,0.35)] cursor-pointer">
              <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-black text-[#660000] leading-none transition-opacity">
                ×
              </span>
            </span>
            <span className="relative flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#ffbd2e] border border-[#dea123]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_1px_3px_rgba(255,189,46,0.35)] cursor-pointer">
              <span className="opacity-0 group-hover/lights:opacity-100 text-[8px] font-black text-[#664400] leading-none transition-opacity">
                -
              </span>
            </span>
            <span className="relative flex items-center justify-center w-3.5 h-3.5 rounded-full bg-[#27c93f] border border-[#1aab29]/70 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_1px_3px_rgba(39,201,63,0.35)] cursor-pointer">
              <span className="opacity-0 group-hover/lights:opacity-100 text-[7px] font-black text-[#004411] leading-none transition-opacity">
                +
              </span>
            </span>
          </div>
        </div>

        {/* ── Taller IDE Code Body with Line Number Gutter ── */}
        <div
          className={`relative z-10 flex p-3 sm:p-7 min-h-[220px] sm:min-h-[540px] max-h-[46vh] sm:max-h-none font-mono text-[11px] sm:text-[14px] leading-[1.8] sm:leading-[2.1] select-text transition-all duration-200 ease-out overflow-x-auto overflow-y-auto no-scrollbar touch-scroll-x ${
            isFading
              ? "opacity-25 translate-y-1 blur-[2px]"
              : "opacity-100 translate-y-0 blur-none"
          }`}
        >
          {/* React Snippet */}
          {displayedFramework === "react" && (
            <div className="flex w-full min-w-max">
              {/* Line Numbers Gutter */}
              <div className="flex flex-col text-neutral-600 select-none pr-3 sm:pr-7 border-r border-white/[0.08] text-right font-mono text-[11px] sm:text-[14px] leading-[1.85] sm:leading-[2.15] shrink-0">
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span>05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
                <span>09</span>
                <span>10</span>
                <span>11</span>
                <span>12</span>
                <span>13</span>
                <span>14</span>
                <span>15</span>
              </div>

              {/* Code Lines */}
              <div className="pl-3 sm:pl-7 text-neutral-300 w-full">
                <p>
                  <span className="text-purple-400 font-semibold">import</span>{" "}
                  <span className="text-white">&#123; ColorBends &#125;</span>{" "}
                  <span className="text-purple-400 font-semibold">from</span>{" "}
                  <span className="text-cyan-300">&apos;@components/ColorBends&apos;</span>;
                </p>
                <p className="opacity-0">.</p>
                <p>
                  <span className="text-purple-400 font-semibold">export default function</span>{" "}
                  <span className="text-blue-300 font-semibold">App</span>() &#123;
                </p>
                <p className="pl-4">
                  <span className="text-purple-400 font-semibold">return</span> (
                </p>
                <p className="pl-7">
                  &lt;<span className="text-purple-300 font-bold">ColorBends</span>
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">color</span> =
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.09] border border-white/[0.14] text-[12px] text-neutral-200 shadow-sm">
                    <span
                      className="w-2.5 h-2.5 rounded shadow-[0_0_8px_#00E5FF]"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span>&quot;{cfg.color}&quot;</span>
                  </span>
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">speed</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    {cfg.speed}
                  </span>
                  &#125;
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">frequency</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    {cfg.frequency.toFixed(1)}
                  </span>
                  &#125;
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">noise</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    {cfg.noise}
                  </span>
                  &#125;
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">bandWidth</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    {cfg.bandWidth}
                  </span>
                  &#125;
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">rotation</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    {cfg.rotation}
                  </span>
                  &#125;
                </p>
                <p className="pl-10 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">intensity</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                    {cfg.intensity}
                  </span>
                  &#125;
                </p>
                <p className="pl-7">/&gt;</p>
                <p className="pl-4">);</p>
                <p>&#125;</p>
              </div>
            </div>
          )}

          {/* HTML / JS Snippet */}
          {displayedFramework === "html" && (
            <div className="flex w-full min-w-max">
              <div className="flex flex-col text-neutral-600 select-none pr-3 sm:pr-7 border-r border-white/[0.08] text-right font-mono text-[11px] sm:text-[14px] leading-[1.85] sm:leading-[2.15] shrink-0">
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span>05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
                <span>09</span>
                <span>10</span>
                <span>11</span>
                <span>12</span>
                <span>13</span>
              </div>

              <div className="pl-3 sm:pl-7 text-neutral-300 w-full">
                <p>
                  <span className="text-purple-400 font-semibold">&lt;script</span>{" "}
                  <span className="text-neutral-400">type</span>=
                  <span className="text-cyan-300">&quot;module&quot;</span>
                  <span className="text-purple-400 font-semibold">&gt;</span>
                </p>
                <p className="pl-4">
                  <span className="text-purple-400 font-semibold">import</span>{" "}
                  <span className="text-white">&#123; initColorBends &#125;</span>{" "}
                  <span className="text-purple-400 font-semibold">from</span>{" "}
                  <span className="text-cyan-300">&apos;https://cdn.xui.dev/bends.js&apos;</span>;
                </p>
                <p className="opacity-0">.</p>
                <p className="pl-4">
                  <span className="text-blue-300 font-semibold">initColorBends</span>(
                  <span className="text-emerald-300">&apos;#canvas&apos;</span>, &#123;
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">color:</span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.09] border border-white/[0.14] text-[12px] text-neutral-200">
                    <span
                      className="w-2.5 h-2.5 rounded shadow-[0_0_8px_#00E5FF]"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span>&apos;{cfg.color}&apos;</span>
                  </span>
                  ,
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">speed:</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.speed}
                  </span>
                  ,
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">frequency:</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.frequency.toFixed(1)}
                  </span>
                  ,
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">noise:</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.noise}
                  </span>
                  ,
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">bandWidth:</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.bandWidth}
                  </span>
                  ,
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">intensity:</span>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.intensity}
                  </span>
                </p>
                <p className="pl-4">&#125;);</p>
                <p>
                  <span className="text-purple-400 font-semibold">&lt;/script&gt;</span>
                </p>
              </div>
            </div>
          )}

          {/* Vue Snippet */}
          {displayedFramework === "vue" && (
            <div className="flex w-full min-w-max">
              <div className="flex flex-col text-neutral-600 select-none pr-3 sm:pr-7 border-r border-white/[0.08] text-right font-mono text-[11px] sm:text-[14px] leading-[1.85] sm:leading-[2.15] shrink-0">
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span>05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
                <span>09</span>
                <span>10</span>
                <span>11</span>
                <span>12</span>
                <span>13</span>
                <span>14</span>
              </div>

              <div className="pl-3 sm:pl-7 text-neutral-300 w-full">
                <p>
                  <span className="text-purple-400 font-semibold">&lt;script</span>{" "}
                  <span className="text-neutral-400">setup</span>
                  <span className="text-purple-400 font-semibold">&gt;</span>
                </p>
                <p className="pl-4">
                  <span className="text-purple-400 font-semibold">import</span>{" "}
                  <span className="text-white">&#123; ColorBends &#125;</span>{" "}
                  <span className="text-purple-400 font-semibold">from</span>{" "}
                  <span className="text-cyan-300">&apos;@components/ColorBends&apos;</span>;
                </p>
                <p>
                  <span className="text-purple-400 font-semibold">&lt;/script&gt;</span>
                </p>
                <p className="opacity-0">.</p>
                <p>
                  <span className="text-purple-400 font-semibold">&lt;template&gt;</span>
                </p>
                <p className="pl-4">
                  &lt;<span className="text-purple-300 font-bold">ColorBends</span>
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">color</span>=
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.09] border border-white/[0.14] text-[12px] text-neutral-200">
                    <span
                      className="w-2.5 h-2.5 rounded shadow-[0_0_8px_#00E5FF]"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span>&quot;{cfg.color}&quot;</span>
                  </span>
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">:speed</span>=
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    &quot;{cfg.speed}&quot;
                  </span>
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">:frequency</span>=
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    &quot;{cfg.frequency.toFixed(1)}&quot;
                  </span>
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">:noise</span>=
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    &quot;{cfg.noise}&quot;
                  </span>
                </p>
                <p className="pl-8 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">:intensity</span>=
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    &quot;{cfg.intensity}&quot;
                  </span>
                </p>
                <p className="pl-4">/&gt;</p>
                <p>
                  <span className="text-purple-400 font-semibold">&lt;/template&gt;</span>
                </p>
              </div>
            </div>
          )}

          {/* Svelte Snippet */}
          {displayedFramework === "svelte" && (
            <div className="flex w-full min-w-max">
              <div className="flex flex-col text-neutral-600 select-none pr-3 sm:pr-7 border-r border-white/[0.08] text-right font-mono text-[11px] sm:text-[14px] leading-[1.85] sm:leading-[2.15] shrink-0">
                <span>01</span>
                <span>02</span>
                <span>03</span>
                <span>04</span>
                <span>05</span>
                <span>06</span>
                <span>07</span>
                <span>08</span>
                <span>09</span>
                <span>10</span>
                <span>11</span>
                <span>12</span>
                <span>13</span>
              </div>

              <div className="pl-3 sm:pl-7 text-neutral-300 w-full">
                <p>
                  <span className="text-purple-400 font-semibold">&lt;script&gt;</span>
                </p>
                <p className="pl-4">
                  <span className="text-purple-400 font-semibold">import</span>{" "}
                  <span className="text-white">&#123; ColorBends &#125;</span>{" "}
                  <span className="text-purple-400 font-semibold">from</span>{" "}
                  <span className="text-cyan-300">&apos;@components/ColorBends&apos;</span>;
                </p>
                <p>
                  <span className="text-purple-400 font-semibold">&lt;/script&gt;</span>
                </p>
                <p className="opacity-0">.</p>
                <p>
                  &lt;<span className="text-purple-300 font-bold">ColorBends</span>
                </p>
                <p className="pl-6 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">color</span>=
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/[0.09] border border-white/[0.14] text-[12px] text-neutral-200">
                    <span
                      className="w-2.5 h-2.5 rounded shadow-[0_0_8px_#00E5FF]"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span>&quot;{cfg.color}&quot;</span>
                  </span>
                </p>
                <p className="pl-6 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">speed</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.speed}
                  </span>
                  &#125;
                </p>
                <p className="pl-6 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">frequency</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.frequency.toFixed(1)}
                  </span>
                  &#125;
                </p>
                <p className="pl-6 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">bandWidth</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.bandWidth}
                  </span>
                  &#125;
                </p>
                <p className="pl-6 flex items-center gap-2 flex-wrap">
                  <span className="text-neutral-300">intensity</span>=&#123;
                  <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-400/40 text-cyan-300 text-[12px] font-semibold">
                    {cfg.intensity}
                  </span>
                  &#125;
                </p>
                <p className="pl-4">/&gt;</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
