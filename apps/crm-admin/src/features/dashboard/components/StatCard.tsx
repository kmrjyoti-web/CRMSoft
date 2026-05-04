"use client";

import { useEffect, useRef, useState } from "react";
import { Icon, IconName } from "@/components/ui";

function useCountUp(end: number, duration = 1200): number {
  const [cur, setCur] = useState(0);
  const prev = useRef(end);
  useEffect(() => {
    if (end === 0) { setCur(0); return; }
    const start = prev.current !== end ? 0 : cur;
    prev.current = end;
    const t0 = performance.now();
    let raf: number;
    const step = (now: number) => {
      const p = Math.min((now - t0) / duration, 1);
      setCur(Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return cur;
}

export interface StatCardProps {
  title: string;
  value: number;
  /** Optional total to display as "value/total" ratio */
  total?: number;
  icon: IconName;
  iconBg?: string;
  /** Small text below value e.g. "+20% from last week" */
  footnote?: string;
  footnoteBold?: string;
  footnotePositive?: boolean;
  /** Link label shown bottom-left, e.g. "View All" */
  linkLabel?: string;
  onLinkClick?: () => void;
}

export function StatCard({
  title, value, total, icon, iconBg = "#f97316",
  footnote, footnoteBold, footnotePositive = true,
  linkLabel = "View All", onLinkClick,
}: StatCardProps) {
  const animated = useCountUp(value);
  const animatedTotal = useCountUp(total ?? 0);

  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow cursor-default"
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        <Icon name={icon} size={22} color="#fff" />
      </div>

      {/* Title */}
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide leading-none mb-1">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {total != null ? `${animated}/${animatedTotal}` : animated.toLocaleString()}
        </p>
      </div>

      {/* Footnote */}
      {(footnote || footnoteBold) && (
        <p className="text-xs text-gray-500 leading-snug">
          {footnote && <span>{footnote} </span>}
          {footnoteBold && (
            <span
              className="font-semibold"
              style={{ color: footnotePositive ? "#16a34a" : "#ef4444" }}
            >
              {footnoteBold}
            </span>
          )}
        </p>
      )}

      {/* Link */}
      {linkLabel && (
        <button
          onClick={onLinkClick}
          className="text-xs font-medium text-blue-600 hover:text-blue-800 text-left mt-auto"
        >
          {linkLabel}
        </button>
      )}
    </div>
  );
}
