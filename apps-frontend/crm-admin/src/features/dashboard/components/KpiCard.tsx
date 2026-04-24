"use client";

import { useState, useEffect, useRef } from "react";

import { Icon, IconName } from "@/components/ui";

// ── Count-up hook ─────────────────────────────────────

function useCountUp(end: number, duration = 1200): number {
  const [current, setCurrent] = useState(0);
  const prevEnd = useRef(end);

  useEffect(() => {
    if (end === 0) {
      setCurrent(0);
      return;
    }
    const start = prevEnd.current !== end ? 0 : current;
    prevEnd.current = end;
    const startTime = performance.now();

    let raf: number;
    const step = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(start + (end - start) * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);

  return current;
}

// ── Types ─────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  trend?: { value: number; isPositive: boolean };
  color?: string;
  /** Card variant: default (white bg), filled (color bg), clean (white bg with colored left accent) */
  variant?: "default" | "filled" | "clean";
  /** Subtitle text (e.g. "last week") */
  subtitle?: string;
}

// ── Component ─────────────────────────────────────────

export function KpiCard({ title, value, icon, trend, color, variant = "default", subtitle }: KpiCardProps) {
  // Parse numeric value for count-up animation
  const numericValue = typeof value === "number" ? value : null;
  const animated = useCountUp(numericValue ?? 0);

  const bg = color ?? "#3b82f6";

  // ── Clean variant (white card, colored accent) ────
  if (variant === "clean") {
    return (
      <div className="kpi-card-clean">
        <div className="kpi-card-clean__accent" style={{ background: bg }} />
        <div className="kpi-card-clean__content">
          <div className="kpi-card-clean__top">
            <span className="kpi-card-clean__title">{title}</span>
            <div className="kpi-card-clean__icon" style={{ background: `${bg}12` }}>
              <Icon name={icon} size={18} color={bg} />
            </div>
          </div>
          <p className="kpi-card-clean__value">
            {numericValue != null ? animated : value}
          </p>
          {(trend || subtitle) && (
            <div className="kpi-card-clean__bottom">
              {trend && (
                <span
                  className="kpi-card-clean__trend"
                  style={{ color: trend.isPositive ? "#16a34a" : "#ef4444" }}
                >
                  <Icon
                    name={trend.isPositive ? "trending-up" : "trending-down"}
                    size={13}
                    color={trend.isPositive ? "#16a34a" : "#ef4444"}
                  />
                  {trend.isPositive ? "+" : ""}{trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="kpi-card-clean__subtitle">{subtitle}</span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Filled variant (full color bg) ────────────────
  if (variant === "filled") {
    return (
      <div
        className="kpi-card-filled"
        style={{ background: `linear-gradient(135deg, ${bg}, ${adjustBrightness(bg, -20)})` }}
      >
        <div className="kpi-card-filled__icon-ring">
          <Icon name={icon} size={22} color="#fff" />
        </div>
        <p className="kpi-card-filled__value">
          {numericValue != null ? animated : value}
        </p>
        <p className="kpi-card-filled__title">{title}</p>
        {trend && (
          <div className="kpi-card-filled__trend">
            <Icon
              name={trend.isPositive ? "trending-up" : "trending-down"}
              size={12}
              color="#fff"
            />
            <span>{trend.value}%</span>
          </div>
        )}
      </div>
    );
  }

  // Default variant (original style)
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>
            {numericValue != null ? animated : value}
          </p>
          {trend && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
              <Icon
                name={trend.isPositive ? "trending-up" : "trending-down"}
                size={14}
                color={trend.isPositive ? "#16a34a" : "#dc2626"}
              />
              <span style={{ fontSize: 12, color: trend.isPositive ? "#16a34a" : "#dc2626" }}>
                {trend.value}%
              </span>
            </div>
          )}
        </div>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            backgroundColor: `${bg}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={24} color={bg} />
        </div>
      </div>
    </div>
  );
}

// ── Utility ───────────────────────────────────────────

function adjustBrightness(hex: string, amount: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
