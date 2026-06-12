"use client";

import { useEffect, useState } from "react";

import { Typography, Icon } from "@/components/ui";

import { registrationService } from "../services/registration.service";

interface IndustryOption {
  id: string;
  typeCode: string;
  typeName: string;
  description?: string;
  icon?: string;
  colorTheme?: string;
  industryCategory: string;
  isDefault?: boolean;
}

interface IndustrySelectorProps {
  selectedCode?: string;
  onSelect: (code: string) => void;
}

const CATEGORY_ORDER = [
  "TRADING",
  "SERVICES",
  "MANUFACTURING",
  "TECHNOLOGY",
  "HEALTHCARE",
  "EDUCATION",
  "HOSPITALITY",
  "OTHER",
];

const CATEGORY_LABELS: Record<string, string> = {
  TRADING: "Trading & Retail",
  SERVICES: "Services",
  MANUFACTURING: "Manufacturing",
  TECHNOLOGY: "Technology",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  HOSPITALITY: "Hospitality",
  OTHER: "Other Industries",
};

const FALLBACK_ICONS: Record<string, string> = {
  TRADING: "store",
  SERVICES: "briefcase",
  MANUFACTURING: "factory",
  TECHNOLOGY: "cpu",
  HEALTHCARE: "activity",
  EDUCATION: "book-open",
  HOSPITALITY: "building",
  OTHER: "globe",
};

export function IndustrySelector({ selectedCode, onSelect }: IndustrySelectorProps) {
  const [industries, setIndustries] = useState<IndustryOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationService
      .getBusinessTypes()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setIndustries(list);
        // Auto-select default industry if none selected
        if (!selectedCode) {
          const defaultType = list.find((i) => i.isDefault);
          if (defaultType) onSelect(defaultType.typeCode);
        }
      })
      .catch(() => setIndustries([]))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  if (industries.length === 0) {
    return (
      <div className="text-center py-8">
        <Typography variant="text" color="muted">
          No industry types available.
        </Typography>
      </div>
    );
  }

  // Group by category
  const grouped: Record<string, IndustryOption[]> = {};
  for (const ind of industries) {
    const cat = ind.industryCategory || "OTHER";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(ind);
  }

  const categories = CATEGORY_ORDER.filter((c) => grouped[c]?.length);
  // Add any ungrouped categories
  for (const cat of Object.keys(grouped)) {
    if (!categories.includes(cat)) categories.push(cat);
  }

  return (
    <div className="space-y-4" style={{ maxHeight: "380px", overflowY: "auto", paddingRight: 4 }}>
      <Typography variant="text" color="muted" size="13px" className="text-center">
        Select the industry that best describes your business
      </Typography>

      {categories.map((cat) => (
        <div key={cat}>
          <div
            className="mb-2"
            style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600, color: "var(--text-muted, #94a3b8)" }}
          >
            {CATEGORY_LABELS[cat] || cat}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "8px",
            }}
          >
            {grouped[cat].map((ind) => {
              const isSelected = selectedCode === ind.typeCode;
              return (
                <div
                  key={ind.typeCode}
                  onClick={() => onSelect(ind.typeCode)}
                  style={{
                    border: isSelected
                      ? "2px solid var(--color-primary)"
                      : "1px solid var(--border-color, #e2e8f0)",
                    borderRadius: "var(--radius-md, 8px)",
                    padding: "12px",
                    cursor: "pointer",
                    background: isSelected
                      ? "var(--color-primary-light, rgba(59,130,246,0.05))"
                      : "var(--surface-bg, #fff)",
                    transition: "all 0.2s ease",
                    textAlign: "center",
                  }}
                >
                  <div
                    className="mb-1"
                    style={{
                      color: isSelected
                        ? "var(--color-primary)"
                        : "var(--text-muted, #94a3b8)",
                    }}
                  >
                    <Icon
                      name={(ind.icon || FALLBACK_ICONS[cat] || "building") as any}
                      size={24}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? "var(--color-primary)" : "var(--text-primary)",
                      lineHeight: 1.3,
                    }}
                  >
                    {ind.typeName}
                  </div>
                  {ind.isDefault && (
                    <div
                      style={{
                        fontSize: "10px",
                        color: "var(--color-primary)",
                        marginTop: 2,
                      }}
                    >
                      Default
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
