"use client";

import type { ReactNode } from "react";

import { usePermissionStore } from "@/stores/permission.store";

// ── Feature Gate ───────────────────────────────────────

interface FeatureGateProps {
  /** Feature flag name (e.g., "WHATSAPP_INTEGRATION") */
  feature: string;
  /** Rendered when feature is not enabled */
  fallback?: ReactNode;
  children: ReactNode;
}

export function FeatureGate({
  feature,
  fallback = null,
  children,
}: FeatureGateProps) {
  const hasFeature = usePermissionStore((s) => s.hasFeature);

  return hasFeature(feature) ? <>{children}</> : <>{fallback}</>;
}
