"use client";

import { ArrowRight, Calendar, Loader2 } from "lucide-react";
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
  const accentPrimary = brandConfig?.colors.secondary ?? "#c9a25f";
  const accentDeep = "#8b6334";

  const initials = company.name.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(135deg, rgba(20, 24, 35, 0.6) 0%, rgba(28, 22, 18, 0.4) 100%)",
        border: company.isDefault
          ? `1px solid ${accentPrimary}66`
          : "1px solid rgba(201, 162, 95, 0.12)",
        borderRadius: 14,
        padding: 24,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        transition: "all 300ms ease",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accentPrimary}99`;
        e.currentTarget.style.boxShadow = `0 8px 32px ${accentPrimary}33`;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = company.isDefault
          ? `${accentPrimary}66`
          : "rgba(201, 162, 95, 0.12)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Brand color top accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${accentPrimary} 0%, ${accentDeep} 100%)`,
        }}
      />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 16,
          gap: 12,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: 1,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentDeep} 100%)`,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-serif)",
              letterSpacing: "0.05em",
              boxShadow: `0 4px 12px ${accentPrimary}40`,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <h3
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 17,
                fontWeight: 500,
                color: "#f1f5f9",
                margin: 0,
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {company.name}
            </h3>
            <p
              style={{
                fontSize: 12,
                color: "#94a3b8",
                margin: "3px 0 0",
                display: "flex",
                alignItems: "center",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {brandConfig && (
                <>
                  <span style={{ color: accentPrimary, fontWeight: 500 }}>
                    {brandConfig.name}
                  </span>
                  {company.role && (
                    <span style={{ color: "#475569" }}>·</span>
                  )}
                </>
              )}
              {company.role && <span>{company.role}</span>}
            </p>
          </div>
        </div>

        {company.isDefault && (
          <span
            style={{
              fontSize: 10,
              padding: "3px 9px",
              borderRadius: 999,
              background: `${accentPrimary}26`,
              color: accentPrimary,
              fontWeight: 500,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            Default
          </span>
        )}
      </div>

      {/* Vertical badge */}
      {company.verticalCode && (
        <div style={{ marginBottom: 14 }}>
          <span
            style={{
              fontSize: 11,
              padding: "3px 10px",
              borderRadius: 6,
              background: `${accentPrimary}18`,
              color: accentPrimary,
              fontWeight: 500,
              letterSpacing: "0.06em",
            }}
          >
            {company.verticalCode}
          </span>
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingTop: 14,
          borderTop: "1px solid rgba(255, 255, 255, 0.05)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "#64748b",
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {company.lastAccessedAt ? (
            <>
              <Calendar style={{ width: 11, height: 11 }} />
              <span>
                {formatDistanceToNow(new Date(company.lastAccessedAt), {
                  addSuffix: true,
                })}
              </span>
            </>
          ) : (
            <span style={{ textTransform: "capitalize" }}>
              {company.status.toLowerCase()}
            </span>
          )}
        </div>

        <button
          onClick={onStart}
          disabled={loading}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 500,
            color: "#fff",
            background: `linear-gradient(135deg, ${accentPrimary} 0%, ${accentDeep} 100%)`,
            border: "none",
            borderRadius: 8,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            transition: "all 200ms ease",
            boxShadow: `0 2px 8px ${accentPrimary}40`,
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow = `0 4px 16px ${accentPrimary}66`;
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = `0 2px 8px ${accentPrimary}40`;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {loading ? (
            <Loader2
              style={{ width: 13, height: 13, animation: "spin 1s linear infinite" }}
            />
          ) : (
            <>
              Start
              <ArrowRight style={{ width: 13, height: 13 }} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
