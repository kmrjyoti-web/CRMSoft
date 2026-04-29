"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, Home, LogOut, Loader2, Check, ExternalLink } from "lucide-react";

import { useActiveCompany } from "@/hooks/useActiveCompany";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/features/auth/services/auth.service";
import { setAuthCookie } from "@/features/auth/utils/auth-cookies";
import type { CompanyListItem } from "@/features/auth/types/auth.types";

// Group companies by brandCode
function groupByBrand(companies: CompanyListItem[]): { brandCode: string | null; brandName: string | null; logoUrl: string | null; items: CompanyListItem[] }[] {
  const map = new Map<string, { brandCode: string | null; brandName: string | null; logoUrl: string | null; items: CompanyListItem[] }>();
  for (const c of companies) {
    const key = c.brandCode ?? '__none__';
    if (!map.has(key)) {
      map.set(key, { brandCode: c.brandCode, brandName: c.brandName, logoUrl: c.logoUrl, items: [] });
    }
    map.get(key)!.items.push(c);
  }
  return Array.from(map.values());
}

export function CompanyHeader() {
  const router = useRouter();
  const { brandConfig, theme, company } = useActiveCompany();
  const { setAuth, setActiveCompany, setAvailableCompanies, clearAuth } =
    useAuthStore();

  const [open, setOpen] = useState(false);
  const [companies, setCompanies] = useState<CompanyListItem[]>([]);
  const [switchingId, setSwitchingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const openDropdown = async () => {
    if (!open && companies.length === 0) {
      try {
        const all = await authService.getMyCompanies();
        setCompanies(all);
      } catch {
        toast.error("Could not load company list");
      }
    }
    setOpen((v) => !v);
  };

  const handleSwitch = async (target: CompanyListItem) => {
    if (target.id === company?.id) {
      setOpen(false);
      return;
    }
    setSwitchingId(target.id);
    try {
      const result = await authService.switchCompany(target.id);

      if (result.crossBrand) {
        // Hard redirect to the other brand's portal with SSO token
        window.location.href = result.redirectUrl;
        return;
      }

      // Same-brand switch: update JWT + reload
      setAuthCookie(result.accessToken);
      setAuth({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      setActiveCompany({
        id: target.id,
        name: target.name,
        brandCode: target.brandCode,
        verticalCode: target.verticalCode,
        role: target.role,
        isDefault: target.isDefault,
      });
      setAvailableCompanies(companies);
      window.location.href = `/company/${target.id}/dashboard`;
    } catch {
      toast.error("Switch failed");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleLogout = () => {
    clearAuth();
    document.cookie = "crm-token=;path=/;max-age=0";
    router.push("/login");
  };

  const primary = theme.primary;
  const brandName = brandConfig?.name ?? "CRMSoft";
  const groups = groupByBrand(companies);

  return (
    <header
      className="border-b sticky top-0 z-30 backdrop-blur"
      style={{
        background: `${theme.background?.split(" ")[0] ?? "rgba(10,13,26,0.85)"}cc`,
        borderColor: `${primary}33`,
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Brand name + back */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-1.5 rounded hover:bg-white/5 transition-colors"
            title="Dashboard"
          >
            <Home className="h-4 w-4" style={{ color: theme.text, opacity: 0.5 }} />
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span
            className="text-lg font-semibold"
            style={{ color: primary, fontFamily: theme.fontHeading }}
          >
            {brandName}
          </span>
        </div>

        {/* Company switcher */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={openDropdown}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border transition-colors hover:bg-white/5"
            style={{ borderColor: `${primary}33`, color: theme.text }}
          >
            <span className="text-sm font-medium">{company?.name ?? "Select workspace"}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>

          {open && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl border shadow-2xl overflow-hidden"
              style={{
                background: "rgba(15, 20, 32, 0.97)",
                borderColor: `${primary}33`,
              }}
            >
              <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-500">
                Your workspaces
              </div>

              <div className="max-h-80 overflow-y-auto">
                {groups.length === 0 && (
                  <div className="px-3 py-4 text-center text-xs text-slate-500">Loading…</div>
                )}

                {groups.map((group, gi) => (
                  <div key={group.brandCode ?? `group-${gi}`}>
                    {/* Brand group header */}
                    <div
                      className="px-3 py-1.5 flex items-center gap-2"
                      style={{ borderTop: gi > 0 ? "1px solid rgba(255,255,255,0.06)" : undefined }}
                    >
                      {group.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={group.logoUrl} alt="" className="h-4 w-4 rounded object-contain" />
                      ) : (
                        <div
                          className="h-4 w-4 rounded text-center text-xs font-bold leading-4"
                          style={{ background: `${primary}22`, color: primary }}
                        >
                          {(group.brandName ?? group.brandCode ?? "?")[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-semibold text-slate-400 tracking-wide">
                        {group.brandName ?? group.brandCode ?? "Default"}
                      </span>
                      {group.items[0]?.isCrossBrand && (
                        <ExternalLink className="h-3 w-3 text-amber-400 ml-auto" />
                      )}
                    </div>

                    {/* Companies in this brand */}
                    {group.items.map((c) => {
                      const isActive = c.id === company?.id;
                      const isLoading = switchingId === c.id;
                      const isCross = c.isCrossBrand;
                      return (
                        <button
                          key={c.id}
                          onClick={() => handleSwitch(c)}
                          disabled={!!isLoading}
                          className={`w-full px-3 py-2.5 pl-8 flex items-center justify-between text-left transition-colors hover:bg-white/5 ${
                            isActive ? "bg-white/5" : ""
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {c.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {c.role}
                              {isCross && c.domain && (
                                <span className="ml-1 text-amber-500/70">↗ {c.domain}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isCross && !isLoading && (
                              <ExternalLink className="h-3.5 w-3.5 text-amber-400/70" />
                            )}
                            {isLoading && (
                              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                            )}
                            {isActive && !isLoading && (
                              <Check className="h-4 w-4" style={{ color: primary }} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5">
                <button
                  onClick={() => {
                    setOpen(false);
                    router.push("/dashboard");
                  }}
                  className="w-full px-3 py-2.5 flex items-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2.5 flex items-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
