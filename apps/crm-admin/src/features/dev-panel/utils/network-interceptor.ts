import type { NetworkLogEntry } from "../types/dev-panel.types";

// ── Singleton network log ───────────────────────────────

const MAX_LOG_SIZE = 100;
let networkLog: NetworkLogEntry[] = [];
let nextId = 1;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function getNetworkLog(): NetworkLogEntry[] {
  return networkLog;
}

export function clearNetworkLog() {
  networkLog = [];
  notify();
}

export function subscribeNetworkLog(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function addNetworkEntry(entry: Omit<NetworkLogEntry, "id">): string {
  const id = `net-${nextId++}`;
  networkLog = [{ ...entry, id }, ...networkLog].slice(0, MAX_LOG_SIZE);
  notify();
  return id;
}

export function updateNetworkEntry(id: string, update: Partial<NetworkLogEntry>) {
  networkLog = networkLog.map((e) => (e.id === id ? { ...e, ...update } : e));
  notify();
}

// ── Axios interceptor installer ─────────────────────────

let installed = false;

export function installNetworkInterceptor(axiosInstance: {
  interceptors: {
    request: { use: (fn: (config: unknown) => unknown) => number };
    response: {
      use: (
        onSuccess: (res: unknown) => unknown,
        onError: (err: unknown) => unknown,
      ) => number;
    };
  };
}) {
  if (installed) return;
  installed = true;

  axiosInstance.interceptors.request.use((config: unknown) => {
    const cfg = config as { method?: string; url?: string; baseURL?: string; data?: unknown; _networkLogId?: string };
    const id = addNetworkEntry({
      timestamp: new Date().toISOString(),
      method: (cfg.method ?? "GET").toUpperCase(),
      url: `${cfg.baseURL ?? ""}${cfg.url ?? ""}`,
      status: "pending",
      requestBody: cfg.data,
    });
    cfg._networkLogId = id;
    return config;
  });

  axiosInstance.interceptors.response.use(
    (response: unknown) => {
      const res = response as { config?: { _networkLogId?: string; _startTime?: number }; status?: number; data?: unknown };
      if (res.config?._networkLogId) {
        updateNetworkEntry(res.config._networkLogId, {
          status: "success",
          statusCode: res.status,
          responseBody: res.data,
          duration: res.config._startTime ? Date.now() - res.config._startTime : undefined,
        });
      }
      return response;
    },
    (error: unknown) => {
      const err = error as { config?: { _networkLogId?: string }; response?: { status?: number }; message?: string };
      if (err.config?._networkLogId) {
        updateNetworkEntry(err.config._networkLogId, {
          status: "error",
          statusCode: err.response?.status,
          error: err.message,
        });
      }
      return Promise.reject(error);
    },
  );
}
