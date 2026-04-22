"use client";

export interface BarListItem {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarListProps {
  items: BarListItem[];
  barColor?: string;
  showValues?: boolean;
  maxValue?: number;
}

const DEFAULT_COLOR = "#f97316";

export function HorizontalBarList({
  items,
  barColor = DEFAULT_COLOR,
  showValues = true,
  maxValue,
}: HorizontalBarListProps) {
  const max = maxValue ?? Math.max(...items.map((i) => i.value), 1);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="w-24 text-right text-xs text-gray-500 flex-shrink-0 truncate">
            {item.label}
          </span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${Math.round((item.value / max) * 100)}%`,
                backgroundColor: item.color ?? barColor,
              }}
            />
          </div>
          {showValues && (
            <span className="w-8 text-right text-xs font-semibold text-gray-700 flex-shrink-0">
              {item.value}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
