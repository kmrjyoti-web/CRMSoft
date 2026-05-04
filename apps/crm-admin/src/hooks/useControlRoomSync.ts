"use client";

import { useEffect } from "react";

import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

import { controlRoomCache } from "@/lib/control-room-cache";
import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";

const SYNC_INTERVAL_MS = 30_000; // 30 seconds

/**
 * Periodically checks if the Control Room cache is stale.
 * - If cache is empty: silently loads rules (no logout).
 * - If cache exists and server version differs: warn + redirect to login.
 * - Network errors are silently ignored.
 */
export function useControlRoomSync(): void {
  const router = useRouter();

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        // Check if we have a local version at all
        const localVersion = await controlRoomCache.getLocalVersion();

        // Get server version
        const response = await apiClient
          .get<ApiResponse<{ cacheVersion: string }>>("/api/v1/control-room/cache-version")
          .then((r) => r.data)
          .catch(() => null);

        if (!response) return; // Network error — skip silently

        const serverVersion = response.data?.cacheVersion;
        if (!serverVersion) return;

        if (!localVersion) {
          // No local cache — silently populate it
          await controlRoomCache.loadAllRules();
          return;
        }

        if (serverVersion !== localVersion) {
          // Config changed — notify user and re-login
          toast.error(
            "System configuration updated. Please log in again.",
            { duration: 5000 },
          );
          await controlRoomCache.clear();
          router.push("/login?reason=config_changed");
        }
      } catch {
        // Silently ignore all errors during background sync
      }
    }, SYNC_INTERVAL_MS);

    return () => {
      clearInterval(intervalId);
    };
  }, [router]);
}
