"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ChevronDown, Home, LogOut, Loader2, Check } from "lucide-react";

import { useActiveCompany } from "@/hooks/useActiveCompany";
import { useAuthStore } from "@/stores/auth.store";
import { authService } from "@/features/auth/services/auth.service";
import { setAuthCookie } from "@/features/auth/utils/auth-cookies";
import type { CompanyListItem } from "@/features/auth/types/auth.types";

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
      // Full reload — applies new brand theme
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
              className="absolute right-0 top-full mt-2 w-72 rounded-xl border shadow-2xl overflow-hidden"
              style={{
                background: "rgba(15, 20, 32, 0.97)",
                borderColor: `${primary}33`,
              }}
            >
              <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-500">
                Your workspaces
              </div>

              <div className="max-h-72 overflow-y-auto">
                {companies.map((c) => {
                  const isActive = c.id === company?.id;
                  const isLoading = switchingId === c.id;
                  return (
                    <button
                      key={c.id}
                      onClick={() => handleSwitch(c)}
                      disabled={!!isLoading}
                      className={`w-full px-3 py-2.5 flex items-center justify-between text-left transition-colors hover:bg-white/5 ${
                        isActive ? "bg-white/5" : ""
                      }`}
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {c.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {c.brandCode ?? "default"} · {c.role}
                        </div>
                      </div>
                      {isLoading && (
                        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                      )}
                      {isActive && !isLoading && (
                        <Check
                          className="h-4 w-4"
                          style={{ color: primary }}
                        />
                      )}
                    </button>
                  );
                })}
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
