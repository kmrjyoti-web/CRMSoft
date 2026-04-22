"use client";

import { useSyncExternalStore, useEffect } from "react";

import { api } from "@/services/api-client";

import {
  getNetworkLog,
  clearNetworkLog,
  subscribeNetworkLog,
  installNetworkInterceptor,
} from "../utils/network-interceptor";

import type { NetworkLogEntry } from "../types/dev-panel.types";

export function useNetworkLog(): {
  logs: NetworkLogEntry[];
  clear: () => void;
} {
  // Install interceptor once
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    installNetworkInterceptor(api as any);
  }, []);

  const logs = useSyncExternalStore(subscribeNetworkLog, getNetworkLog, getNetworkLog);

  return { logs, clear: clearNetworkLog };
}
