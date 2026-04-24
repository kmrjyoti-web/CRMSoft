"use client";

export interface StackedSegment {
  label: string;
  value: number;
  color: string;
}

interface StackedProgressProps {
  total: number;
  segments: StackedSegment[];
  /** Show legend grid below the bar */
  showLegend?: boolean;
}

export function StackedProgress({ total, segments, showLegend = true }: StackedProgressProps) {
  const safeTotal = total || 1;

  return (
    <div className="space-y-4">
      {/* Total */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-gray-500">Total</span>
        <span className="text-2xl font-bold text-gray-900">{total.toLocaleString()}</span>
      </div>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {segments.map((seg) => (
          <div
            key={seg.label}
            className="h-full transition-all duration-700"
            style={{
              width: `${Math.round((seg.value / safeTotal) * 100)}%`,
              backgroundColor: seg.color,
            }}
            title={`${seg.label}: ${seg.value}`}
          />
        ))}
      </div>

      {/* Legend grid */}
      {showLegend && (
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {segments.map((seg) => {
            const pct = Math.round((seg.value / safeTotal) * 100);
            return (
              <div key={seg.label}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: seg.color }}
                  />
                  <span className="text-xs text-gray-500">
                    {seg.label} ({pct}%)
                  </span>
                </div>
                <p className="text-xl font-bold text-gray-900 pl-4">{seg.value.toLocaleString()}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
