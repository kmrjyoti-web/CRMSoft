"use client";

import { useState } from "react";
import Link from "next/link";

import { Icon } from "@/components/ui";
import type { IconName } from "@/components/ui";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

export interface MasterTabItem {
  label: string;
  description: string;
  icon: IconName;
  path: string;
  badge?: string;
}

export interface MasterTab {
  key: string;
  label: string;
  icon: IconName;
  items: MasterTabItem[];
}

interface MasterTabLayoutProps {
  title: string;
  icon: IconName;
  tabs: MasterTab[];
}

// ─────────────────────────────────────────────────────────────
// Card
// ─────────────────────────────────────────────────────────────

function ItemCard({ item }: { item: MasterTabItem }) {
  return (
    <Link
      href={item.path}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        padding: "16px",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        background: "#fff",
        textDecoration: "none",
        transition: "border-color 0.15s, box-shadow 0.15s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--color-primary, #3b82f6)";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 2px 8px rgba(59,130,246,0.1)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.borderColor = "#e2e8f0";
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 8,
            background: "rgba(59,130,246,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={item.icon} size={18} />
        </div>
        {item.badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              background: "#f1f5f9",
              color: "#64748b",
              padding: "2px 8px",
              borderRadius: 20,
            }}
          >
            {item.badge}
          </span>
        )}
      </div>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b", marginBottom: 3 }}>
          {item.label}
        </div>
        <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.4 }}>
          {item.description}
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────────────────────
// MasterTabLayout
// ─────────────────────────────────────────────────────────────

export function MasterTabLayout({ title, icon, tabs }: MasterTabLayoutProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.key ?? "dashboard");

  const activeItems = tabs.find((t) => t.key === activeTab)?.items ?? [];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: "rgba(59,130,246,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon name={icon} size={22} />
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 13, color: "#64748b", margin: 0, marginTop: 2 }}>
            {tabs.length} sections — {tabs.reduce((n, t) => n + t.items.length, 0)} features
          </p>
        </div>
      </div>

      {/* Tab Bar */}
      <div
        style={{
          display: "flex",
          borderBottom: "2px solid #e2e8f0",
          marginBottom: 24,
          gap: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "10px 20px",
              fontSize: 13,
              fontWeight: activeTab === tab.key ? 600 : 500,
              color: activeTab === tab.key ? "var(--color-primary, #3b82f6)" : "#64748b",
              borderBottom: activeTab === tab.key
                ? "2px solid var(--color-primary, #3b82f6)"
                : "2px solid transparent",
              marginBottom: -2,
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            <Icon name={tab.icon} size={15} />
            {tab.label}
            <span
              style={{
                fontSize: 11,
                background: activeTab === tab.key ? "rgba(59,130,246,0.1)" : "#f1f5f9",
                color: activeTab === tab.key ? "var(--color-primary, #3b82f6)" : "#94a3b8",
                padding: "1px 6px",
                borderRadius: 10,
                fontWeight: 500,
              }}
            >
              {tab.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {activeItems.map((item) => (
          <ItemCard key={item.path} item={item} />
        ))}
      </div>
    </div>
  );
}
