"use client";

import { ReactNode } from "react";
import { Icon, IconName } from "@/components/ui";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  /** Badge shown top-right (e.g. "This Week", "Today") */
  badge?: string;
  badgeIcon?: IconName;
  /** Extra element in header right slot */
  headerRight?: ReactNode;
  className?: string;
  bodyClass?: string;
}

export function DashboardCard({
  title,
  children,
  badge,
  badgeIcon,
  headerRight,
  className = "",
  bodyClass = "",
}: DashboardCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2">
          {headerRight}
          {badge && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2 py-0.5">
              {badgeIcon && <Icon name={badgeIcon} size={11} />}
              {badge}
            </span>
          )}
        </div>
      </div>
      {/* Body */}
      <div className={`flex-1 p-5 ${bodyClass}`}>{children}</div>
    </div>
  );
}
