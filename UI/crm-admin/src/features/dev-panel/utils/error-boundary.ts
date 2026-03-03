import type { ErrorLogEntry, ErrorSeverity } from "../types/dev-panel.types";

// ── Singleton error log ─────────────────────────────────

const MAX_LOG_SIZE = 200;
let errorLog: ErrorLogEntry[] = [];
let nextId = 1;
let listeners: Array<() => void> = [];

function notify() {
  listeners.forEach((fn) => fn());
}

export function getErrorLog(): ErrorLogEntry[] {
  return errorLog;
}

export function clearErrorLog() {
  errorLog = [];
  notify();
}

export function subscribeErrorLog(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function addErrorEntry(
  severity: ErrorSeverity,
  message: string,
  extra?: Partial<Pick<ErrorLogEntry, "stack" | "component" | "url" | "metadata">>,
) {
  const entry: ErrorLogEntry = {
    id: `err-${nextId++}`,
    timestamp: new Date().toISOString(),
    severity,
    message,
    ...extra,
  };
  errorLog = [entry, ...errorLog].slice(0, MAX_LOG_SIZE);
  notify();
}

// ── Global error listeners ──────────────────────────────

let installed = false;

export function installGlobalErrorCapture() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  window.addEventListener("error", (event) => {
    addErrorEntry("error", event.message || "Uncaught error", {
      stack: event.error?.stack,
      url: event.filename ? `${event.filename}:${event.lineno}:${event.colno}` : undefined,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message =
      typeof reason === "string"
        ? reason
        : reason?.message ?? "Unhandled Promise rejection";
    addErrorEntry("error", message, {
      stack: reason?.stack,
    });
  });

  // Intercept console.warn to capture warnings
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    addErrorEntry("warning", args.map(String).join(" "));
    originalWarn.apply(console, args);
  };
}
