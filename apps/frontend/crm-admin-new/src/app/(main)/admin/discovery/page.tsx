"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Icon } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import api from "@/services/api-client";
import { useQuery } from "@tanstack/react-query";

// ── Types ─────────────────────────────────────────────────────────

interface UnmappedRoute {
  route: string;
  name: string;
  category: string;
}

interface DiscoveryData {
  totalRoutes: number;
  mappedRoutes: number;
  unmappedRoutes: UnmappedRoute[];
  categories: Record<string, UnmappedRoute[]>;
}

// ── Service ───────────────────────────────────────────────────────

async function fetchDiscovery(): Promise<DiscoveryData> {
  const res = await api.get<any>("/api/v1/menus/discovery");
  return res.data?.data ?? res.data;
}

async function refreshUnmappedMenu() {
  const res = await api.post<any>("/api/v1/menus/discovery/refresh");
  return res.data?.data ?? res.data;
}

// ── Category icon map ─────────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  Accounts: "coins",
  Admin: "shield",
  Communication: "message-circle",
  CRM: "users",
  Finance: "receipt",
  Inventory: "warehouse",
  Master: "database",
  Other: "folder",
  Purchase: "shopping-cart",
  Reports: "bar-chart-3",
  Sale: "indian-rupee",
  Settings: "settings",
  Support: "headphones",
  Tools: "wrench",
};

// ── Component ─────────────────────────────────────────────────────

export default function AdminDiscoveryPage() {
  const router = useRouter();
  const isSuperAdmin = useAuthStore((s) => s.isSuperAdmin);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState<string | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-discovery"],
    queryFn: fetchDiscovery,
    enabled: isSuperAdmin,
  });

  const toggleCat = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setRefreshMsg(null);
    try {
      const result = await refreshUnmappedMenu();
      setRefreshMsg(`✅ Unmapped group updated — ${result?.unmapped ?? "?"} routes`);
      refetch();
    } catch {
      setRefreshMsg("❌ Failed to refresh — see console");
    } finally {
      setRefreshing(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div style={{ padding: 40, textAlign: "center", color: "#78909c" }}>
        <Icon name="lock" size={32} />
        <p style={{ marginTop: 12 }}>Admin access required.</p>
      </div>
    );
  }

  const categories = data?.categories ?? {};
  const unmappedCount = data?.unmappedRoutes?.length ?? 0;
  const totalRoutes = data?.totalRoutes ?? 0;
  const mappedRoutes = data?.mappedRoutes ?? 0;

  return (
    <div style={{ padding: "24px 32px", maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Icon name="search" size={22} />
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Menu Discovery</h1>
          <p style={{ color: "#78909c", fontSize: 13, margin: "4px 0 0" }}>
            Routes that exist in the codebase but are not linked in any sidebar menu.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 16px",
            background: "var(--color-primary, #0ea5e9)",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: refreshing ? "wait" : "pointer",
            fontSize: 13,
            fontWeight: 500,
            opacity: refreshing ? 0.7 : 1,
          }}
        >
          <Icon name="refresh-cw" size={14} />
          {refreshing ? "Refreshing…" : "Refresh Unmapped Group"}
        </button>
      </div>

      {refreshMsg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            background: refreshMsg.startsWith("✅") ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            color: refreshMsg.startsWith("✅") ? "#059669" : "#dc2626",
            marginBottom: 20,
            fontSize: 13,
          }}
        >
          {refreshMsg}
        </div>
      )}

      {/* Summary cards */}
      <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
        {[
          { label: "Total Route Pages", value: totalRoutes, icon: "file-text", color: "#3b82f6" },
          { label: "Mapped to Menus", value: mappedRoutes, icon: "check-circle", color: "#10b981" },
          { label: "Unmapped Routes", value: unmappedCount, icon: "alert-circle", color: "#f59e0b" },
          { label: "Categories", value: Object.keys(categories).length, icon: "folder", color: "#8b5cf6" },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              flex: 1,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 10,
              padding: "16px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: card.color }}>
                <Icon name={card.icon as any} size={16} />
              </span>
              <span style={{ fontSize: 12, color: "#6b7280", fontWeight: 500 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>
              {isLoading ? "—" : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Unmapped routes by category */}
      {isLoading ? (
        <div style={{ color: "#78909c", padding: 20 }}>Loading…</div>
      ) : unmappedCount === 0 ? (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            background: "rgba(16,185,129,0.08)",
            borderRadius: 10,
            color: "#059669",
          }}
        >
          <Icon name="check-circle" size={28} />
          <p style={{ marginTop: 8, fontWeight: 500 }}>All routes are mapped to menus!</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 4px", color: "#374151" }}>
            Unmapped Routes ({unmappedCount})
          </h2>
          {Object.entries(categories)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([cat, routes]) => {
              const isOpen = expandedCats.has(cat);
              const catIcon = CATEGORY_ICONS[cat] || "folder";
              return (
                <div
                  key={cat}
                  style={{
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  {/* Category header */}
                  <div
                    onClick={() => toggleCat(cat)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 16px",
                      cursor: "pointer",
                      background: isOpen ? "#f9fafb" : "white",
                      borderBottom: isOpen ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <Icon name={catIcon as any} size={16} color="#6b7280" />
                    <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{cat}</span>
                    <span
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        fontSize: 11,
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {(routes as UnmappedRoute[]).length}
                    </span>
                    <Icon name={isOpen ? "chevron-up" : "chevron-down"} size={14} color="#9ca3af" />
                  </div>

                  {/* Routes list */}
                  {isOpen && (
                    <div style={{ padding: "4px 0" }}>
                      {(routes as UnmappedRoute[]).map((r) => (
                        <div
                          key={r.route}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 16px 8px 36px",
                            fontSize: 13,
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                          }
                          onClick={() => router.push(r.route)}
                        >
                          <Icon name="file" size={13} color="#9ca3af" />
                          <span style={{ fontWeight: 500, color: "#374151", flex: 1 }}>
                            {r.name}
                          </span>
                          <code
                            style={{
                              fontSize: 11,
                              color: "#6b7280",
                              background: "#f3f4f6",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            {r.route}
                          </code>
                          <Icon name="external-link" size={12} color="#9ca3af" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
