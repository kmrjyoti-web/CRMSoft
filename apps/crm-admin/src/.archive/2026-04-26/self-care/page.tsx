"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Building2, Briefcase, LogOut, Store } from "lucide-react";

import { authService } from "@/features/auth/services/auth.service";
import { setAuthCookie } from "@/features/auth/utils/auth-cookies";
import { useAuthStore } from "@/stores/auth.store";
import type { CompanyListItem } from "@/features/auth/types/auth.types";
import { ProfileSummaryCard } from "@/components/self-care/ProfileSummaryCard";
import { CompanyCard } from "@/components/self-care/CompanyCard";

type Tab = "my" | "subscribed" | "marketplace";

interface CompanyGroups {
  myCompanies: CompanyListItem[];
  subscribedCompanies: CompanyListItem[];
}

export default function SelfCarePage() {
  const router = useRouter();
  const { setAuth, setActiveCompany, setAvailableCompanies, clearAuth } =
    useAuthStore();

  const [groups, setGroups] = useState<CompanyGroups>({
    myCompanies: [],
    subscribedCompanies: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("my");
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const all = await authService.getMyCompanies();

      const myCompanies = all.filter(
        (c) => c.role === "OWNER" || c.role === "ADMIN",
      );
      const subscribedCompanies = all.filter(
        (c) => c.role !== "OWNER" && c.role !== "ADMIN",
      );

      setGroups({ myCompanies, subscribedCompanies });
      setAvailableCompanies(all);

      if (myCompanies.length === 0 && subscribedCompanies.length > 0) {
        setActiveTab("subscribed");
      }
    } catch {
      toast.error("Failed to load workspaces");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (company: CompanyListItem) => {
    setSelectingId(company.id);
    try {
      const result = await authService.selectCompany(company.id);

      setAuthCookie(result.accessToken);
      setAuth({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      setActiveCompany({
        id: company.id,
        name: company.name,
        brandCode: company.brandCode,
        verticalCode: company.verticalCode,
        role: company.role,
        isDefault: company.isDefault,
      });

      router.push(`/company/${company.id}/dashboard`);
    } catch {
      toast.error("Failed to enter workspace");
    } finally {
      setSelectingId(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    document.cookie = "crm-token=;path=/;max-age=0";
    router.push("/login");
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0d1a 0%, #131826 50%, #0d1118 100%)",
          color: "#94a3b8",
          fontFamily: "var(--font-sans)",
        }}
      >
        Loading your workspaces…
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    {
      id: "my",
      label: "My Companies",
      icon: <Building2 style={{ width: 16, height: 16 }} />,
      count: groups.myCompanies.length,
    },
    {
      id: "subscribed",
      label: "Subscribed",
      icon: <Briefcase style={{ width: 16, height: 16 }} />,
      count: groups.subscribedCompanies.length,
    },
    {
      id: "marketplace",
      label: "Marketplace",
      icon: <Store style={{ width: 16, height: 16 }} />,
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0a0d1a 0%, #131826 50%, #0d1118 100%)",
        color: "#f1f5f9",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid rgba(201, 162, 95, 0.1)",
          background: "rgba(20, 24, 35, 0.6)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          position: "sticky",
          top: 0,
          zIndex: 30,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "20px 32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 24,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(135deg, #f1f5f9 0%, #c9a25f 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                margin: 0,
              }}
            >
              CRMSoft
            </h1>
            <p
              style={{
                fontSize: 11,
                color: "#64748b",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                margin: "4px 0 0",
              }}
            >
              Your workspaces
            </p>
          </div>

          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              fontSize: 13,
              fontWeight: 500,
              color: "#94a3b8",
              background: "transparent",
              border: "1px solid rgba(201, 162, 95, 0.15)",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              transition: "all 200ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#f1f5f9";
              e.currentTarget.style.borderColor = "rgba(201, 162, 95, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#94a3b8";
              e.currentTarget.style.borderColor = "rgba(201, 162, 95, 0.15)";
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
            Logout
          </button>
        </div>
      </header>

      <main
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "40px 32px",
        }}
      >
        {/* Profile summary */}
        <ProfileSummaryCard />

        {/* Tabs */}
        <div
          style={{
            marginTop: 32,
            borderBottom: "1px solid rgba(201, 162, 95, 0.1)",
          }}
        >
          <nav style={{ display: "flex" }}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "14px 4px",
                    marginRight: 32,
                    fontSize: 14,
                    fontWeight: isActive ? 500 : 400,
                    color: isActive ? "#c9a25f" : "#94a3b8",
                    background: "transparent",
                    border: "none",
                    borderBottom: isActive
                      ? "2px solid #c9a25f"
                      : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    fontFamily: "var(--font-sans)",
                    marginBottom: -1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#f1f5f9";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.color = "#94a3b8";
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 7px",
                        borderRadius: 999,
                        background: isActive
                          ? "rgba(201, 162, 95, 0.15)"
                          : "rgba(255, 255, 255, 0.05)",
                        color: isActive ? "#c9a25f" : "#64748b",
                        fontWeight: 500,
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab content */}
        <div style={{ marginTop: 28 }}>
          {activeTab === "my" && (
            <CompanyGrid
              companies={groups.myCompanies}
              variant="owner"
              onStart={handleStart}
              selectingId={selectingId}
              emptyMsg="You don't own any companies yet."
            />
          )}
          {activeTab === "subscribed" && (
            <CompanyGrid
              companies={groups.subscribedCompanies}
              variant="employee"
              onStart={handleStart}
              selectingId={selectingId}
              emptyMsg="You haven't joined any companies yet."
            />
          )}
          {activeTab === "marketplace" && (
            <div
              style={{
                textAlign: "center",
                padding: "80px 0",
                color: "#64748b",
              }}
            >
              <Store
                style={{
                  width: 40,
                  height: 40,
                  margin: "0 auto 16px",
                  opacity: 0.4,
                  display: "block",
                }}
              />
              <p
                style={{
                  fontSize: 17,
                  fontWeight: 500,
                  color: "#94a3b8",
                  margin: "0 0 6px",
                }}
              >
                Marketplace coming soon
              </p>
              <p style={{ fontSize: 13, margin: 0 }}>
                Browse and follow companies (Day 3)
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────

function CompanyGrid({
  companies,
  variant,
  onStart,
  selectingId,
  emptyMsg,
}: {
  companies: CompanyListItem[];
  variant: "owner" | "employee";
  onStart: (c: CompanyListItem) => void;
  selectingId: string | null;
  emptyMsg: string;
}) {
  if (companies.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "64px 0",
          color: "#64748b",
          fontSize: 14,
        }}
      >
        <p style={{ margin: 0 }}>{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 16,
      }}
    >
      {companies.map((c) => (
        <CompanyCard
          key={c.id}
          company={c}
          variant={variant}
          onStart={() => onStart(c)}
          loading={selectingId === c.id}
        />
      ))}
    </div>
  );
}
