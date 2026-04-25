"use client";

import { useActiveCompany } from "@/hooks/useActiveCompany";

const VERTICAL_TERMINOLOGY: Record<string, Record<string, string>> = {
  TRAVEL: {
    lead: "Enquiry",
    customer: "Traveler",
    deal: "Booking",
    contact: "Traveler",
  },
  RETAIL: {
    lead: "Prospect",
    customer: "Customer",
    deal: "Order",
    contact: "Customer",
  },
  SOFTWARE: {
    lead: "Lead",
    customer: "Client",
    deal: "Deal",
    contact: "Contact",
  },
};

export default function CompanyDashboard() {
  const { theme, company, brandConfig, user } = useActiveCompany();

  const vertical = company?.verticalCode ?? "SOFTWARE";
  const terms = VERTICAL_TERMINOLOGY[vertical] ?? VERTICAL_TERMINOLOGY.SOFTWARE;
  const term = (key: string) => terms[key] ?? key;

  const companyName = company?.name ?? "Your Workspace";
  const brandName = brandConfig?.name ?? "CRMSoft";
  const tagline = theme.tagline ?? "Welcome to your workspace";

  const displayName = (user as any)?.firstName
    ? `${(user as any).firstName} ${(user as any).lastName ?? ""}`.trim()
    : user?.email ?? "";

  const navMenu = [
    { code: "leads", label: `${term("lead")}s`, path: "/leads" },
    { code: "customers", label: `${term("customer")}s`, path: "/contacts" },
    { code: "deals", label: `${term("deal")}s`, path: "/deals" },
    { code: "activities", label: "Activities", path: "/activities" },
    { code: "reports", label: "Reports", path: "/reports" },
    { code: "settings", label: "Settings", path: "/settings" },
  ];

  return (
    <div
      style={{
        padding: "40px 32px",
        maxWidth: 1200,
        margin: "0 auto",
        fontFamily: theme.fontBody,
      }}
    >
      {/* HERO — Editorial luxury feel */}
      <div
        style={{
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 20,
          padding: "48px 56px",
          marginBottom: 32,
          boxShadow: theme.cardShadow,
          position: "relative",
          overflow: "hidden",
          transition: "all 300ms ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = theme.cardShadowHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = theme.cardShadow;
        }}
      >
        {/* Gold radial corner accent */}
        <div
          style={{
            position: "absolute",
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.primarySoft} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 160,
            height: 160,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.primarySoft} 0%, transparent 70%)`,
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative" }}>
          {/* Brand · Vertical kicker */}
          <div
            style={{
              fontSize: 11,
              color: theme.textSubtle,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              marginBottom: 16,
              fontFamily: theme.fontBody,
            }}
          >
            {brandName} · {vertical}
          </div>

          {/* Main hero title */}
          <h1
            style={{
              fontFamily: theme.fontHeading,
              fontSize: 48,
              fontWeight: 500,
              color: theme.text,
              margin: 0,
              letterSpacing: "-0.03em",
              lineHeight: 1.1,
            }}
          >
            Welcome to{" "}
            <span
              style={{
                color: theme.primary,
                fontStyle: "italic",
              }}
            >
              {companyName}
            </span>
          </h1>

          {/* Tagline */}
          <p
            style={{
              fontFamily: theme.fontHeading,
              fontSize: 18,
              color: theme.textMuted,
              margin: "12px 0 0",
              fontStyle: "italic",
              fontWeight: 400,
            }}
          >
            {tagline}
          </p>

          {/* User greeting */}
          <p
            style={{
              fontFamily: theme.fontBody,
              fontSize: 14,
              color: theme.textMuted,
              margin: "24px 0 0",
            }}
          >
            Logged in as{" "}
            <span style={{ color: theme.primary, fontWeight: 500 }}>
              {displayName}
            </span>
          </p>
        </div>
      </div>

      {/* QUICK NAVIGATION */}
      <div style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: theme.fontHeading,
            fontSize: 24,
            fontWeight: 500,
            color: theme.text,
            margin: "0 0 20px",
            letterSpacing: "-0.02em",
          }}
        >
          Quick navigation
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 16,
          }}
        >
          {navMenu.map((item) => (
            <div
              key={item.code}
              style={{
                padding: "24px 20px",
                background: theme.cardBg,
                border: `1px solid ${theme.cardBorder}`,
                borderRadius: 14,
                cursor: "pointer",
                transition: "all 300ms ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = theme.primary;
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = theme.cardShadowHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = theme.cardBorder;
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: theme.primarySoft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 12,
                  fontSize: 16,
                  color: theme.primary,
                }}
              >
                ✦
              </div>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  color: theme.text,
                  marginBottom: 4,
                  fontFamily: theme.fontBody,
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: theme.textSubtle,
                  fontFamily: "monospace",
                  letterSpacing: "0.02em",
                }}
              >
                {item.path}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STATS — Luxury serif numerics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <StatCard
          label={`Active ${term("lead")}s`}
          value="142"
          change="+12.4%"
          theme={theme}
        />
        <StatCard
          label={`${term("customer")}s this month`}
          value="28"
          change="+3.1%"
          theme={theme}
        />
        <StatCard
          label={`Open ${term("deal")}s`}
          value="₹12.4L"
          change="+14.2%"
          theme={theme}
        />
        <StatCard
          label="Conversion rate"
          value="18.4%"
          change="+1.1%"
          theme={theme}
        />
      </div>

      {/* FOOTER PLACEHOLDER */}
      <div
        style={{
          padding: "32px 40px",
          background: theme.cardBg,
          border: `1px solid ${theme.cardBorder}`,
          borderRadius: 14,
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontSize: 16,
            color: theme.textMuted,
            fontStyle: "italic",
            fontFamily: theme.fontHeading,
            margin: 0,
            lineHeight: 1.7,
          }}
        >
          Day 3 will populate this dashboard with real data,
          <br />
          charts, recent activity, and AI-powered insights.
        </p>
      </div>
    </div>
  );
}

// ── StatCard ──────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  change: string;
  theme: ReturnType<typeof useActiveCompany>["theme"];
}

function StatCard({ label, value, change, theme }: StatCardProps) {
  return (
    <div
      style={{
        padding: "28px",
        background: theme.cardBg,
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: 14,
        transition: "all 300ms ease",
        boxShadow: theme.cardShadow,
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = theme.cardShadowHover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = theme.cardShadow;
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: theme.textSubtle,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: 12,
          fontFamily: theme.fontBody,
        }}
      >
        {label}
      </div>

      {/* Playfair serif numeric */}
      <div
        style={{
          fontFamily: theme.fontHeading,
          fontSize: 42,
          fontWeight: 500,
          color: theme.primary,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          marginBottom: 8,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 12,
          color: theme.success,
          fontWeight: 500,
          fontFamily: theme.fontBody,
        }}
      >
        ↗ {change}
      </div>
    </div>
  );
}
