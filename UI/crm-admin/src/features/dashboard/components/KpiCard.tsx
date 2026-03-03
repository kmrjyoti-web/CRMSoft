"use client";

import { Icon, IconName } from "@/components/ui";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: IconName;
  trend?: { value: number; isPositive: boolean };
  color?: string;
}

export function KpiCard({ title, value, icon, trend, color }: KpiCardProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>{title}</p>
          <p style={{ fontSize: 24, fontWeight: 700, color: "#1e293b" }}>{value}</p>
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
            backgroundColor: `${color ?? "#3b82f6"}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={24} color={color ?? "#3b82f6"} />
        </div>
      </div>
    </div>
  );
}
