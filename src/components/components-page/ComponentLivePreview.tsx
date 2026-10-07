"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { transform } from "sucrase";
import registryComponentMap from "@/lib/registryComponentMap";

export interface ComponentLivePreviewProps {
  id: string;
  code?: string;
  interactive?: boolean;
  scale?: number;
  autoScale?: boolean;
  className?: string;
}

export default function ComponentLivePreview({
  id,
  code: initialCode,
  interactive = true,
  autoScale = true,
  className,
}: ComponentLivePreviewProps) {
  // 1. Check if a statically registered component exists
  const StaticComponent = registryComponentMap[id];

  const [fetchedCode, setFetchedCode] = useState<string | null>(initialCode || null);
  const [loading, setLoading] = useState<boolean>(!StaticComponent && !initialCode);

  // Sync initialCode if passed or changed
  useEffect(() => {
    if (initialCode) {
      setFetchedCode(initialCode);
      setLoading(false);
    }
  }, [initialCode]);

  // If no static component and no code provided, fetch dynamically from registry API
  useEffect(() => {
    if (StaticComponent || initialCode) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/registry/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!isMounted) return;
        if (data?.files?.[0]?.content) {
          setFetchedCode(data.files[0].content);
        } else {
          setFetchedCode(null);
        }
      })
      .catch(() => {
        if (isMounted) setFetchedCode(null);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id, StaticComponent, initialCode]);

  // If statically registered component is present, render with responsive auto-scale
  if (StaticComponent) {
    return (
      <ResponsiveNativeScaler autoScale={autoScale}>
        <StaticComponent />
      </ResponsiveNativeScaler>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8 text-neutral-500 text-sm animate-pulse">
        Loading preview…
      </div>
    );
  }

  if (!fetchedCode) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-neutral-500 text-sm gap-2">
        <span className="font-mono text-xs text-neutral-600">[{id}]</span>
        <span>Interactive Preview</span>
      </div>
    );
  }

  return (
    <LiveIframeSandbox
      code={fetchedCode}
      interactive={interactive}
      autoScale={autoScale}
      className={className}
    />
  );
}

// ── Native React Component Auto-Fit Responsive Scaler ──
function ResponsiveNativeScaler({
  children,
  autoScale = true,
}: {
  children: React.ReactNode;
  autoScale?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!autoScale) return;
    const container = containerRef.current;
    const scaler = scalerRef.current;
    if (!container || !scaler) return;

    function recalculate() {
      if (!container || !scaler) return;
      const child = scaler.firstElementChild as HTMLElement | null;
      if (!child) return;

      const availW = container.clientWidth;
      const availH = container.clientHeight;
      if (availW <= 0 || availH <= 0) return;

      // Temporarily reset zoom to 1 to measure true unzoomed natural dimensions
      const prevZoom = scaler.style.zoom;
      scaler.style.zoom = "1";
      const rect = child.getBoundingClientRect();
      let naturalW = child.offsetWidth || rect.width;
      let naturalH = child.offsetHeight || rect.height;

      if (scaler.children.length > 1) {
        let minX = rect.left, maxX = rect.right, minY = rect.top, maxY = rect.bottom;
        for (let i = 1; i < scaler.children.length; i++) {
          const cr = scaler.children[i].getBoundingClientRect();
          if (cr.left < minX) minX = cr.left;
          if (cr.right > maxX) maxX = cr.right;
          if (cr.top < minY) minY = cr.top;
          if (cr.bottom > maxY) maxY = cr.bottom;
        }
        naturalW = Math.max(naturalW, maxX - minX);
        naturalH = Math.max(naturalH, maxY - minY);
      }

      scaler.style.zoom = prevZoom;

      if (naturalW <= 0 || naturalH <= 0) return;

      const padding = 28;
      const targetW = Math.max(availW - padding, 20);
      const targetH = Math.max(availH - padding, 20);

      const scaleX = targetW / naturalW;
      const scaleY = targetH / naturalH;
      const rawScale = Math.min(scaleX, scaleY);

      const MAX_UPSCALE = 3.0;
      const TARGET_FILL = 0.60;

      let newScale: number;
      if (rawScale < 0.88) {
        // Component larger than container → scale down
        newScale = Math.max(Math.floor(rawScale * 100) / 100, 0.15);
      } else if (rawScale <= 1.10) {
        // Near-perfect fit
        newScale = 1;
      } else {
        // Component smaller than container → smart upscale
        const shortSide = Math.min(availW, availH) - padding;
        const targetSize = shortSide * TARGET_FILL;
        const majorDimension = Math.max(naturalW, naturalH);
        const targetZoom = targetSize / majorDimension;
        newScale = Math.min(targetZoom, MAX_UPSCALE, rawScale);
        newScale = Math.floor(newScale * 20) / 20; // round to nearest 0.05
        newScale = Math.max(newScale, 1);
      }

      setScale(newScale);
      setReady(true);
    }

    const ro = new ResizeObserver(() => recalculate());
    ro.observe(container);

    requestAnimationFrame(recalculate);
    const t1 = setTimeout(recalculate, 60);
    const t2 = setTimeout(recalculate, 250);
    const tFallback = setTimeout(() => setReady(true), 350);

    return () => {
      ro.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(tFallback);
    };
  }, [autoScale]);

  if (!autoScale) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden relative"
    >
      <div
        ref={scalerRef}
        style={{
          zoom: scale,
          opacity: ready ? 1 : 0,
          transition: "opacity 0.15s ease, zoom 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="flex items-center justify-center"
      >
        {children}
      </div>
    </div>
  );
}

// ── Ultra-Fast Zero-CDN Sandboxed Runner (Sucrase Engine) ──

function rewriteImports(jsCode: string): string {
  return jsCode.replace(
    /(import\s+(?:[\w\s{},*]+from\s+)?['"]|export\s+(?:[\w\s{},*]+from\s+)?['"]|import\s*\(\s*['"])([^'"]+)(['"]\s*\)?)/g,
    function (match, prefix, specifier, suffix) {
      if (
        specifier.startsWith("http://") ||
        specifier.startsWith("https://") ||
        specifier.startsWith("./") ||
        specifier.startsWith("../") ||
        specifier.startsWith("/") ||
        specifier.startsWith("data:")
      ) {
        return match;
      }
      if (specifier === "react") return `${prefix}https://esm.sh/react@18.3.1${suffix}`;
      if (specifier === "react/jsx-runtime") return `${prefix}https://esm.sh/react@18.3.1/jsx-runtime${suffix}`;
      if (specifier === "react/jsx-dev-runtime") return `${prefix}https://esm.sh/react@18.3.1/jsx-dev-runtime${suffix}`;
      if (specifier.startsWith("react/")) return `${prefix}https://esm.sh/react@18.3.1/${specifier.slice(6)}${suffix}`;
      if (specifier === "react-dom") return `${prefix}https://esm.sh/react-dom@18.3.1${suffix}`;
      if (specifier === "react-dom/client") return `${prefix}https://esm.sh/react-dom@18.3.1/client${suffix}`;
      if (specifier.startsWith("react-dom/")) return `${prefix}https://esm.sh/react-dom@18.3.1/${specifier.slice(10)}${suffix}`;
      if (specifier === "styled-components") return `${prefix}https://esm.sh/styled-components@6.1.13?deps=react@18.3.1,react-dom@18.3.1${suffix}`;
      if (specifier === "lucide-react") return `${prefix}https://esm.sh/lucide-react@0.475.0?deps=react@18.3.1${suffix}`;
      if (specifier === "framer-motion" || specifier.startsWith("framer-motion/")) return `${prefix}https://esm.sh/${specifier}?deps=react@18.3.1,react-dom@18.3.1${suffix}`;
      if (specifier === "motion/react" || specifier === "motion" || specifier.startsWith("motion/")) return `${prefix}https://esm.sh/${specifier}?deps=react@18.3.1,react-dom@18.3.1${suffix}`;
      return `${prefix}https://esm.sh/${specifier}?deps=react@18.3.1,react-dom@18.3.1${suffix}`;
    }
  );
}

function LiveIframeSandbox({
  code,
  interactive = true,
  autoScale = true,
  className,
}: {
  code: string;
  interactive?: boolean;
  autoScale?: boolean;
  className?: string;
}) {
  const isHtmlOnly = useMemo(() => {
    const trimmed = code.trim();
    return (
      !trimmed.includes("import ") &&
      !trimmed.includes("export default") &&
      !trimmed.includes("function") &&
      !trimmed.includes("const ") &&
      !trimmed.includes("let ") &&
      trimmed.startsWith("<")
    );
  }, [code]);

  const compiledResult = useMemo(() => {
    if (isHtmlOnly) {
      return { js: "", error: null };
    }

    try {
      let prepSource = code;
      const hasExport = /export\s+default|export\s+(?:function|const|let|var|class)/.test(prepSource);
      if (!hasExport) {
        const compMatch = prepSource.match(/(?:function|const|let|var|class)\s+([A-Z]\w*)/);
        if (compMatch && compMatch[1]) {
          prepSource += `\nexport default ${compMatch[1]};`;
        }
      }

      // Fast in-browser transformation via Sucrase (2ms, 0 external downloads)
      const transpiled = transform(prepSource, {
        transforms: ["jsx", "typescript"],
        jsxRuntime: "classic",
        production: true,
      }).code;

      const resolved = rewriteImports(transpiled);
      return { js: resolved, error: null };
    } catch (err: any) {
      return { js: "", error: err?.message || String(err) };
    }
  }, [code, isHtmlOnly]);

  const srcDoc = useMemo(() => {
    const autoFitScript = `
      function setupAutoFit(container, target) {
        let isUpdating = false;

        function recalculate() {
          if (isUpdating) return;
          if (!container || !target) return;
          const child = target.firstElementChild;
          if (!child) return;

          const availW = container.clientWidth || container.offsetWidth;
          const availH = container.clientHeight || container.offsetHeight;
          if (availW <= 0 || availH <= 0) return;

          // Temporarily reset zoom to 1 to measure true unzoomed natural dimensions
          const prevZoom = target.style.zoom;
          target.style.zoom = '1';
          const rect = child.getBoundingClientRect();
          let naturalW = child.offsetWidth || rect.width;
          let naturalH = child.offsetHeight || rect.height;

          if (target.children.length > 1) {
            let minX = rect.left, maxX = rect.right, minY = rect.top, maxY = rect.bottom;
            for (let i = 1; i < target.children.length; i++) {
              const cr = target.children[i].getBoundingClientRect();
              if (cr.left < minX) minX = cr.left;
              if (cr.right > maxX) maxX = cr.right;
              if (cr.top < minY) minY = cr.top;
              if (cr.bottom > maxY) maxY = cr.bottom;
            }
            naturalW = Math.max(naturalW, maxX - minX);
            naturalH = Math.max(naturalH, maxY - minY);
          }

          target.style.zoom = prevZoom;

          if (naturalW <= 0 || naturalH <= 0) return;

          const padding = 28;
          const targetW = Math.max(availW - padding, 20);
          const targetH = Math.max(availH - padding, 20);

          const scaleX = targetW / naturalW;
          const scaleY = targetH / naturalH;
          const rawScale = Math.min(scaleX, scaleY);

          const MAX_UPSCALE = 3.0;
          const TARGET_FILL = 0.60;

          let scale;
          if (rawScale < 0.88) {
            // Component larger than card → scale down
            scale = Math.max(Math.floor(rawScale * 100) / 100, 0.15);
          } else if (rawScale <= 1.10) {
            // Near-perfect fit
            scale = 1;
          } else {
            // Component smaller than card → smart upscale
            const shortSide = Math.min(availW, availH) - padding;
            const targetSize = shortSide * TARGET_FILL;
            const majorDimension = Math.max(naturalW, naturalH);
            const targetZoom = targetSize / majorDimension;
            scale = Math.min(targetZoom, MAX_UPSCALE, rawScale);
            scale = Math.floor(scale * 20) / 20; // round to nearest 0.05
            scale = Math.max(scale, 1);
          }

          const currentScale = parseFloat(target.style.zoom) || 1;
          if (Math.abs(scale - currentScale) > 0.01 || target.style.opacity !== '1') {
            isUpdating = true;
            target.style.zoom = String(scale);
            target.style.transform = 'none';
            target.style.opacity = '1';
            isUpdating = false;
          }
        }

        if (window.ResizeObserver) {
          const ro = new ResizeObserver(() => {
            recalculate();
          });
          ro.observe(container);
        }

        requestAnimationFrame(recalculate);
        setTimeout(recalculate, 60);
        setTimeout(recalculate, 200);
        setTimeout(recalculate, 600);
        setTimeout(() => {
          if (target && target.style.opacity !== '1') {
            target.style.opacity = '1';
          }
        }, 400);
      }
    `;

    const navigationGuardScript = `
      // Navigation Sandbox Guard: Intercept all link clicks and form submits to prevent reloading or hijacking the preview
      (function() {
        document.addEventListener('click', function(e) {
          var el = e.target;
          while (el && el !== document) {
            if (el.tagName === 'A' || el.tagName === 'AREA') {
              // Intercept browser frame navigation without breaking React synthetic event propagation
              e.preventDefault();
              break;
            }
            el = el.parentElement;
          }
        }, true);

        document.addEventListener('submit', function(e) {
          e.preventDefault();
        }, true);

        try {
          window.open = function() { return null; };
          if (window.location) {
            window.location.assign = function() {};
            window.location.replace = function() {};
          }
        } catch (_) {}

        window.addEventListener('beforeunload', function(e) {
          e.preventDefault();
          return false;
        });
      })();
    `;

    if (isHtmlOnly) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    ${navigationGuardScript}
  </script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }
    #root {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #preview-scaler {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s ease, zoom 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    ::-webkit-scrollbar { display: none; }
  </style>
</head>
<body>
  <div id="root">
    <div id="preview-scaler">
      ${code}
    </div>
  </div>
  <script>
    ${autoFitScript}
    ${autoScale ? `setupAutoFit(document.getElementById('root'), document.getElementById('preview-scaler'));` : `const s = document.getElementById('preview-scaler'); if (s) s.style.opacity = '1';`}
  </script>
</body>
</html>`;
    }

    if (compiledResult.error) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      margin: 0;
      padding: 1rem;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div style="max-width: 440px; width: 92%; padding: 18px 20px; border-radius: 16px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #fca5a5;">
    <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: #f87171; margin-bottom: 8px;">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>
      <span>Compilation Notice</span>
    </div>
    <div style="font-size: 11px; color: #e2e8f0; line-height: 1.5; font-family: monospace; background: rgba(0,0,0,0.45); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); word-break: break-word;">
      ${compiledResult.error.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
    </div>
  </div>
</body>
</html>`;
    }

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    ${navigationGuardScript}
  </script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: '#2563eb',
          }
        }
      }
    }
  </script>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background: transparent;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      overflow: hidden;
    }
    #root {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      position: relative;
      overflow: hidden;
    }
    #preview-scaler {
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.15s ease, zoom 0.15s cubic-bezier(0.16, 1, 0.3, 1);
    }
    ::-webkit-scrollbar { display: none; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import * as React from 'https://esm.sh/react@18.3.1';
    import * as ReactDOMClient from 'https://esm.sh/react-dom@18.3.1/client';

    // Global React hook exposure for resilient code execution
    window.React = React;
    window.useState = React.useState;
    window.useEffect = React.useEffect;
    window.useRef = React.useRef;
    window.useMemo = React.useMemo;
    window.useCallback = React.useCallback;
    window.useId = React.useId;

    ${autoFitScript}

    async function mountComponent() {
      const rootEl = document.getElementById('root');
      try {
        const sourceCode = ${JSON.stringify(compiledResult.js)};
        const blob = new Blob([sourceCode], { type: 'application/javascript' });
        const moduleUrl = URL.createObjectURL(blob);
        const mod = await import(moduleUrl);
        URL.revokeObjectURL(moduleUrl);

        let ComponentToRender = mod.default || Object.values(mod).find(v => typeof v === 'function');
        if (ComponentToRender && typeof ComponentToRender === 'object' && typeof ComponentToRender.default === 'function') {
          ComponentToRender = ComponentToRender.default;
        }

        if (ComponentToRender && rootEl) {
          rootEl.innerHTML = '<div id="preview-scaler"></div>';
          const scalerEl = document.getElementById('preview-scaler');
          const root = ReactDOMClient.createRoot(scalerEl);
          root.render(React.createElement(ComponentToRender));

          ${autoScale ? `setupAutoFit(rootEl, scalerEl);` : `scalerEl.style.opacity = '1';`}
        } else if (rootEl) {
          rootEl.innerHTML = '<div style="color:#a3a3a3;font-size:12px;padding:8px 12px;background:rgba(255,255,255,0.04);border-radius:8px;">Component rendered without visual export</div>';
        }
      } catch (err) {
        console.error('Mount error:', err);
        if (rootEl) {
          const errMsg = err && err.message ? err.message : String(err);
          rootEl.innerHTML = \`
            <div style="max-width: 440px; width: 92%; padding: 18px 20px; border-radius: 16px; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.25); color: #fca5a5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; color: #f87171;">
                  <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ef4444;"></span>
                  <span>Render Error</span>
                </div>
                <button onclick="window.__remount && window.__remount()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #e2e8f0; padding: 3px 10px; border-radius: 6px; font-size: 11px; cursor: pointer;">
                  Retry
                </button>
              </div>
              <div style="font-size: 11px; color: #e2e8f0; line-height: 1.5; font-family: monospace; background: rgba(0,0,0,0.45); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); word-break: break-word;">
                \${errMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
              </div>
            </div>
          \`;
        }
      }
    }

    window.__remount = mountComponent;
    mountComponent();
  </script>
</body>
</html>`;
  }, [code, isHtmlOnly, compiledResult, autoScale]);

  return (
    <iframe
      srcDoc={srcDoc}
      title="Component Preview"
      sandbox="allow-scripts allow-same-origin"
      loading="lazy"
      className={`w-full h-full min-h-[260px] sm:min-h-[300px] border-0 bg-transparent transition-opacity duration-300 ${
        interactive ? "pointer-events-auto" : "pointer-events-none select-none"
      } ${className || ""}`}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  );
}
