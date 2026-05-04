"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
}

interface SemiDonutChartProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: number | string;
  /** If true, draws a 180° semi-circle (top half). Default: false (full donut). */
  semi?: boolean;
  height?: number;
}

export function SemiDonutChart({
  segments,
  centerLabel = "Total",
  centerValue,
  semi = true,
  height = 220,
}: SemiDonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const display = centerValue ?? total;

  // For semi-donut: startAngle=180, endAngle=0
  const startAngle = semi ? 180 : 0;
  const endAngle = semi ? 0 : 360;

  return (
    <div className="flex flex-col items-center gap-4">
      <div style={{ width: "100%", height }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy={semi ? "75%" : "50%"}
              outerRadius={semi ? "80%" : "70%"}
              innerRadius={semi ? "52%" : "46%"}
              startAngle={startAngle}
              endAngle={endAngle}
              paddingAngle={2}
              stroke="none"
            >
              {segments.map((seg, i) => (
                <Cell key={i} fill={seg.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={((value: number) => value.toLocaleString()) as any}
              contentStyle={{ fontSize: 12, borderRadius: 8 }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div
          className="absolute flex flex-col items-center justify-center pointer-events-none"
          style={
            semi
              ? { bottom: "18%", left: "50%", transform: "translateX(-50%)" }
              : { inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }
          }
        >
          <span className="text-xs text-gray-500 font-medium">{centerLabel}</span>
          <span className="text-2xl font-bold text-gray-900 leading-tight">
            {typeof display === "number" ? display.toLocaleString() : display}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="w-full space-y-2">
        {segments.map((seg) => {
          const pct = total > 0 ? Math.round((seg.value / total) * 100) : 0;
          return (
            <div key={seg.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color }}
                />
                <span className="text-xs text-gray-600">{seg.name}</span>
              </div>
              <span className="text-xs font-semibold text-gray-700">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
