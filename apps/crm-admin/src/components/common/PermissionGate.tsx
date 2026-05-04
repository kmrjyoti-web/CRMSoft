"use client";

import type { ReactNode } from "react";

import { usePermissionStore } from "@/stores/permission.store";

// ── Permission Gate ────────────────────────────────────

interface PermissionGateProps {
  /** Single code or array of permission codes */
  code: string | string[];
  /** "any" = at least one matches, "all" = every code must match */
  mode?: "any" | "all";
  /** Rendered when permission check fails */
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  code,
  mode = "any",
  fallback = null,
  children,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } =
    usePermissionStore();

  const codes = Array.isArray(code) ? code : [code];

  const allowed =
    mode === "all" ? hasAllPermissions(codes) : hasAnyPermission(codes);

  return allowed ? <>{children}</> : <>{fallback}</>;
}
