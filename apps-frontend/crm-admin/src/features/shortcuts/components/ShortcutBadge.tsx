"use client";

import { formatKeyPart, detectOS } from "../utils/os-keys";

interface ShortcutBadgeProps {
  keyString: string;
  isCustomized?: boolean;
  isLocked?: boolean;
  size?: "sm" | "md";
}

export function ShortcutBadge({ keyString, isCustomized, isLocked, size = "sm" }: ShortcutBadgeProps) {
  if (!keyString) return null;
  const os = detectOS();
  const parts = keyString.toLowerCase().split("+");
  const isMac = os === "mac";

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: isMac ? 1 : 3 }}>
      {parts.map((part, i) => (
        <kbd
          key={i}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: size === "sm" ? "2px 5px" : "3px 7px",
            fontSize: size === "sm" ? 11 : 12,
            fontFamily: "var(--font-mono, monospace)",
            fontWeight: 600,
            lineHeight: 1,
            borderRadius: 4,
            border: "1px solid",
            borderColor: isCustomized ? "var(--color-primary, #0ea5e9)" : "rgba(0,0,0,0.15)",
            background: isCustomized ? "rgba(14,165,233,0.1)" : "rgba(0,0,0,0.05)",
            color: isCustomized ? "var(--color-primary, #0ea5e9)" : "inherit",
            opacity: isLocked ? 0.65 : 1,
            minWidth: size === "sm" ? 18 : 22,
          }}
        >
          {formatKeyPart(part, os)}
        </kbd>
      ))}
    </span>
  );
}
