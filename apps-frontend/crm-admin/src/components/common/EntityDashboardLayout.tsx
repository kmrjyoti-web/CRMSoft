"use client";

import { useState, type ReactNode } from "react";

import { Icon } from "@/components/ui";

// ── Types ──────────────────────────────────────────────

export interface DashboardTab {
  id: string;
  label: string;
  icon?: string;
}

interface EntityDashboardLayoutProps {
  /** Left sidebar content (avatar + key info) */
  profileCard: ReactNode;
  /** Tab definitions */
  tabs: DashboardTab[];
  /** Currently active tab ID */
  activeTab: string;
  /** Tab change handler */
  onTabChange: (tabId: string) => void;
  /** Content for the active tab */
  children: ReactNode;
  /** Loading state */
  isLoading?: boolean;
  /** Optional content shown above the main layout (e.g. pipeline stepper) */
  topContent?: ReactNode;
}

// ── Component ──────────────────────────────────────────

export function EntityDashboardLayout({
  profileCard,
  tabs,
  activeTab,
  onTabChange,
  children,
  isLoading,
  topContent,
}: EntityDashboardLayoutProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="sp-dashboard__wrapper">
      {/* Top Content (e.g. pipeline stepper) */}
      {topContent && (
        <div className="sp-dashboard__top">
          {topContent}
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="sp-dashboard">
        {/* Left: Profile Card */}
        <div className="sp-dashboard__profile">
          {profileCard}
        </div>

        {/* Right: Tabs + Content */}
        <div className="sp-dashboard__content">
          {/* Tab Bar */}
          <div className="sp-dashboard__tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`sp-dashboard__tab${activeTab === tab.id ? " sp-dashboard__tab--active" : ""}`}
                onClick={() => onTabChange(tab.id)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                {tab.icon && <Icon name={tab.icon} size={14} />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="sp-dashboard__body">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
