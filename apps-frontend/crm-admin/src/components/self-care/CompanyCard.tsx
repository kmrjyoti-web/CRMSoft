"use client";

import { ArrowRight, Loader2, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CompanyListItem } from "@/features/auth/types/auth.types";
import { getBrandConfig } from "@/lib/brand/registry";

interface Props {
  company: CompanyListItem;
  variant: "owner" | "employee";
  onStart: () => void;
  loading?: boolean;
}

export function CompanyCard({ company, variant, onStart, loading }: Props) {
  const brandConfig = getBrandConfig(company.brandCode);
  const accentColor = brandConfig?.colors.primary ?? "#3b82f6";
  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <div
      className={`relative bg-slate-900/50 border rounded-xl p-5 transition-colors hover:border-slate-600 ${
        company.isDefault ? "border-blue-500/40" : "border-slate-800"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm shrink-0"
            style={{ background: `${accentColor}22`, color: accentColor }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{company.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {brandConfig?.name ?? "CRMSoft"} · {company.role}
            </p>
          </div>
        </div>

        {company.isDefault && (
          <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-500/15 text-blue-300 rounded-full shrink-0">
            <Star className="h-2.5 w-2.5 fill-current" />
            Default
          </span>
        )}
      </div>

      {/* Vertical badge */}
      {company.verticalCode && (
        <div className="mb-3">
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{ background: `${accentColor}18`, color: accentColor }}
          >
            {company.verticalCode}
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {company.lastAccessedAt ? (
            <span>
              Last active{" "}
              {formatDistanceToNow(new Date(company.lastAccessedAt), {
                addSuffix: true,
              })}
            </span>
          ) : (
            <span className="capitalize">{company.status.toLowerCase()}</span>
          )}
        </div>

        <button
          onClick={onStart}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white rounded-md transition-opacity disabled:opacity-50"
          style={{ background: accentColor }}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              Start
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
