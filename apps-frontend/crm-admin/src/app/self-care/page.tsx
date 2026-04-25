"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Building2, Briefcase, Store, LogOut } from "lucide-react";

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

      // Owner/admin → "My Companies"; everyone else → "Subscribed"
      const myCompanies = all.filter(
        (c) => c.role === "OWNER" || c.role === "ADMIN",
      );
      const subscribedCompanies = all.filter(
        (c) => c.role !== "OWNER" && c.role !== "ADMIN",
      );

      setGroups({ myCompanies, subscribedCompanies });
      setAvailableCompanies(all);

      // Default tab: subscribed if no owner companies
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

      // Swap JWT to full-company token
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Loading your workspaces…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">CRMSoft</h1>
            <p className="text-xs text-slate-500 uppercase tracking-wider">
              Your workspaces
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-400 hover:text-white border border-slate-700 hover:border-slate-500 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Profile summary */}
        <ProfileSummaryCard />

        {/* Tabs */}
        <div className="mt-8 border-b border-slate-800">
          <nav className="flex gap-1">
            <TabBtn
              active={activeTab === "my"}
              onClick={() => setActiveTab("my")}
              icon={<Building2 className="h-4 w-4" />}
              label="My Companies"
              count={groups.myCompanies.length}
            />
            <TabBtn
              active={activeTab === "subscribed"}
              onClick={() => setActiveTab("subscribed")}
              icon={<Briefcase className="h-4 w-4" />}
              label="Subscribed"
              count={groups.subscribedCompanies.length}
            />
            <TabBtn
              active={activeTab === "marketplace"}
              onClick={() => setActiveTab("marketplace")}
              icon={<Store className="h-4 w-4" />}
              label="Marketplace"
            />
          </nav>
        </div>

        {/* Tab content */}
        <div className="mt-8">
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
            <div className="text-center py-20 text-slate-500">
              <Store className="h-10 w-10 mx-auto mb-4 opacity-40" />
              <p className="text-lg font-medium text-slate-400 mb-1">
                Marketplace coming soon
              </p>
              <p className="text-sm">Browse and follow companies (Day 3)</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm border-b-2 transition-colors ${
        active
          ? "border-blue-500 text-white"
          : "border-transparent text-slate-400 hover:text-white"
      }`}
    >
      {icon}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded ${
            active
              ? "bg-blue-500/20 text-blue-300"
              : "bg-slate-800 text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

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
      <div className="text-center py-16 text-slate-500">
        <p>{emptyMsg}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
