"use client";

import { Icon } from "@/components/ui";

export interface ActivityItem {
  id: string;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  /** Initials fallback if no avatar */
  initials?: string;
  avatarBg?: string;
  badge?: string;
  badgeColor?: "green" | "blue" | "orange" | "red" | "gray";
  meta1?: string;
  meta2?: string;
  meta3?: string;
  meta1Label?: string;
  meta2Label?: string;
  meta3Label?: string;
  isLate?: boolean;
  lateMinutes?: number;
}

const BADGE_STYLES: Record<string, string> = {
  green: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  blue: "bg-blue-100 text-blue-700 border border-blue-200",
  orange: "bg-orange-100 text-orange-700 border border-orange-200",
  red: "bg-red-100 text-red-700 border border-red-200",
  gray: "bg-gray-100 text-gray-600 border border-gray-200",
};

function Avatar({ item }: { item: ActivityItem }) {
  if (item.avatarUrl) {
    return (
      <img
        src={item.avatarUrl}
        alt={item.name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  const initials = item.initials ?? item.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const bg = item.avatarBg ?? "#6366f1";
  return (
    <div
      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
      style={{ backgroundColor: bg }}
    >
      {initials}
    </div>
  );
}

interface ActivityFeedProps {
  items: ActivityItem[];
  emptyText?: string;
  onViewAll?: () => void;
  viewAllLabel?: string;
}

export function ActivityFeed({
  items,
  emptyText = "No recent activity",
  onViewAll,
  viewAllLabel = "View All",
}: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <div className="py-10 text-center text-sm text-gray-400">{emptyText}</div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="divide-y divide-gray-50">
        {items.map((item) => (
          <div key={item.id} className="py-3 flex items-start gap-3">
            <Avatar item={item} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-semibold text-gray-900 truncate">{item.name}</span>
                {item.isLate && item.lateMinutes != null && (
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-red-100 text-red-600 border border-red-200">
                    <Icon name="clock" size={11} />
                    {item.lateMinutes} Min
                  </span>
                )}
              </div>
              {item.subtitle && (
                <p className="text-xs text-gray-500 mt-0.5">{item.subtitle}</p>
              )}
              {(item.meta1 || item.meta2 || item.meta3) && (
                <div className="flex gap-4 mt-1.5 flex-wrap">
                  {item.meta1 && (
                    <div>
                      {item.meta1Label && <p className="text-[10px] text-gray-400">{item.meta1Label}</p>}
                      <p className="text-xs text-gray-600 font-medium">{item.meta1}</p>
                    </div>
                  )}
                  {item.meta2 && (
                    <div>
                      {item.meta2Label && <p className="text-[10px] text-gray-400">{item.meta2Label}</p>}
                      <p className="text-xs text-gray-600 font-medium">{item.meta2}</p>
                    </div>
                  )}
                  {item.meta3 && (
                    <div>
                      {item.meta3Label && <p className="text-[10px] text-gray-400">{item.meta3Label}</p>}
                      <p className="text-xs text-gray-600 font-medium">{item.meta3}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
            {item.badge && (
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold flex-shrink-0 ${
                  BADGE_STYLES[item.badgeColor ?? "green"]
                }`}
              >
                <Icon name="clock" size={10} />
                {item.badge}
              </span>
            )}
          </div>
        ))}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="mt-3 w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {viewAllLabel}
        </button>
      )}
    </div>
  );
}
