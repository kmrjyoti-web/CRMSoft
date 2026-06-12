"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// ── Breadcrumb ─────────────────────────────────────────

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-gray-500 px-6 py-3">
      <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
        Home
      </Link>
      {segments.map((segment, idx) => {
        const href = "/" + segments.slice(0, idx + 1).join("/");
        const label = segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        const isLast = idx === segments.length - 1;

        return (
          <span key={href} className="flex items-center gap-1.5">
            <span className="text-gray-300">/</span>
            {isLast ? (
              <span className="text-gray-700 font-medium">{label}</span>
            ) : (
              <Link href={href} className="hover:text-gray-700 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
