"use client";

import { useSyncExternalStore, useEffect } from "react";

import {
  getErrorLog,
  clearErrorLog,
  subscribeErrorLog,
  installGlobalErrorCapture,
} from "../utils/error-boundary";

import type { ErrorLogEntry } from "../types/dev-panel.types";

export function useErrorLog(): {
  errors: ErrorLogEntry[];
  clear: () => void;
} {
  // Install global capture once
  useEffect(() => {
    installGlobalErrorCapture();
  }, []);

  const errors = useSyncExternalStore(subscribeErrorLog, getErrorLog, getErrorLog);

  return { errors, clear: clearErrorLog };
}
