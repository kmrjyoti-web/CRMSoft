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
  const { theme, company, brandConfig } = useActiveCompany();

  const vertical = company?.verticalCode ?? "SOFTWARE";
  const terms = VERTICAL_TERMINOLOGY[vertical] ?? VERTICAL_TERMINOLOGY.SOFTWARE;
  const term = (key: string) => terms[key] ?? key;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Hero welcome card */}
      <div
        className="rounded-xl p-8 mb-8"
        style={{
          background: `linear-gradient(135deg, ${theme.primary}18 0%, ${theme.secondary}0a 100%)`,
          border: `1px solid ${theme.primary}33`,
        }}
      >
        <h1
          className="text-3xl font-semibold mb-2"
          style={{ color: theme.primary, fontFamily: theme.fontHeading }}
        >
          Welcome to {company?.name}
        </h1>
        <p style={{ color: theme.text, opacity: 0.6 }}>
          {brandConfig?.name ?? "CRMSoft"} · {vertical} workspace
        </p>
      </div>

      {/* Stats with vertical terminology */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label={`Active ${term("lead")}s`}
          value="142"
          theme={theme}
        />
        <StatCard
          label={`${term("customer")}s this month`}
          value="28"
          theme={theme}
        />
        <StatCard
          label={`Open ${term("deal")}s`}
          value="₹12.4L"
          theme={theme}
        />
      </div>

      {/* Quick nav */}
      <div>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: theme.text, opacity: 0.8 }}
        >
          Quick navigation
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: `${term("lead")}s`, path: "/leads" },
            { label: `${term("customer")}s`, path: "/contacts" },
            { label: "Activities", path: "/activities" },
            { label: "Reports", path: "/reports" },
          ].map((item) => (
            <div
              key={item.path}
              className="p-4 rounded-lg cursor-pointer transition-opacity hover:opacity-80"
              style={{
                background: `${theme.primary}10`,
                border: `1px solid ${theme.primary}22`,
              }}
            >
              <div
                className="font-medium text-sm"
                style={{ color: theme.text }}
              >
                {item.label}
              </div>
              <div className="text-xs mt-0.5" style={{ opacity: 0.4, color: theme.text }}>
                {item.path}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof useActiveCompany>["theme"];
}) {
  return (
    <div
      className="p-5 rounded-lg"
      style={{
        background: `${theme.primary}08`,
        border: `1px solid ${theme.primary}22`,
      }}
    >
      <div
        className="text-xs uppercase tracking-wider mb-2"
        style={{ color: theme.text, opacity: 0.5 }}
      >
        {label}
      </div>
      <div
        className="text-2xl font-semibold"
        style={{ color: theme.primary }}
      >
        {value}
      </div>
    </div>
  );
}
