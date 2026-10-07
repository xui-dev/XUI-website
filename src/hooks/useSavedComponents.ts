"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

const GUEST_STORAGE_KEY = "xui_guest_saved_components";
const LEGACY_STORAGE_KEY = "xui_saved_components";

// Module-level deduplication for cloud sync/fetch across multiple component card instances
let activeCloudPromise: Promise<string[] | null> | null = null;
let lastCloudFetchTime = 0;
let lastCloudFetchUserId: string | null = null;
const CLOUD_CACHE_TTL_MS = 15000;

export function resetSavedCloudCache() {
  lastCloudFetchUserId = null;
  lastCloudFetchTime = 0;
  activeCloudPromise = null;
}

export function useSavedComponents() {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Derive isolated storage key based on active user
  const currentStorageKey = user
    ? `xui_user_saved_${user.id}`
    : GUEST_STORAGE_KEY;

  // Helper to read localStorage safely
  const getLocalSavedIds = useCallback((key: string): string[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, []);

  // Helper to write localStorage safely
  const setLocalSavedIds = useCallback((key: string, ids: string[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(ids));
      window.dispatchEvent(
        new CustomEvent("xui_saved_sync", { detail: { savedIds: ids } })
      );
    } catch {
      // LocalStorage might be disabled
    }
  }, []);

  // 1. Initial Load & Auth Sync
  useEffect(() => {
    let cancelled = false;

    // A. Guest Mode: Isolated guest key
    if (!user) {
      if (typeof window !== "undefined") {
        try {
          const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacy && !localStorage.getItem(GUEST_STORAGE_KEY)) {
            localStorage.setItem(GUEST_STORAGE_KEY, legacy);
          }
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        } catch {}
      }

      const guestItems = getLocalSavedIds(GUEST_STORAGE_KEY);
      if (!cancelled) {
        setSavedIds(guestItems);
        setIsLoading(false);
      }
      return () => {
        cancelled = true;
      };
    }

    // B. Authenticated Mode: Isolated user key
    const userStorageKey = `xui_user_saved_${user.id}`;
    const initialUserCached = getLocalSavedIds(userStorageKey);
    setSavedIds(initialUserCached);

    // Check if there are any guest bookmarks to migrate
    const guestItems = getLocalSavedIds(GUEST_STORAGE_KEY);

    if (guestItems.length > 0) {
      setIsLoading(true);

      // Deduplicate in-flight sync request if multiple components mount simultaneously
      if (!activeCloudPromise) {
        activeCloudPromise = fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync", componentIds: guestItems }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => (data && Array.isArray(data.savedIds) ? data.savedIds : null))
          .catch((err) => {
            console.error("Failed to sync bookmarks with cloud:", err);
            return null;
          })
          .finally(() => {
            activeCloudPromise = null;
          });
      }

      activeCloudPromise.then((newSavedIds) => {
        if (cancelled) return;
        if (newSavedIds) {
          setSavedIds(newSavedIds);
          setLocalSavedIds(userStorageKey, newSavedIds);

          if (typeof window !== "undefined") {
            try {
              localStorage.removeItem(GUEST_STORAGE_KEY);
              localStorage.removeItem(LEGACY_STORAGE_KEY);
            } catch {}
          }
        }
        setIsLoading(false);
      });
    } else {
      // If fetched recently for this user in this session, avoid redundant requests across 20+ cards
      const isFresh =
        lastCloudFetchUserId === user.id &&
        Date.now() - lastCloudFetchTime < CLOUD_CACHE_TTL_MS;

      if (isFresh) {
        setIsLoading(false);
      } else {
        setIsLoading(true);

        // Deduplicate in-flight GET /api/saved across all mounting cards
        if (!activeCloudPromise) {
          lastCloudFetchUserId = user.id;
          lastCloudFetchTime = Date.now();
          activeCloudPromise = fetch("/api/saved")
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => (data && Array.isArray(data.savedIds) ? data.savedIds : null))
            .catch((err) => {
              console.error("Failed to fetch cloud bookmarks:", err);
              return null;
            })
            .finally(() => {
              activeCloudPromise = null;
            });
        }

        activeCloudPromise.then((newSavedIds) => {
          if (cancelled) return;
          if (newSavedIds) {
            setSavedIds(newSavedIds);
            setLocalSavedIds(userStorageKey, newSavedIds);
          }
          setIsLoading(false);
        });
      }
    }

    // Listen to cross-component sync events within same tab
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent<{ savedIds: string[] }>;
      if (customEvent.detail && Array.isArray(customEvent.detail.savedIds)) {
        if (!cancelled) {
          setSavedIds(customEvent.detail.savedIds);
        }
      }
    };

    // Listen to cross-tab storage changes across separate browser windows
    const handleStorageChange = (e: StorageEvent) => {
      const activeKey = user ? `xui_user_saved_${user.id}` : GUEST_STORAGE_KEY;
      if (e.key === activeKey && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed) && !cancelled) {
            setSavedIds(parsed);
          }
        } catch {}
      }
    };

    window.addEventListener("xui_saved_sync", handleSync);
    window.addEventListener("storage", handleStorageChange);
    return () => {
      cancelled = true;
      window.removeEventListener("xui_saved_sync", handleSync);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, getLocalSavedIds, setLocalSavedIds]);

  // 2. Check if a component is saved
  const isSaved = useCallback(
    (componentId: string) => {
      return savedIds.includes(componentId);
    },
    [savedIds]
  );

  // 3. Toggle Save / Unsave
  const toggleSave = useCallback(
    async (componentId: string, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!componentId) return false;

      // Read fresh state directly to prevent stale closure race conditions
      const currentList = getLocalSavedIds(currentStorageKey);
      const isCurrentlySaved = currentList.includes(componentId);
      const nextSavedIds = isCurrentlySaved
        ? currentList.filter((id) => id !== componentId)
        : [...currentList, componentId];

      // Optimistic state update in current isolated storage
      setSavedIds(nextSavedIds);
      setLocalSavedIds(currentStorageKey, nextSavedIds);

      // If user is authenticated, persist to Supabase cloud
      if (user) {
        try {
          const res = await fetch("/api/saved", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: isCurrentlySaved ? "unsave" : "save",
              componentId,
            }),
          });
          if (!res.ok) {
            throw new Error(`Cloud save responded with HTTP ${res.status}`);
          }
        } catch (err) {
          console.error("Failed to persist save state to cloud, reverting targeted item:", err);
          // Granular targeted rollback: only revert the specific component without overwriting other saves
          const latestList = getLocalSavedIds(currentStorageKey);
          const revertedList = isCurrentlySaved
            ? Array.from(new Set([...latestList, componentId]))
            : latestList.filter((id) => id !== componentId);

          setSavedIds(revertedList);
          setLocalSavedIds(currentStorageKey, revertedList);
          return isCurrentlySaved;
        }
      }

      return !isCurrentlySaved;
    },
    [user, currentStorageKey, getLocalSavedIds, setLocalSavedIds]
  );

  return {
    savedIds,
    isSaved,
    toggleSave,
    isLoading,
    isAuthenticated: !!user,
  };
}
