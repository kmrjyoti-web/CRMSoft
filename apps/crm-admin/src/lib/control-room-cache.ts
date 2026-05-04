import apiClient from "@/services/api-client";
import type { ApiResponse } from "@/types/api-response";
import type { ResolvedRule } from "@/features/control-room/types/control-room.types";

// ── IndexedDB Cache for Control Room Rules ──────────────

const DB_NAME = "crmsoft_rules";
const STORE_NAME = "rules";
const CACHE_VERSION_KEY = "__cache_version__";
const DB_VERSION = 1;

class ControlRoomCache {
  private db: IDBDatabase | null = null;

  /** Open or create the IndexedDB database. */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /** Fetch all resolved rules from the API, clear the store, and write them. */
  async loadAllRules(): Promise<void> {
    await this.init();

    const response = await apiClient
      .get<ApiResponse<{ rules: Record<string, ResolvedRule>; cacheVersion: string }>>(
        "/api/v1/control-room/resolve-all",
      )
      .then((r) => r.data);

    const { rules, cacheVersion } = response.data;

    const tx = this.db!.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Clear existing data
    store.clear();

    // Write all rules
    for (const [ruleCode, resolved] of Object.entries(rules)) {
      store.put(resolved, ruleCode);
    }

    // Write cache version
    store.put(cacheVersion, CACHE_VERSION_KEY);

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /** Read a single rule value from IndexedDB. */
  async getRule(ruleCode: string, pageCode?: string): Promise<unknown> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(ruleCode);

      request.onsuccess = () => {
        const resolved = request.result as ResolvedRule | undefined;
        if (!resolved) {
          resolve(undefined);
          return;
        }

        // If pageCode provided and there is a page-specific override, return it
        if (pageCode && resolved.pageOverrides && pageCode in resolved.pageOverrides) {
          resolve(resolved.pageOverrides[pageCode]);
          return;
        }

        // Otherwise return the base value
        resolve(resolved.value);
      };

      request.onerror = () => reject(request.error);
    });
  }

  /** Return all rules from IndexedDB as a Map<ruleCode, ResolvedRule>. */
  async getAllRules(): Promise<Map<string, ResolvedRule>> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.openCursor();
      const result = new Map<string, ResolvedRule>();

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          const key = cursor.key as string;
          if (key !== CACHE_VERSION_KEY) {
            result.set(key, cursor.value as ResolvedRule);
          }
          cursor.continue();
        } else {
          resolve(result);
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /** Get the locally cached version string, or undefined if not populated. */
  async getLocalVersion(): Promise<string | undefined> {
    await this.init();

    return new Promise<string | undefined>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(CACHE_VERSION_KEY);

      request.onsuccess = () => resolve(request.result as string | undefined);
      request.onerror = () => reject(request.error);
    });
  }

  /** Check if the local cache version differs from the server version. */
  async isCacheStale(): Promise<boolean> {
    await this.init();

    // Get local version
    const localVersion = await new Promise<string | undefined>((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(CACHE_VERSION_KEY);

      request.onsuccess = () => resolve(request.result as string | undefined);
      request.onerror = () => reject(request.error);
    });

    // No local cache yet — not stale, just unpopulated. Caller should load rules.
    if (!localVersion) return false;

    // Get server version
    const response = await apiClient
      .get<ApiResponse<{ cacheVersion: string }>>("/api/v1/control-room/cache-version")
      .then((r) => r.data);

    return response.data.cacheVersion !== localVersion;
  }

  /** Clear all data from the IndexedDB store. */
  async clear(): Promise<void> {
    await this.init();

    return new Promise((resolve, reject) => {
      const tx = this.db!.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const controlRoomCache = new ControlRoomCache();
