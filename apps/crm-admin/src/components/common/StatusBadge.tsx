"use client";

import { Badge } from "@/components/ui";

const DEFAULT_COLORS: Record<string, string> = {
  active: "green",
  inactive: "gray",
  pending: "yellow",
  draft: "blue",
  approved: "green",
  rejected: "red",
  cancelled: "gray",
  completed: "green",
  open: "blue",
  closed: "gray",
  new: "blue",
  "in-progress": "yellow",
  "on-hold": "orange",
};

interface StatusBadgeProps {
  status: string;
  colorMap?: Record<string, string>;
}

export function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const map = { ...DEFAULT_COLORS, ...colorMap };
  const key = status.toLowerCase().replace(/\s+/g, "-");
  const color = map[key] || "gray";
  return <Badge color={color}>{status}</Badge>;
}
