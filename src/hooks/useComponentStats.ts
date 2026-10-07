"use client";

import { useState, useEffect, useCallback } from "react";

function formatViews(val: number | string): string {
  if (val === 0 || val === "0") return "0";
  if (val == null || val === "") return "0";
  if (typeof val === "string" && (val.endsWith("k") || val.endsWith("M"))) {
    return val;
  }
  const num = typeof val === "string" ? parseInt(val.replace(/[^0-9]/g, ""), 10) : val;
  if (isNaN(num)) return String(val);
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
}

export function useComponentStats(
  componentId: string,
  initialViews: string = "0",
  options?: { autoFetch?: boolean }
) {
  const autoFetch = options?.autoFetch ?? false;
  const [views, setViews] = useState<string>(initialViews);
  const [shares, setShares] = useState<number>(0);

  // 1. Fetch fresh stats from API & listen to view sync
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fetch fresh stats from API only if explicitly requested (e.g. component detail page)
    if (autoFetch) {
      fetch(`/api/stats/${componentId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && data.views !== undefined) {
            setViews((currentViews) => {
              const rawCurrent =
                typeof currentViews === "string"
                  ? parseInt(currentViews.replace(/[^0-9]/g, ""), 10)
                  : currentViews;
              const rawIncoming =
                typeof data.views === "string"
                  ? parseInt(data.views.replace(/[^0-9]/g, ""), 10)
                  : data.views;
              if (!isNaN(rawCurrent) && !isNaN(rawIncoming) && rawIncoming < rawCurrent) {
                // Prevent race condition: do not revert if incremental POST view already updated view count higher
                return currentViews;
              }
              return formatViews(data.views);
            });
          }
          if (data && typeof data.shares === "number") {
            setShares(data.shares);
          }
        })
        .catch(() => {});
    }

    const handleViewsSync = (e: Event) => {
      const customEvent = e as CustomEvent<{
        id: string;
        views: number | string;
      }>;
      if (customEvent.detail && customEvent.detail.id === componentId) {
        setViews(formatViews(customEvent.detail.views));
      }
    };

    window.addEventListener("xui_views_sync", handleViewsSync);
    return () => {
      window.removeEventListener("xui_views_sync", handleViewsSync);
    };
  }, [componentId, autoFetch]);

  // 2. Record share
  const recordShare = useCallback(() => {
    setShares((prev) => prev + 1);
    fetch(`/api/stats/${componentId}?action=share`, {
      method: "POST",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.shares === "number") {
          setShares(data.shares);
        }
      })
      .catch(() => {});
  }, [componentId]);

  return {
    views,
    shares,
    recordShare,
  };
}
